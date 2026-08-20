"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { formatMoney } from "@/lib/money";
import { STORE } from "@/lib/store";

type Featured = {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  descFr: string | null;
  descEn: string | null;
  priceCents: number;
  image: string | null;
  categorySlug: string;
};

const PILLARS = [
  {
    icon: "🔥",
    fr: { title: "Grillé au feu", body: "Flamme vive, marinade 24 h, jamais de vapeur ni de micro-ondes." },
    en: { title: "Fire grilled", body: "Open flame, 24-hour marinade, never steamed or microwaved." },
  },
  {
    icon: "🥩",
    fr: { title: "100 % halal", body: "Boeuf et poulet certifiés, fournisseurs locaux vérifiés." },
    en: { title: "100% halal", body: "Certified beef and chicken from vetted local suppliers." },
  },
  {
    icon: "🍕",
    fr: { title: "Pâte du jour", body: "Croûte fine étirée à la main chaque matin, jamais congelée." },
    en: { title: "Dough daily", body: "Thin crust hand-stretched every morning, never frozen." },
  },
];

export function HomeSections({ featured }: { featured: Featured[] }) {
  const { lang } = useCart();
  const [broken, setBroken] = useState<Set<string>>(new Set());

  return (
    <>
      <section className="border-y border-cream/10 bg-charcoal/40">
        <div data-stagger className="mx-auto grid max-w-6xl gap-px sm:grid-cols-3">
          {PILLARS.map((p) => {
            const copy = lang === "fr" ? p.fr : p.en;
            return (
              <div key={copy.title} className="px-6 py-10">
                <div className="text-3xl">{p.icon}</div>
                <h3 className="display mt-4 text-xl text-gold">{copy.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-cream/65">{copy.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="px-4 py-20">
        <div className="mx-auto max-w-6xl">
          <div className="flex items-end justify-between gap-6">
            <h2 data-reveal className="display text-4xl sm:text-5xl">
              Les <span className="ember-text">favoris</span>
            </h2>
            <Link href="/menu" className="accent shrink-0 text-sm text-smoke hover:text-gold">
              {lang === "fr" ? "Tout le menu →" : "Full menu →"}
            </Link>
          </div>

          <div data-stagger className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {featured.map((item) => (
              <Link
                key={item.id}
                href={`/menu#${item.categorySlug}`}
                className="card card-hover group overflow-hidden"
              >
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-soft">
                  {item.image && !broken.has(item.id) ? (
                    <Image
                      src={item.image}
                      alt={lang === "fr" ? item.nameFr : item.nameEn}
                      fill
                      sizes="(max-width: 640px) 100vw, 33vw"
                      className="object-cover transition-transform duration-500 group-hover:scale-105"
                      onError={() => setBroken((b) => new Set(b).add(item.id))}
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center text-5xl opacity-25">🔥</div>
                  )}
                  <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-charcoal-deep/90 to-transparent" />
                </div>
                <div className="p-5">
                  <div className="flex items-baseline justify-between gap-3">
                    <h3 className="editorial text-lg">{lang === "fr" ? item.nameFr : item.nameEn}</h3>
                    <span className="accent shrink-0 text-gold">{formatMoney(item.priceCents, lang)}</span>
                  </div>
                  <p className="mt-1.5 text-sm leading-relaxed text-cream/60">
                    {lang === "fr" ? item.descFr : item.descEn}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="border-t border-cream/10 px-4 py-20">
        <div className="mx-auto grid max-w-6xl items-center gap-12 lg:grid-cols-2">
          <div data-reveal className="relative aspect-[4/3] overflow-hidden rounded-[14px] border border-cream/10">
            <Image
              src="/media/storefront.jpg"
              alt={lang === "fr" ? "Devanture de Mr Smoke Et Slice" : "Mr Smoke Et Slice storefront"}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div>
            <h2 className="display text-4xl sm:text-5xl">
              Sur <span className="ember-text">Sherbrooke Ouest</span>
            </h2>
            <p className="mt-5 leading-relaxed text-cream/70">
              {lang === "fr"
                ? "Un comptoir de quartier à NDG, en face du parc. On grille, on étire la pâte, on sert. Terrasse l'été, chiens bienvenus dehors."
                : "A neighbourhood counter in NDG, across from the park. We grill it, stretch the dough, and hand it over. Patio in summer, dogs welcome outside."}
            </p>
            <dl className="mt-8 space-y-3 text-sm">
              <div className="flex gap-3">
                <dt className="accent w-24 shrink-0 text-smoke">{lang === "fr" ? "Adresse" : "Address"}</dt>
                <dd>
                  <a href={STORE.mapsUrl} target="_blank" rel="noreferrer" className="hover:text-gold">
                    5518 Sherbrooke St W, Montréal
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="accent w-24 shrink-0 text-smoke">{lang === "fr" ? "Téléphone" : "Phone"}</dt>
                <dd>
                  <a href={`tel:${STORE.phone}`} className="hover:text-gold">
                    {STORE.phoneDisplay}
                  </a>
                </dd>
              </div>
              <div className="flex gap-3">
                <dt className="accent w-24 shrink-0 text-smoke">{lang === "fr" ? "Heures" : "Hours"}</dt>
                <dd className="text-cream/80">11:00 – 23:00 {lang === "fr" ? "(min. jusqu'à 00:00 ven–sam)" : "(to 00:00 Fri–Sat)"}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>
    </>
  );
}
