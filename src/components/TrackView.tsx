"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCart } from "./CartProvider";
import { formatMoney } from "@/lib/money";
import { STORE } from "@/lib/store";

type Order = {
  orderNumber: string;
  status: string;
  fulfilment: string;
  contactName: string;
  etaAt: string | null;
  subtotalCents: number;
  deliveryCents: number;
  tipCents: number;
  tpsCents: number;
  tvqCents: number;
  totalCents: number;
  paymentMethod: string;
  uberTrackingUrl: string | null;
  courierName: string | null;
  items: { name: string; qty: number; lineTotalCents: number; options: { name: string }[] }[];
};

const STEPS = [
  { key: "PENDING", fr: "Reçue", en: "Received" },
  { key: "CONFIRMED", fr: "Confirmée", en: "Confirmed" },
  { key: "PREPARING", fr: "En préparation", en: "In the kitchen" },
  { key: "READY", fr: "Prête", en: "Ready" },
  { key: "DISPATCHED", fr: "En route", en: "On the way" },
  { key: "DELIVERED", fr: "Livrée", en: "Delivered" },
];

export function TrackView({ orderId }: { orderId: string }) {
  const { lang } = useCart();
  const [order, setOrder] = useState<Order | null>(null);
  const [notFound, setNotFound] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      try {
        const res = await fetch(`/api/orders/${orderId}`);
        if (res.status === 404) {
          if (!cancelled) setNotFound(true);
          return;
        }
        const data = await res.json();
        if (!cancelled) setOrder(data.order);
      } catch {
        /* keep the last good snapshot on a transient failure */
      }
    };

    load();
    // Poll while the order is still moving.
    const timer = setInterval(load, 20_000);
    return () => {
      cancelled = true;
      clearInterval(timer);
    };
  }, [orderId]);

  if (notFound) {
    return (
      <div className="mx-auto max-w-md px-4 py-24 text-center">
        <h1 className="display text-3xl">{lang === "fr" ? "Commande introuvable" : "Order not found"}</h1>
        <p className="mt-3 text-sm text-smoke">
          {lang === "fr" ? "Vérifiez le numéro et réessayez." : "Check the number and try again."}
        </p>
        <Link href="/track" className="btn-ghost mt-6 inline-block rounded-full px-6 py-2.5 text-sm">
          {lang === "fr" ? "Réessayer" : "Try again"}
        </Link>
      </div>
    );
  }

  if (!order) {
    return <div className="px-4 py-32 text-center text-smoke">{lang === "fr" ? "Chargement…" : "Loading…"}</div>;
  }

  const isPickup = order.fulfilment === "PICKUP";
  const steps = isPickup ? STEPS.filter((s) => s.key !== "DISPATCHED" && s.key !== "DELIVERED") : STEPS;
  const currentIndex = steps.findIndex((s) => s.key === order.status);
  const cancelled = order.status === "CANCELLED";

  return (
    <div className="mx-auto max-w-2xl px-4 py-14">
      <p className="strip text-[11px] text-smoke">{lang === "fr" ? "Commande" : "Order"}</p>
      <h1 className="display mt-1 text-4xl">
        <span className="ember-text">{order.orderNumber}</span>
      </h1>
      <p className="mt-2 text-sm text-cream/70">
        {order.contactName} ·{" "}
        {isPickup
          ? lang === "fr" ? "Ramassage au comptoir" : "Counter pickup"
          : lang === "fr" ? "Livraison" : "Delivery"}
      </p>

      {cancelled ? (
        <div className="mt-8 rounded-xl border border-flame/40 bg-flame/10 px-5 py-4 text-sm text-flame">
          {lang === "fr" ? "Cette commande a été annulée." : "This order was cancelled."}
        </div>
      ) : (
        <ol className="mt-10 space-y-0">
          {steps.map((step, i) => {
            const done = currentIndex >= 0 && i <= currentIndex;
            const active = i === currentIndex;
            return (
              <li key={step.key} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={`flex h-7 w-7 items-center justify-center rounded-full border text-[11px] ${
                      done ? "border-transparent ember-bg text-charcoal-deep" : "border-cream/20 text-smoke"
                    }`}
                  >
                    {done ? "✓" : i + 1}
                  </span>
                  {i < steps.length - 1 && (
                    <span className={`w-px flex-1 ${done ? "bg-ember/60" : "bg-cream/12"}`} style={{ minHeight: 34 }} />
                  )}
                </div>
                <div className="pb-7">
                  <p className={`accent text-sm ${active ? "text-gold" : done ? "text-cream" : "text-smoke"}`}>
                    {lang === "fr" ? step.fr : step.en}
                  </p>
                  {active && order.etaAt && (
                    <p className="mt-1 text-xs text-smoke">
                      {lang === "fr" ? "Arrivée prévue" : "Expected"}{" "}
                      {new Date(order.etaAt).toLocaleTimeString(lang === "fr" ? "fr-CA" : "en-CA", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </p>
                  )}
                </div>
              </li>
            );
          })}
        </ol>
      )}

      {order.courierName && (
        <div className="card mt-2 flex items-center justify-between gap-4 p-4">
          <div>
            <p className="accent text-sm text-gold">{lang === "fr" ? "Votre livreur" : "Your courier"}</p>
            <p className="mt-0.5 text-sm">{order.courierName}</p>
          </div>
          {order.uberTrackingUrl && (
            <a
              href={order.uberTrackingUrl}
              target="_blank"
              rel="noreferrer"
              className="btn-ghost rounded-full px-4 py-2 text-xs"
            >
              {lang === "fr" ? "Carte en direct" : "Live map"}
            </a>
          )}
        </div>
      )}

      {isPickup && (
        <div className="card mt-2 p-5">
          <p className="accent text-sm text-gold">{lang === "fr" ? "À récupérer au" : "Pick up at"}</p>
          <a href={STORE.mapsUrl} target="_blank" rel="noreferrer" className="mt-1 block text-sm hover:text-gold">
            {STORE.address}
          </a>
          <a href={`tel:${STORE.phone}`} className="mt-2 block text-sm text-smoke hover:text-gold">
            {STORE.phoneDisplay}
          </a>
        </div>
      )}

      <div className="card mt-6 p-5">
        <h2 className="accent text-sm text-gold">{lang === "fr" ? "Détail" : "Details"}</h2>
        <ul className="mt-3 space-y-2 text-sm">
          {order.items.map((it, i) => (
            <li key={i} className="flex justify-between gap-3">
              <span>
                <span className="accent text-gold">{it.qty}×</span> {it.name}
                {it.options.length > 0 && (
                  <span className="mt-0.5 block text-xs text-smoke">
                    {it.options.map((o) => o.name).join(" · ")}
                  </span>
                )}
              </span>
              <span className="shrink-0 text-cream/85">{formatMoney(it.lineTotalCents, lang)}</span>
            </li>
          ))}
        </ul>
        <div className="mt-4 space-y-1.5 border-t border-cream/10 pt-3 text-sm">
          <Row label={lang === "fr" ? "Sous-total" : "Subtotal"} value={formatMoney(order.subtotalCents, lang)} />
          {order.deliveryCents > 0 && (
            <Row label={lang === "fr" ? "Livraison" : "Delivery"} value={formatMoney(order.deliveryCents, lang)} />
          )}
          <Row label={lang === "fr" ? "TPS" : "GST"} value={formatMoney(order.tpsCents, lang)} />
          <Row label={lang === "fr" ? "TVQ" : "QST"} value={formatMoney(order.tvqCents, lang)} />
          {order.tipCents > 0 && (
            <Row label={lang === "fr" ? "Pourboire" : "Tip"} value={formatMoney(order.tipCents, lang)} />
          )}
        </div>
        <div className="mt-3 flex items-baseline justify-between border-t border-cream/10 pt-3">
          <span className="accent text-sm text-gold">Total</span>
          <span className="display text-2xl">{formatMoney(order.totalCents, lang)}</span>
        </div>
        <p className="mt-2 text-xs text-smoke">
          {order.paymentMethod === "CASH"
            ? lang === "fr" ? "À payer à la réception." : "Payable on receipt."
            : lang === "fr" ? "Payé par carte." : "Paid by card."}
        </p>
      </div>
    </div>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between">
      <span className="text-smoke">{label}</span>
      <span className="text-cream/85">{value}</span>
    </div>
  );
}
