"use client";

import { useCallback, useEffect, useState } from "react";
import { formatMoney } from "@/lib/money";

type AdminOrder = {
  id: string;
  orderNumber: string;
  status: string;
  fulfilment: string;
  contactName: string;
  contactPhone: string;
  address: string | null;
  totalCents: number;
  paymentMethod: string;
  paymentStatus: string;
  uberDeliveryId: string | null;
  uberTrackingUrl: string | null;
  createdAt: string;
  items: { name: string; qty: number; options: { name: string }[] }[];
};

const FILTERS = ["ALL", "PENDING", "CONFIRMED", "PREPARING", "READY", "DISPATCHED", "COMPLETED"] as const;

const NEXT_STATUS: Record<string, string> = {
  PENDING: "CONFIRMED",
  CONFIRMED: "PREPARING",
  PREPARING: "READY",
  READY: "COMPLETED",
  DISPATCHED: "DELIVERED",
};

const STATUS_STYLE: Record<string, string> = {
  PENDING: "border-gold/50 bg-gold/10 text-gold",
  CONFIRMED: "border-ember/50 bg-ember/10 text-ember",
  PREPARING: "border-ember/50 bg-ember/10 text-ember",
  READY: "border-halal/50 bg-halal/10 text-halal",
  DISPATCHED: "border-halal/50 bg-halal/10 text-halal",
  DELIVERED: "border-cream/20 text-cream/70",
  COMPLETED: "border-cream/20 text-cream/70",
  CANCELLED: "border-flame/50 bg-flame/10 text-flame",
};

export function AdminDashboard() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [filter, setFilter] = useState<(typeof FILTERS)[number]>("ALL");
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/admin/orders?status=${filter}`);
      if (!res.ok) return;
      const data = await res.json();
      setOrders(data.orders);
    } catch {
      /* keep last snapshot */
    }
  }, [filter]);

  useEffect(() => {
    load();
    const timer = setInterval(load, 15_000);
    return () => clearInterval(timer);
  }, [load]);

  async function act(id: string, action: "SET_STATUS" | "DISPATCH_UBER", status?: string) {
    setBusy(id);
    setError(null);
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, status }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(
          data.error === "UBER_NOT_CONFIGURED"
            ? "Uber Direct n'est pas configuré — ajoutez les clés dans .env.local."
            : (data.detail ?? data.error ?? "Action échouée")
        );
        return;
      }
      await load();
    } catch {
      setError("Erreur réseau.");
    } finally {
      setBusy(null);
    }
  }

  return (
    <div className="mx-auto max-w-5xl px-4 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <h1 className="display text-4xl">
          Tableau de <span className="ember-text">bord</span>
        </h1>
        <button onClick={load} className="btn-ghost rounded-full px-5 py-2 text-sm">
          Rafraîchir
        </button>
      </div>

      <div className="no-scrollbar mt-7 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`accent shrink-0 rounded-full border px-4 py-1.5 text-xs transition-colors ${
              filter === f ? "border-ember bg-ember/15 text-cream" : "border-cream/15 text-cream/60"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {error && <p className="mt-5 rounded-lg bg-flame/15 px-4 py-2.5 text-sm text-flame">{error}</p>}

      {orders.length === 0 ? (
        <p className="mt-12 text-center text-smoke">Aucune commande.</p>
      ) : (
        <ul className="mt-6 space-y-3">
          {orders.map((o) => (
            <li key={o.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="accent text-lg text-gold">{o.orderNumber}</span>
                    <span
                      className={`accent rounded-full border px-2 py-0.5 text-[10px] ${
                        STATUS_STYLE[o.status] ?? "border-cream/20"
                      }`}
                    >
                      {o.status}
                    </span>
                    <span className="accent rounded-full border border-cream/20 px-2 py-0.5 text-[10px] text-cream/60">
                      {o.fulfilment}
                    </span>
                  </div>
                  <p className="mt-1.5 text-sm">
                    {o.contactName} ·{" "}
                    <a href={`tel:${o.contactPhone}`} className="text-smoke hover:text-gold">
                      {o.contactPhone}
                    </a>
                  </p>
                  {o.address && <p className="mt-0.5 text-sm text-smoke">{o.address}</p>}
                  <p className="mt-0.5 text-xs text-smoke">
                    {new Date(o.createdAt).toLocaleString("fr-CA")}
                  </p>
                </div>
                <div className="text-right">
                  <p className="display text-xl">{formatMoney(o.totalCents, "fr")}</p>
                  <p className="mt-0.5 text-xs text-smoke">
                    {o.paymentMethod} · {o.paymentStatus}
                  </p>
                </div>
              </div>

              <ul className="mt-4 space-y-1 border-t border-cream/10 pt-3 text-sm">
                {o.items.map((it, i) => (
                  <li key={i}>
                    <span className="accent text-gold">{it.qty}×</span> {it.name}
                    {it.options.length > 0 && (
                      <span className="text-smoke"> — {it.options.map((x) => x.name).join(", ")}</span>
                    )}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap gap-2">
                {NEXT_STATUS[o.status] && (
                  <button
                    disabled={busy === o.id}
                    onClick={() => act(o.id, "SET_STATUS", NEXT_STATUS[o.status])}
                    className="btn-ember rounded-full px-5 py-2 text-xs"
                  >
                    → {NEXT_STATUS[o.status]}
                  </button>
                )}

                {o.fulfilment === "DELIVERY" && !o.uberDeliveryId && (
                  <button
                    disabled={busy === o.id}
                    onClick={() => act(o.id, "DISPATCH_UBER")}
                    className="btn-ghost rounded-full px-5 py-2 text-xs"
                  >
                    Envoyer un livreur Uber
                  </button>
                )}

                {o.uberTrackingUrl && (
                  <a
                    href={o.uberTrackingUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="btn-ghost rounded-full px-5 py-2 text-xs"
                  >
                    Suivi Uber
                  </a>
                )}

                {o.status !== "CANCELLED" && (
                  <button
                    disabled={busy === o.id}
                    onClick={() => act(o.id, "SET_STATUS", "CANCELLED")}
                    className="rounded-full border border-flame/40 px-5 py-2 text-xs text-flame hover:bg-flame/10"
                  >
                    Annuler
                  </button>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
