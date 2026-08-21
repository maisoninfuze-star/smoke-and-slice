"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { formatMoney } from "@/lib/money";
import { t } from "@/lib/i18n";
import { LogoutButton } from "./LogoutButton";

type Order = {
  id: string;
  orderNumber: string;
  status: string;
  fulfilment: string;
  itemCount: number;
  totalCents: number;
  createdAt: string;
};

/** Order status shown in the customer's own language, not the database's. */
const STATUS: Record<string, { fr: string; en: string }> = {
  PENDING: { fr: "Reçue", en: "Received" },
  CONFIRMED: { fr: "Confirmée", en: "Confirmed" },
  PREPARING: { fr: "En préparation", en: "In the kitchen" },
  READY: { fr: "Prête", en: "Ready" },
  DISPATCHED: { fr: "En route", en: "On the way" },
  DELIVERED: { fr: "Livrée", en: "Delivered" },
  COMPLETED: { fr: "Complétée", en: "Completed" },
  CANCELLED: { fr: "Annulée", en: "Cancelled" },
};

export function AccountView({
  user,
  orders,
}: {
  user: { name: string; email: string; role: string };
  orders: Order[];
}) {
  const { lang } = useCart();
  const copy = t(lang);
  const locale = lang === "fr" ? "fr-CA" : "en-CA";

  return (
    <div className="mx-auto max-w-3xl px-4 py-14">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="display text-4xl">
            {lang === "fr" ? "Bonjour, " : "Hello, "}
            <span className="ember-text">{user.name.split(" ")[0]}</span>
          </h1>
          <p className="mt-2 text-sm text-smoke">{user.email}</p>
        </div>
        <div className="flex gap-2">
          {user.role === "ADMIN" && (
            <Link href="/admin" className="btn-ghost rounded-full px-5 py-2.5 text-sm">
              {copy.nav.admin}
            </Link>
          )}
          <LogoutButton />
        </div>
      </div>

      <h2 className="accent mt-12 text-sm text-gold">
        {lang === "fr" ? "Mes commandes" : "My orders"}
      </h2>

      {orders.length === 0 ? (
        <div className="card mt-4 p-8 text-center">
          <p className="text-smoke">
            {lang === "fr" ? "Aucune commande pour l'instant." : "No orders yet."}
          </p>
          <Link href="/menu" className="btn-ember mt-5 inline-block rounded-full px-6 py-2.5 text-sm">
            {copy.nav.menu}
          </Link>
        </div>
      ) : (
        <ul className="mt-4 space-y-3">
          {orders.map((o) => (
            <li key={o.id}>
              <Link href={`/track/${o.orderNumber}`} className="card card-hover flex items-center gap-4 p-4">
                <div className="flex-1">
                  <p className="accent text-gold">{o.orderNumber}</p>
                  <p className="mt-0.5 text-sm text-cream/75">
                    {o.itemCount}{" "}
                    {lang === "fr"
                      ? `article${o.itemCount > 1 ? "s" : ""}`
                      : `item${o.itemCount > 1 ? "s" : ""}`}{" "}
                    ·{" "}
                    {o.fulfilment === "PICKUP" ? copy.common.pickup : copy.common.deliveryMode} ·{" "}
                    {new Date(o.createdAt).toLocaleDateString(locale)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="accent">{formatMoney(o.totalCents, lang)}</p>
                  <p className="mt-0.5 text-xs text-smoke">
                    {STATUS[o.status]?.[lang] ?? o.status}
                  </p>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
