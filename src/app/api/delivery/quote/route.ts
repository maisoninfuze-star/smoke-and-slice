import { NextResponse } from "next/server";
import { z } from "zod";
import { createQuote, formatAddress, uberConfigured, UberDirectError } from "@/lib/uber";

const schema = z.object({
  line1: z.string().min(3),
  line2: z.string().optional(),
  city: z.string().optional(),
  province: z.string().optional(),
  postal: z.string().min(6),
  phone: z.string().optional(),
});

/** Flat fallback used when Uber Direct credentials aren't configured yet. */
const FALLBACK_FEE_CENTS = 599;

export async function POST(req: Request) {
  const parsed = schema.safeParse(await req.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: "INVALID_ADDRESS" }, { status: 400 });
  }

  if (!uberConfigured()) {
    return NextResponse.json({
      quoteId: null,
      feeCents: FALLBACK_FEE_CENTS,
      etaMinutes: 35,
      source: "fallback",
      note: "Uber Direct not configured — showing a flat delivery fee.",
    });
  }

  try {
    const quote = await createQuote({
      dropoffAddress: formatAddress(parsed.data),
      dropoffPhone: parsed.data.phone,
    });

    const etaMinutes = quote.dropoff_eta
      ? Math.max(1, Math.round((new Date(quote.dropoff_eta).getTime() - Date.now()) / 60000))
      : Math.round((quote.duration ?? 0) + (quote.pickup_duration ?? 0));

    return NextResponse.json({
      quoteId: quote.id,
      feeCents: quote.fee,
      etaMinutes,
      expiresAt: quote.expires,
      source: "uber",
    });
  } catch (err) {
    if (err instanceof UberDirectError) {
      // Address outside the delivery zone is a normal outcome, not a server fault.
      const outOfRange =
        err.code === "address_undeliverable" || err.code === "unknown_location" || err.status === 400;
      return NextResponse.json(
        { error: outOfRange ? "OUT_OF_RANGE" : "QUOTE_FAILED", detail: err.message },
        { status: outOfRange ? 422 : 502 }
      );
    }
    return NextResponse.json({ error: "QUOTE_FAILED" }, { status: 502 });
  }
}
