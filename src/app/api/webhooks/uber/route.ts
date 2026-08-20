import { NextResponse } from "next/server";
import { db } from "@/lib/db";
import { verifyWebhook, mapUberStatus } from "@/lib/uber";

/**
 * Uber Direct delivery status webhook.
 * Configure the endpoint + shared secret in the Uber developer dashboard,
 * then set UBER_WEBHOOK_SECRET to the same value.
 */
export async function POST(req: Request) {
  const raw = await req.text();
  const signature = req.headers.get("x-postmates-signature") ?? req.headers.get("x-uber-signature");

  if (!verifyWebhook(raw, signature)) {
    return NextResponse.json({ error: "INVALID_SIGNATURE" }, { status: 401 });
  }

  let payload: {
    kind?: string;
    status?: string;
    delivery_id?: string;
    data?: {
      id?: string;
      status?: string;
      tracking_url?: string;
      dropoff_eta?: string;
      courier?: { name?: string; phone_number?: string; location?: { lat: number; lng: number } };
    };
  };
  try {
    payload = JSON.parse(raw);
  } catch {
    return NextResponse.json({ error: "BAD_JSON" }, { status: 400 });
  }

  const deliveryId = payload.delivery_id ?? payload.data?.id;
  if (!deliveryId) return NextResponse.json({ ok: true, ignored: "no delivery id" });

  const order = await db.order.findFirst({ where: { uberDeliveryId: deliveryId } });
  if (!order) return NextResponse.json({ ok: true, ignored: "unknown delivery" });

  const uberStatus = payload.status ?? payload.data?.status ?? order.uberStatus ?? "";
  const mapped = mapUberStatus(uberStatus);
  const courier = payload.data?.courier;

  await db.order.update({
    where: { id: order.id },
    data: {
      uberStatus,
      uberTrackingUrl: payload.data?.tracking_url ?? order.uberTrackingUrl,
      courierName: courier?.name ?? order.courierName,
      courierPhone: courier?.phone_number ?? order.courierPhone,
      courierLat: courier?.location?.lat ?? order.courierLat,
      courierLng: courier?.location?.lng ?? order.courierLng,
      etaAt: payload.data?.dropoff_eta ? new Date(payload.data.dropoff_eta) : order.etaAt,
      ...(mapped ? { status: mapped } : {}),
      events: { create: { type: "UBER", message: `Uber status: ${uberStatus}`, dataJson: raw.slice(0, 4000) } },
    },
  });

  return NextResponse.json({ ok: true });
}
