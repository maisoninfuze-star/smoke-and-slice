"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { STORE } from "@/lib/store";
import { DeliveryPartners } from "./DeliveryPartners";

/** Shown at /checkout while online ordering is closed. */
export function OrderingClosed() {
  const { lang } = useCart();

  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <p className="strip text-[11px] text-smoke">
        {lang === "fr" ? "Commandes en ligne" : "Online ordering"}
      </p>
      <h1 className="display mt-2 text-4xl sm:text-5xl">
        {lang === "fr" ? (
          <>Bientôt <span className="ember-text">de retour</span></>
        ) : (
          <>Back <span className="ember-text">soon</span></>
        )}
      </h1>
      <p className="mt-5 leading-relaxed text-cream/70">
        {lang === "fr"
          ? "Les commandes en ligne sont fermées pour le moment. Appelez-nous pour commander à emporter, ou faites-vous livrer via nos partenaires."
          : "Online ordering is closed for now. Call us to order for pickup, or get it delivered through our partners."}
      </p>

      <a href={`tel:${STORE.phone}`} className="btn-ember mt-8 inline-block rounded-full px-9 py-3.5 text-sm">
        {lang === "fr" ? "Appeler" : "Call"} · {STORE.phoneDisplay}
      </a>

      <div className="mt-6">
        <DeliveryPartners align="center" />
      </div>

      <Link href="/menu" className="mt-10 inline-block text-sm text-smoke underline underline-offset-4 hover:text-gold">
        {lang === "fr" ? "Voir le menu" : "See the menu"}
      </Link>
    </div>
  );
}
