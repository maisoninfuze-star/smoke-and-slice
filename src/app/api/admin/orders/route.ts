import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    await requireAdmin();
  } catch {
    return NextResponse.json({ error: "UNAUTHORIZED" }, { status: 403 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get("status");

  const orders = await db.order.findMany({
    where: status && status !== "ALL" ? { status } : undefined,
    orderBy: { createdAt: "desc" },
    take: 100,
    include: { items: true },
  });

  return NextResponse.json({
    orders: orders.map((o) => ({
      id: o.id,
      orderNumber: o.orderNumber,
      status: o.status,
      fulfilment: o.fulfilment,
      contactName: o.contactName,
      contactPhone: o.contactPhone,
      address: o.addrLine1 ? `${o.addrLine1}${o.addrLine2 ? ", " + o.addrLine2 : ""}, ${o.addrPostal}` : null,
      totalCents: o.totalCents,
      paymentMethod: o.paymentMethod,
      paymentStatus: o.paymentStatus,
      uberDeliveryId: o.uberDeliveryId,
      uberTrackingUrl: o.uberTrackingUrl,
      createdAt: o.createdAt,
      items: o.items.map((i) => ({
        name: i.nameSnapshot,
        qty: i.qty,
        options: JSON.parse(i.optionsJson) as { name: string }[],
      })),
    })),
  });
}
