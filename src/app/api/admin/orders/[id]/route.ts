import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";
import { createDelivery, formatAddress, uberConfigured, UberDirectError } from "@/lib/uber";

const schema = z.object({
  action: z.enum(["SET_STATUS", "DISPATCH_UBER"]),
  status: z
    .enum(["PENDING", "CONFIRMED", "PREPARING", "READY", "DISPATCHED", "DELIVERED", "COMPLETED", "CANCELLED"])
    .optional(),
});

export async function PATCH(req: Request, ctx: { params: Promise<{ id: string }> }) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const { id } = await ctx.params;
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const order = await db.order.findUnique({ where: { id }, include: { items: true } });
  if (!order) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  if (parsed.data.action === "SET_STATUS") {
    const status = parsed.data.status;
    if (!status) return NextResponse.json({ error: "STATUS_REQUIRED" }, { status: 400 });

    const updated = await db.order.update({
      where: { id },
      data: {
        status,
        events: { create: { type: "STATUS", message: `Status → ${status}` } },
      },
    });
    return NextResponse.json({ order: { id: updated.id, status: updated.status } });
  }

  // --- DISPATCH_UBER ---
  if (order.fulfilment !== "DELIVERY") {
    return NextResponse.json({ error: "NOT_A_DELIVERY" }, { status: 409 });
  }
  if (order.uberDeliveryId) {
    return NextResponse.json({ error: "ALREADY_DISPATCHED", deliveryId: order.uberDeliveryId }, { status: 409 });
  }
  if (!uberConfigured()) {
    return NextResponse.json({ error: "UBER_NOT_CONFIGURED" }, { status: 503 });
  }
  if (!order.addrLine1 || !order.addrPostal) {
    return NextResponse.json({ error: "MISSING_ADDRESS" }, { status: 409 });
  }

  try {
    const delivery = await createDelivery({
      // The stored quote expires after ~5 min; only reuse it if the order is fresh.
      quoteId:
        order.uberQuoteId && Date.now() - order.createdAt.getTime() < 4 * 60_000
          ? order.uberQuoteId
          : undefined,
      orderNumber: order.orderNumber,
      dropoffAddress: formatAddress({
        line1: order.addrLine1,
        line2: order.addrLine2,
        city: order.addrCity,
        province: order.addrProvince,
        postal: order.addrPostal,
      }),
      dropoffName: order.contactName,
      dropoffPhone: order.contactPhone,
      dropoffNotes: order.addrNotes ?? undefined,
      manifestItems: order.items.map((i) => ({
        name: i.nameSnapshot,
        quantity: i.qty,
        price: i.unitPriceCents,
      })),
      manifestTotalCents: order.totalCents,
      tipCents: order.tipCents || undefined,
    });

    const updated = await db.order.update({
      where: { id },
      data: {
        uberDeliveryId: delivery.id,
        uberStatus: delivery.status,
        uberTrackingUrl: delivery.tracking_url,
        status: "DISPATCHED",
        events: {
          create: { type: "UBER", message: `Courier dispatched (${delivery.id})`, dataJson: JSON.stringify(delivery) },
        },
      },
    });

    return NextResponse.json({
      order: { id: updated.id, status: updated.status, trackingUrl: updated.uberTrackingUrl },
    });
  } catch (err) {
    const message = err instanceof UberDirectError ? err.message : "Dispatch failed";
    await db.orderEvent.create({
      data: { orderId: order.id, type: "ERROR", message: `Uber dispatch failed: ${message}` },
    });
    return NextResponse.json({ error: "DISPATCH_FAILED", detail: message }, { status: 502 });
  }
}
