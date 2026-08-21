import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getCurrentUser } from "@/lib/auth";
import { getItem } from "@/lib/menu";
import { computeTotals, orderNumber } from "@/lib/money";
import { createQuote, formatAddress, uberConfigured, UberDirectError } from "@/lib/uber";

const lineSchema = z.object({
  menuItemId: z.string().min(1),
  qty: z.number().int().min(1).max(50),
  optionIds: z.array(z.string()).max(20).default([]),
});

const schema = z.object({
  fulfilment: z.enum(["PICKUP", "DELIVERY"]),
  contactName: z.string().min(2).max(80),
  contactPhone: z.string().min(7).max(30),
  contactEmail: z.string().email().optional().or(z.literal("")),
  paymentMethod: z.enum(["CASH", "CARD"]).default("CASH"),
  tipCents: z.number().int().min(0).max(50_000).default(0),
  notes: z.string().max(500).optional(),
  lines: z.array(lineSchema).min(1).max(60),
  address: z
    .object({
      line1: z.string().min(3),
      line2: z.string().optional(),
      city: z.string().optional(),
      province: z.string().optional(),
      postal: z.string().min(6),
      notes: z.string().max(300).optional(),
    })
    .optional(),
});

const FALLBACK_FEE_CENTS = 599;

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_INPUT", issues: parsed.error.flatten() }, { status: 400 });
  }
  const input = parsed.data;

  if (input.fulfilment === "DELIVERY" && !input.address) {
    return NextResponse.json({ error: "ADDRESS_REQUIRED" }, { status: 400 });
  }

  const settings = await db.storeSetting.findUnique({ where: { id: "singleton" } });
  if (settings && !settings.acceptingOrders) {
    return NextResponse.json({ error: "STORE_CLOSED" }, { status: 409 });
  }

  // --- Re-price everything from the menu file. The client sends ids and
  // quantities only; every price here is read server-side, so a forged price
  // or option in the request body cannot affect the total. ---
  const orderItems: {
    menuItemId: string;
    nameSnapshot: string;
    qty: number;
    unitPriceCents: number;
    optionsJson: string;
    lineTotalCents: number;
  }[] = [];

  let subtotalCents = 0;

  for (const line of input.lines) {
    const item = getItem(line.menuItemId);
    if (!item) return NextResponse.json({ error: "ITEM_UNAVAILABLE", id: line.menuItemId }, { status: 409 });

    const validOptions = new Map(
      item.optionGroups.flatMap((g) => g.options.map((o) => [o.id, o] as const))
    );

    const chosen: { name: string; priceCents: number }[] = [];
    let optionsCents = 0;
    for (const optId of line.optionIds) {
      const opt = validOptions.get(optId);
      if (!opt) return NextResponse.json({ error: "INVALID_OPTION", id: optId }, { status: 409 });
      chosen.push({ name: opt.nameFr, priceCents: opt.priceCents });
      optionsCents += opt.priceCents;
    }

    // Enforce each group's min/max selection rules.
    for (const group of item.optionGroups) {
      const groupOptionIds = new Set(group.options.map((o) => o.id));
      const picked = line.optionIds.filter((id) => groupOptionIds.has(id)).length;
      if (picked < group.minSelect || picked > group.maxSelect) {
        return NextResponse.json(
          { error: "OPTION_RULE_VIOLATION", group: group.nameEn, picked },
          { status: 409 }
        );
      }
    }

    const unitPriceCents = item.priceCents + optionsCents;
    const lineTotalCents = unitPriceCents * line.qty;
    subtotalCents += lineTotalCents;

    orderItems.push({
      menuItemId: item.id,
      nameSnapshot: item.nameFr,
      qty: line.qty,
      unitPriceCents,
      optionsJson: JSON.stringify(chosen),
      lineTotalCents,
    });
  }

  // --- Delivery pricing ---
  let deliveryCents = 0;
  let uberQuoteId: string | null = null;

  if (input.fulfilment === "DELIVERY" && input.address) {
    const minimum = settings?.minDeliveryCents ?? 1500;
    if (subtotalCents < minimum) {
      return NextResponse.json({ error: "BELOW_MINIMUM", minimumCents: minimum }, { status: 422 });
    }

    if (uberConfigured()) {
      try {
        const quote = await createQuote({
          dropoffAddress: formatAddress(input.address),
          dropoffPhone: input.contactPhone,
          pickupReadyMinutes: settings?.prepTimeMinutes ?? 20,
        });
        deliveryCents = quote.fee;
        uberQuoteId = quote.id;
      } catch (err) {
        if (err instanceof UberDirectError && err.status === 400) {
          return NextResponse.json({ error: "OUT_OF_RANGE", detail: err.message }, { status: 422 });
        }
        // Uber is down but the kitchen isn't — take the order at the flat rate.
        deliveryCents = FALLBACK_FEE_CENTS;
      }
    } else {
      deliveryCents = FALLBACK_FEE_CENTS;
    }
  }

  const totals = computeTotals({ subtotalCents, deliveryCents, tipCents: input.tipCents });
  const user = await getCurrentUser();

  const order = await db.order.create({
    data: {
      orderNumber: orderNumber(),
      userId: user?.id ?? null,
      contactName: input.contactName,
      contactPhone: input.contactPhone,
      contactEmail: input.contactEmail || null,
      fulfilment: input.fulfilment,
      status: "PENDING",
      addrLine1: input.address?.line1 ?? null,
      addrLine2: input.address?.line2 ?? null,
      addrCity: input.address?.city ?? "Montréal",
      addrProvince: input.address?.province ?? "QC",
      addrPostal: input.address?.postal ?? null,
      addrNotes: input.address?.notes ?? null,
      ...totals,
      paymentMethod: input.paymentMethod,
      paymentStatus: "UNPAID",
      uberQuoteId,
      notes: input.notes ?? null,
      items: { create: orderItems },
      events: {
        create: {
          type: "CREATED",
          message: `Order placed (${input.fulfilment.toLowerCase()}, ${input.paymentMethod.toLowerCase()})`,
        },
      },
    },
    include: { items: true },
  });

  return NextResponse.json({
    order: {
      id: order.id,
      orderNumber: order.orderNumber,
      status: order.status,
      totalCents: order.totalCents,
      deliveryCents: order.deliveryCents,
      tpsCents: order.tpsCents,
      tvqCents: order.tvqCents,
      fulfilment: order.fulfilment,
    },
  });
}
