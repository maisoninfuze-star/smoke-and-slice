"use client";

import Image from "next/image";
import { useState } from "react";
import { useCart } from "./CartProvider";
import { formatMoney } from "@/lib/money";
import { t } from "@/lib/i18n";
import { ItemDialog, type MenuItemFull } from "./ItemDialog";

export type CategoryFull = {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  descFr: string | null;
  descEn: string | null;
  items: MenuItemFull[];
};

const BADGE_STYLE: Record<string, string> = {
  popular: "border-gold/50 bg-gold/10 text-gold",
  spicy: "border-flame/50 bg-flame/10 text-flame",
  new: "border-ember/50 bg-ember/10 text-ember",
  halal: "border-halal/40 bg-halal/10 text-halal",
  vegetarian: "border-halal/40 bg-halal/10 text-halal",
};

export function MenuBrowser({ categories }: { categories: CategoryFull[] }) {
  const { lang, add } = useCart();
  const copy = t(lang);
  const [active, setActive] = useState<MenuItemFull | null>(null);
  const [flash, setFlash] = useState<string | null>(null);
  // Menu photography is generated separately; hide the frame until an asset exists.
  const [broken, setBroken] = useState<Set<string>>(new Set());

  const quickAdd = (item: MenuItemFull) => {
    if (item.optionGroups.length > 0) {
      setActive(item);
      return;
    }
    add({
      menuItemId: item.id,
      slug: item.slug,
      name: lang === "fr" ? item.nameFr : item.nameEn,
      unitPriceCents: item.priceCents,
      qty: 1,
      options: [],
      image: item.image,
    });
    setFlash(item.id);
    setTimeout(() => setFlash(null), 1200);
  };

  return (
    <div className="mx-auto max-w-6xl px-4 py-12">
      <header className="mb-10">
        <h1 className="display text-5xl sm:text-6xl">
          Le <span className="ember-text">menu</span>
        </h1>
        <p className="mt-3 text-cream/65">
          {lang === "fr"
            ? "Tout est halal. Prix en dollars canadiens, taxes en sus."
            : "Everything is halal. Prices in Canadian dollars, taxes extra."}
        </p>
      </header>

      <nav className="no-scrollbar sticky top-[73px] z-20 -mx-4 mb-10 flex gap-2 overflow-x-auto border-y border-cream/10 bg-charcoal-deep/90 px-4 py-3 backdrop-blur-xl">
        {categories.map((c) => (
          <a
            key={c.id}
            href={`#${c.slug}`}
            className="accent shrink-0 rounded-full border border-cream/15 px-4 py-1.5 text-sm text-cream/75 transition-colors hover:border-gold hover:text-gold"
          >
            {lang === "fr" ? c.nameFr : c.nameEn}
          </a>
        ))}
      </nav>

      <div className="space-y-16">
        {categories.map((cat) => (
          <section key={cat.id} id={cat.slug} className="scroll-mt-36">
            <h2 className="display text-3xl text-gold sm:text-4xl">
              {lang === "fr" ? cat.nameFr : cat.nameEn}
            </h2>
            {(lang === "fr" ? cat.descFr : cat.descEn) && (
              <p className="mt-2 max-w-2xl text-sm text-cream/60">
                {lang === "fr" ? cat.descFr : cat.descEn}
              </p>
            )}

            <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {cat.items.map((item) => {
                const badges = item.badges.split(",").filter(Boolean);
                return (
                  <article key={item.id} className="card card-hover flex flex-col overflow-hidden">
                    {item.image && !broken.has(item.id) && (
                      <button
                        onClick={() => setActive(item)}
                        className="relative aspect-[16/10] w-full overflow-hidden bg-slate-soft"
                        aria-label={lang === "fr" ? item.nameFr : item.nameEn}
                      >
                        <Image
                          src={item.image}
                          alt={lang === "fr" ? item.nameFr : item.nameEn}
                          fill
                          sizes="(max-width: 640px) 100vw, 33vw"
                          className="object-cover"
                          onError={() => setBroken((b) => new Set(b).add(item.id))}
                        />
                      </button>
                    )}

                    <div className="flex flex-1 flex-col p-5">
                      <div className="flex items-baseline justify-between gap-3">
                        <h3 className="font-semibold leading-tight">
                          {lang === "fr" ? item.nameFr : item.nameEn}
                        </h3>
                        <span className="accent shrink-0 text-lg text-gold">
                          {item.optionGroups.some(
                            (g) => g.minSelect > 0 && g.options.some((o) => o.priceCents > 0)
                          ) && <span className="mr-1 text-[10px] text-smoke">{copy.common.from}</span>}
                          {formatMoney(item.priceCents, lang)}
                        </span>
                      </div>

                      {(lang === "fr" ? item.descFr : item.descEn) && (
                        <p className="mt-2 flex-1 text-sm leading-relaxed text-cream/60">
                          {lang === "fr" ? item.descFr : item.descEn}
                        </p>
                      )}

                      {badges.length > 0 && (
                        <div className="mt-3 flex flex-wrap gap-1.5">
                          {badges.map((b) => (
                            <span
                              key={b}
                              className={`accent rounded-full border px-2 py-0.5 text-[10px] ${
                                BADGE_STYLE[b] ?? "border-cream/20 text-cream/60"
                              }`}
                            >
                              {copy.badges[b as keyof typeof copy.badges] ?? b}
                            </span>
                          ))}
                        </div>
                      )}

                      <button
                        onClick={() => quickAdd(item)}
                        className={`mt-4 rounded-full py-2.5 text-sm transition-all ${
                          flash === item.id ? "bg-halal text-charcoal-deep accent" : "btn-ember"
                        }`}
                      >
                        {flash === item.id
                          ? lang === "fr"
                            ? "✓ Ajouté"
                            : "✓ Added"
                          : item.optionGroups.length > 0
                            ? lang === "fr"
                              ? "Personnaliser"
                              : "Customise"
                            : copy.common.addToCart}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </section>
        ))}
      </div>

      {active && <ItemDialog item={active} onClose={() => setActive(null)} />}
    </div>
  );
}
