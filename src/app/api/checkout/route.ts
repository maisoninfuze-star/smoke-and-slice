import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getStripe, stripeEnabled } from "@/lib/stripe";

const schema = z.object({ orderId: z.string().min(1) });

/**
 * Creates a Stripe Checkout session for an existing order.
 * The order is already priced server-side, so we bill a single line for the
 * exact total rather than re-deriving it from the cart.
 */
export async function POST(req: Request) {
  if (!stripeEnabled()) {
    return NextResponse.json({ error: "STRIPE_NOT_CONFIGURED" }, { status: 503 });
  }

  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: "INVALID_INPUT" }, { status: 400 });

  const order = await db.order.findUnique({ where: { id: parsed.data.orderId } });
  if (!order) return NextResponse.json({ error: "NOT_FOUND" }, { status: 404 });
  if (order.paymentStatus === "PAID") {
    return NextResponse.json({ error: "ALREADY_PAID" }, { status: 409 });
  }

  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

  const session = await getStripe().checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    client_reference_id: order.id,
    metadata: { orderId: order.id, orderNumber: order.orderNumber },
    ...(order.contactEmail ? { customer_email: order.contactEmail } : {}),
    line_items: [
      {
        quantity: 1,
        price_data: {
          currency: "cad",
          unit_amount: order.totalCents,
          product_data: {
            name: `Mr Smoke Et Slice — ${order.orderNumber}`,
            description:
              order.fulfilment === "DELIVERY"
                ? "Livraison / Delivery (taxes et frais inclus)"
                : "Ramassage / Pickup (taxes incluses)",
          },
        },
      },
    ],
    success_url: `${site}/track/${order.orderNumber}?paid=1`,
    cancel_url: `${site}/track/${order.orderNumber}?cancelled=1`,
  });

  await db.order.update({
    where: { id: order.id },
    data: { stripeSessionId: session.id },
  });

  return NextResponse.json({ url: session.url });
}
