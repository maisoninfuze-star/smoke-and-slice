// Quebec sales tax. GST (TPS) 5% on the subtotal, QST (TVQ) 9.975% on the subtotal.
// Since 2013 QST is no longer compounded on GST, so both apply to the same base.
export const TPS_RATE = 0.05;
export const TVQ_RATE = 0.09975;

export function centsToDollars(cents: number): string {
  return (cents / 100).toFixed(2);
}

export function formatMoney(cents: number, locale: "fr" | "en" = "fr"): string {
  const value = cents / 100;
  return new Intl.NumberFormat(locale === "fr" ? "fr-CA" : "en-CA", {
    style: "currency",
    currency: "CAD",
  }).format(value);
}

export type Totals = {
  subtotalCents: number;
  deliveryCents: number;
  tipCents: number;
  tpsCents: number;
  tvqCents: number;
  totalCents: number;
};

/**
 * Taxes apply to food and to the delivery charge, not to the tip.
 */
export function computeTotals(input: {
  subtotalCents: number;
  deliveryCents?: number;
  tipCents?: number;
}): Totals {
  const subtotalCents = Math.max(0, Math.round(input.subtotalCents));
  const deliveryCents = Math.max(0, Math.round(input.deliveryCents ?? 0));
  const tipCents = Math.max(0, Math.round(input.tipCents ?? 0));

  const taxableBase = subtotalCents + deliveryCents;
  const tpsCents = Math.round(taxableBase * TPS_RATE);
  const tvqCents = Math.round(taxableBase * TVQ_RATE);
  const totalCents = taxableBase + tpsCents + tvqCents + tipCents;

  return { subtotalCents, deliveryCents, tipCents, tpsCents, tvqCents, totalCents };
}

export function orderNumber(): string {
  // Human-readable, phone-friendly: MSS-4F2K9
  const alphabet = "23456789ABCDEFGHJKLMNPQRSTUVWXYZ";
  let out = "";
  const bytes = new Uint8Array(5);
  crypto.getRandomValues(bytes);
  for (const b of bytes) out += alphabet[b % alphabet.length];
  return `MSS-${out}`;
}
