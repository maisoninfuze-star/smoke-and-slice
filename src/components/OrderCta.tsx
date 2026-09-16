"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { STORE } from "@/lib/store";
import { DeliveryPartners } from "./DeliveryPartners";

export function OrderCta() {
  const { lang } = useCart();

  return (
    <section className="border-t border-cream/10 px-4 py-20">
      <div className="mx-auto max-w-3xl text-center">
        <h2 className="display text-4xl sm:text-5xl">
          {lang === "fr" ? (
            <>Prêt à <span className="ember-text">commander</span>?</>
          ) : (
            <>Ready to <span className="ember-text">order</span>?</>
          )}
        </h2>
        <p className="mt-4 text-cream/70">
          {!STORE.onlineOrdering
            ? lang === "fr"
              ? "Appelez-nous pour commander à emporter, ou faites-vous livrer via nos partenaires."
              : "Call us to order for pickup, or get it delivered through our partners."
            : STORE.deliveryEnabled
            ? lang === "fr"
              ? "Livraison partout dans NDG et les quartiers voisins, ou ramassage au comptoir."
              : "Delivery across NDG and the neighbouring boroughs, or counter pickup."
            : lang === "fr"
              ? "Commandez en ligne pour ramassage au comptoir, ou faites-vous livrer via nos partenaires."
              : "Order online for counter pickup, or get it delivered through our partners."}
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          {STORE.onlineOrdering ? (
            <Link href="/menu" className="btn-ember inline-block rounded-full px-9 py-3.5 text-sm">
              {lang === "fr" ? "Commander pour ramassage" : "Order for pickup"}
            </Link>
          ) : (
            <a href={`tel:${STORE.phone}`} className="btn-ember inline-block rounded-full px-9 py-3.5 text-sm">
              {lang === "fr" ? "Appeler" : "Call"} · {STORE.phoneDisplay}
            </a>
          )}
          <DeliveryPartners align="center" />
        </div>
      </div>
    </section>
  );
}
