"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart, lineTotal } from "./CartProvider";
import { formatMoney, computeTotals } from "@/lib/money";
import { t } from "@/lib/i18n";

type Quote = { feeCents: number; etaMinutes: number; source: string } | null;
type Me = { id: string; name: string; phone: string | null } | null;

const TIP_PRESETS = [0, 0.1, 0.15, 0.2];

export function CheckoutForm() {
  const { lines, subtotalCents, lang, clear } = useCart();
  const copy = t(lang);
  const router = useRouter();

  const [fulfilment, setFulfilment] = useState<"PICKUP" | "DELIVERY">("DELIVERY");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [email, setEmail] = useState("");
  const [line1, setLine1] = useState("");
  const [line2, setLine2] = useState("");
  const [postal, setPostal] = useState("");
  const [addrNotes, setAddrNotes] = useState("");
  const [notes, setNotes] = useState("");
  const [tipRate, setTipRate] = useState(0.1);
  const [paymentMethod, setPaymentMethod] = useState<"CASH" | "CARD">("CASH");

  const [quote, setQuote] = useState<Quote>(null);
  const [quoting, setQuoting] = useState(false);
  const [quoteError, setQuoteError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debounce = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((d: { user: Me }) => {
        if (d.user) {
          setName((v) => v || d.user!.name);
          setPhone((v) => v || d.user!.phone || "");
        }
      })
      .catch(() => {});
  }, []);

  // Live delivery quote, debounced on the address fields.
  useEffect(() => {
    if (fulfilment !== "DELIVERY") {
      setQuote(null);
      setQuoteError(null);
      return;
    }
    const postalOk = /^[A-Za-z]\d[A-Za-z]\s?\d[A-Za-z]\d$/.test(postal.trim());
    if (line1.trim().length < 4 || !postalOk) {
      setQuote(null);
      return;
    }

    if (debounce.current) clearTimeout(debounce.current);
    debounce.current = setTimeout(async () => {
      setQuoting(true);
      setQuoteError(null);
      try {
        const res = await fetch("/api/delivery/quote", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ line1, line2, postal, phone }),
        });
        const data = await res.json();
        if (!res.ok) {
          setQuote(null);
          setQuoteError(
            data.error === "OUT_OF_RANGE"
              ? lang === "fr"
                ? "Adresse hors de notre zone de livraison."
                : "Address is outside our delivery zone."
              : lang === "fr"
                ? "Impossible d'obtenir un prix de livraison."
                : "Couldn't get a delivery price."
          );
        } else {
          setQuote(data);
        }
      } catch {
        setQuoteError(lang === "fr" ? "Erreur réseau." : "Network error.");
      } finally {
        setQuoting(false);
      }
    }, 600);

    return () => {
      if (debounce.current) clearTimeout(debounce.current);
    };
  }, [line1, line2, postal, phone, fulfilment, lang]);

  const deliveryCents = fulfilment === "DELIVERY" ? (quote?.feeCents ?? 0) : 0;
  const tipCents = Math.round(subtotalCents * tipRate);
  const totals = computeTotals({ subtotalCents, deliveryCents, tipCents });

  const addressReady =
    fulfilment === "PICKUP" || (Boolean(quote) && line1.trim().length > 3 && postal.trim().length >= 6);
  const canSubmit =
    lines.length > 0 && name.trim().length > 1 && phone.trim().length > 6 && addressReady && !submitting;

  async function submit() {
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fulfilment,
          contactName: name,
          contactPhone: phone,
          contactEmail: email,
          paymentMethod,
          tipCents,
          notes,
          lines: lines.map((l) => ({
            menuItemId: l.menuItemId,
            qty: l.qty,
            optionIds: l.options.map((o) => o.id),
          })),
          ...(fulfilment === "DELIVERY"
            ? { address: { line1, line2, postal, notes: addrNotes } }
            : {}),
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "BELOW_MINIMUM"
            ? lang === "fr"
              ? `Minimum de ${formatMoney(data.minimumCents, lang)} pour la livraison.`
              : `Delivery minimum is ${formatMoney(data.minimumCents, lang)}.`
            : data.error === "OUT_OF_RANGE"
              ? lang === "fr"
                ? "Adresse hors zone."
                : "Address out of range."
              : lang === "fr"
                ? "La commande n'a pas pu être créée."
                : "Order could not be created."
        );
        return;
      }
      // Card orders detour through Stripe Checkout before the tracking page.
      if (paymentMethod === "CARD") {
        const pay = await fetch("/api/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.order.id }),
        });
        const payData = await pay.json();
        if (pay.ok && payData.url) {
          clear();
          window.location.href = payData.url;
          return;
        }
        // Payment setup failed, but the order exists — send them to tracking
        // where they can pay on arrival instead of losing the order.
        setError(
          lang === "fr"
            ? "Paiement par carte indisponible — votre commande est enregistrée, payable à la réception."
            : "Card payment unavailable — your order is saved and payable on receipt."
        );
      }

      clear();
      router.push(`/track/${data.order.orderNumber}`);
    } catch {
      setError(lang === "fr" ? "Erreur réseau." : "Network error.");
    } finally {
      setSubmitting(false);
    }
  }

  if (lines.length === 0) {
    return (
      <div className="mx-auto flex max-w-md flex-col items-center gap-5 px-4 py-32 text-center">
        <div className="text-6xl opacity-40">🔥</div>
        <h1 className="display text-3xl">{copy.common.empty}</h1>
        <Link href="/menu" className="btn-ember rounded-full px-7 py-3 text-sm">
          {copy.nav.menu}
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto grid max-w-5xl gap-10 px-4 py-12 lg:grid-cols-[1fr_380px]">
      <div>
        <h1 className="display text-4xl sm:text-5xl">
          Passer la <span className="ember-text">commande</span>
        </h1>

        {/* Fulfilment */}
        <div className="mt-8 grid grid-cols-2 gap-2">
          {(["DELIVERY", "PICKUP"] as const).map((mode) => (
            <button
              key={mode}
              onClick={() => setFulfilment(mode)}
              className={`rounded-xl border px-4 py-4 text-left transition-colors ${
                fulfilment === mode ? "border-ember bg-ember/10" : "border-cream/15 hover:border-cream/30"
              }`}
            >
              <span className="accent block text-sm">
                {mode === "DELIVERY" ? copy.common.deliveryMode : copy.common.pickup}
              </span>
              <span className="mt-1 block text-xs text-smoke">
                {mode === "DELIVERY"
                  ? lang === "fr" ? "Livré par Uber Direct" : "Delivered by Uber Direct"
                  : lang === "fr" ? "Au comptoir, 5518 Sherbrooke O." : "At the counter, 5518 Sherbrooke W."}
              </span>
            </button>
          ))}
        </div>

        {/* Contact */}
        <section className="mt-9">
          <h2 className="accent mb-3 text-sm text-gold">
            {lang === "fr" ? "Vos coordonnées" : "Your details"}
          </h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="field px-4 py-3 text-sm"
              placeholder={lang === "fr" ? "Nom complet" : "Full name"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              autoComplete="name"
            />
            <input
              className="field px-4 py-3 text-sm"
              placeholder={lang === "fr" ? "Téléphone" : "Phone"}
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel"
              inputMode="tel"
            />
            <input
              className="field px-4 py-3 text-sm sm:col-span-2"
              placeholder={lang === "fr" ? "Courriel (pour le reçu)" : "Email (for the receipt)"}
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
              inputMode="email"
            />
          </div>
        </section>

        {/* Address */}
        {fulfilment === "DELIVERY" && (
          <section className="mt-8">
            <h2 className="accent mb-3 text-sm text-gold">
              {lang === "fr" ? "Adresse de livraison" : "Delivery address"}
            </h2>
            <div className="grid gap-3 sm:grid-cols-2">
              <input
                className="field px-4 py-3 text-sm sm:col-span-2"
                placeholder={lang === "fr" ? "Numéro et rue" : "Street address"}
                value={line1}
                onChange={(e) => setLine1(e.target.value)}
                autoComplete="address-line1"
              />
              <input
                className="field px-4 py-3 text-sm"
                placeholder={lang === "fr" ? "App. / étage" : "Apt / floor"}
                value={line2}
                onChange={(e) => setLine2(e.target.value)}
                autoComplete="address-line2"
              />
              <input
                className="field px-4 py-3 text-sm uppercase"
                placeholder="H4A 1W2"
                value={postal}
                onChange={(e) => setPostal(e.target.value)}
                autoComplete="postal-code"
              />
              <input
                className="field px-4 py-3 text-sm sm:col-span-2"
                placeholder={lang === "fr" ? "Code d'entrée, instructions au livreur…" : "Buzzer code, courier instructions…"}
                value={addrNotes}
                onChange={(e) => setAddrNotes(e.target.value)}
              />
            </div>

            <div className="mt-3 min-h-6 text-sm">
              {quoting && <span className="text-smoke">{lang === "fr" ? "Calcul du prix…" : "Getting a price…"}</span>}
              {!quoting && quote && (
                <span className="text-halal">
                  ✓ {formatMoney(quote.feeCents, lang)} · {lang === "fr" ? "environ" : "about"} {quote.etaMinutes}{" "}
                  min
                  {quote.source === "fallback" && (
                    <span className="ml-2 text-smoke">
                      ({lang === "fr" ? "tarif fixe" : "flat rate"})
                    </span>
                  )}
                </span>
              )}
              {!quoting && quoteError && <span className="text-flame">{quoteError}</span>}
            </div>
          </section>
        )}

        {/* Tip */}
        <section className="mt-8">
          <h2 className="accent mb-3 text-sm text-gold">{copy.common.tip}</h2>
          <div className="flex flex-wrap gap-2">
            {TIP_PRESETS.map((rate) => (
              <button
                key={rate}
                onClick={() => setTipRate(rate)}
                className={`rounded-full border px-5 py-2 text-sm transition-colors ${
                  tipRate === rate ? "border-ember bg-ember/10 text-cream" : "border-cream/15 text-cream/70"
                }`}
              >
                {rate === 0 ? (lang === "fr" ? "Aucun" : "None") : `${rate * 100}%`}
              </button>
            ))}
          </div>
        </section>

        {/* Payment */}
        <section className="mt-8">
          <h2 className="accent mb-3 text-sm text-gold">{lang === "fr" ? "Paiement" : "Payment"}</h2>
          <div className="grid gap-2 sm:grid-cols-2">
            <button
              onClick={() => setPaymentMethod("CASH")}
              className={`rounded-xl border px-4 py-3.5 text-left text-sm transition-colors ${
                paymentMethod === "CASH" ? "border-ember bg-ember/10" : "border-cream/15"
              }`}
            >
              <span className="accent block">{lang === "fr" ? "Comptant / débit sur place" : "Cash / debit on arrival"}</span>
              <span className="mt-0.5 block text-xs text-smoke">
                {lang === "fr" ? "Payez au livreur ou au comptoir" : "Pay the courier or at the counter"}
              </span>
            </button>
            <button
              onClick={() => setPaymentMethod("CARD")}
              disabled={process.env.NEXT_PUBLIC_STRIPE_ENABLED !== "true"}
              className={`rounded-xl border px-4 py-3.5 text-left text-sm transition-colors disabled:opacity-40 ${
                paymentMethod === "CARD" ? "border-ember bg-ember/10" : "border-cream/15"
              }`}
            >
              <span className="accent block">{lang === "fr" ? "Carte en ligne" : "Card online"}</span>
              <span className="mt-0.5 block text-xs text-smoke">
                {process.env.NEXT_PUBLIC_STRIPE_ENABLED === "true"
                  ? "Visa · Mastercard · Amex"
                  : lang === "fr" ? "Bientôt disponible" : "Coming soon"}
              </span>
            </button>
          </div>
        </section>

        <textarea
          className="field mt-8 w-full px-4 py-3 text-sm"
          rows={3}
          placeholder={lang === "fr" ? "Notes pour la cuisine (allergies, sans oignon…)" : "Kitchen notes (allergies, no onion…)"}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
        />
      </div>

      {/* Summary */}
      <aside className="lg:sticky lg:top-28 lg:self-start">
        <div className="card p-5">
          <h2 className="display text-xl">{lang === "fr" ? "Votre commande" : "Your order"}</h2>

          <ul className="mt-4 space-y-3 text-sm">
            {lines.map((l) => (
              <li key={l.key} className="flex justify-between gap-3">
                <span className="text-cream/85">
                  <span className="accent text-gold">{l.qty}×</span> {l.name}
                  {l.options.length > 0 && (
                    <span className="mt-0.5 block text-xs text-smoke">
                      {l.options.map((o) => o.name).join(" · ")}
                    </span>
                  )}
                </span>
                <span className="shrink-0 text-cream/85">{formatMoney(lineTotal(l), lang)}</span>
              </li>
            ))}
          </ul>

          <dl className="mt-5 space-y-2 border-t border-cream/10 pt-4 text-sm">
            <Row label={copy.common.subtotal} value={formatMoney(totals.subtotalCents, lang)} />
            {fulfilment === "DELIVERY" && (
              <Row
                label={copy.common.delivery}
                value={quote ? formatMoney(totals.deliveryCents, lang) : "—"}
              />
            )}
            <Row label={copy.common.tps} value={formatMoney(totals.tpsCents, lang)} />
            <Row label={copy.common.tvq} value={formatMoney(totals.tvqCents, lang)} />
            {tipCents > 0 && <Row label={copy.common.tip} value={formatMoney(totals.tipCents, lang)} />}
          </dl>

          <div className="mt-4 flex items-baseline justify-between border-t border-cream/10 pt-4">
            <span className="accent text-sm text-gold">{copy.common.total}</span>
            <span className="display text-2xl">{formatMoney(totals.totalCents, lang)}</span>
          </div>

          {error && <p className="mt-4 rounded-lg bg-flame/15 px-3 py-2 text-sm text-flame">{error}</p>}

          <button onClick={submit} disabled={!canSubmit} className="btn-ember mt-5 w-full rounded-full py-3.5 text-sm">
            {submitting ? copy.common.loading : copy.common.checkout}
          </button>

          <p className="mt-3 text-center text-[11px] leading-relaxed text-smoke">
            {lang === "fr"
              ? "En commandant, vous acceptez d'être joint au sujet de votre commande."
              : "By ordering you agree to be contacted about your order."}
          </p>
        </div>
      </aside>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <dt className="text-smoke">{label}</dt>
      <dd className="text-cream/85">{value}</dd>
    </div>
  );
}
