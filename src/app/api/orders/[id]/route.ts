import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getDelivery, uberConfigured, mapUberStatus } from "@/lib/uber";
import { rateLimit, clientKey } from "@/lib/rate-limit";

/**
 * Public order lookup. Accepts either the internal id or the human order number
 * so a customer can type "MSS-4F2K9" on the tracking page.
 */
export async function GET(req: Request, ctx: { params: Promise<{ id: string }> }) {
  // Order numbers are five characters, so a script could walk the space and
  // harvest customer names. A tracking page polls every 20s; 60/minute leaves
  // plenty of headroom for real use.
  const limit = rateLimit(clientKey(req, "order-lookup"), 60, 60);
  if (!limit.ok) {
    return NextResponse.json(
      { error: "TOO_MANY_REQUESTS" },
      { status: 429, headers: { "Retry-After": String(limit.retryAfterSeconds) } }
    );
  }

  const { id } = await ctx.params;

  const order = await db.order.findFirst({
    where: { OR: [{ id }, { orderNumber: id.toUpperCase() }] },
    include: { items: true, events: { orderBy: { createdAt: "asc" } } },
  });

  if (!order) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });

  // Refresh courier position from Uber when a delivery is in flight.
  let live = order;
  if (order.uberDeliveryId && uberConfigured() && !["DELIVERED", "CANCELLED", "COMPLETED"].includes(order.status)) {
    try {
      const delivery = await getDelivery(order.uberDeliveryId);
      const mapped = mapUberStatus(delivery.status);
      live = await db.order.update({
        where: { id: order.id },
        data: {
          uberStatus: delivery.status,
          uberTrackingUrl: delivery.tracking_url ?? order.uberTrackingUrl,
          courierName: delivery.courier?.name ?? order.courierName,
          courierPhone: delivery.courier?.phone_number ?? order.courierPhone,
          courierLat: delivery.courier?.location?.lat ?? order.courierLat,
          courierLng: delivery.courier?.location?.lng ?? order.courierLng,
          etaAt: delivery.dropoff_eta ? new Date(delivery.dropoff_eta) : order.etaAt,
          ...(mapped ? { status: mapped } : {}),
        },
        include: { items: true, events: { orderBy: { createdAt: "asc" } } },
      });
    } catch {
      // Tracking refresh is best-effort — fall back to the stored snapshot.
    }
  }

  return NextResponse.json({
    order: {
      id: live.id,
      orderNumber: live.orderNumber,
      status: live.status,
      fulfilment: live.fulfilment,
      contactName: live.contactName,
      createdAt: live.createdAt,
      etaAt: live.etaAt,
      subtotalCents: live.subtotalCents,
      deliveryCents: live.deliveryCents,
      tipCents: live.tipCents,
      tpsCents: live.tpsCents,
      tvqCents: live.tvqCents,
      totalCents: live.totalCents,
      paymentMethod: live.paymentMethod,
      paymentStatus: live.paymentStatus,
      uberTrackingUrl: live.uberTrackingUrl,
      courierName: live.courierName,
      courierLat: live.courierLat,
      courierLng: live.courierLng,
      items: live.items.map((i) => ({
        name: i.nameSnapshot,
        qty: i.qty,
        lineTotalCents: i.lineTotalCents,
        options: JSON.parse(i.optionsJson) as { name: string; priceCents: number }[],
      })),
      events: live.events.map((e) => ({ type: e.type, message: e.message, createdAt: e.createdAt })),
    },
  });
}
