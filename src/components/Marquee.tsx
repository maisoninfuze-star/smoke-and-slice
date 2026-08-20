"use client";

import { useCart } from "./CartProvider";

/**
 * The banner strip from under the awning, set in motion.
 * Duplicated once so the -50% translate loops seamlessly.
 */
const ITEMS_FR = [
  "Toute garnie", "Godzilla", "Poutine au bœuf", "Calzone Shani", "Ailes BBQ",
  "Chicc-A-Tikka", "Poulet Parmesan", "Moitié-moitié", "King Kong", "Sous-marin Creamy",
];
const ITEMS_EN = [
  "All Dressed", "Godzilla", "Beef Poutine", "Shani Calzone", "BBQ Wings",
  "Chicc-A-Tikka", "Chicken Parmesan", "Half & Half", "King Kong", "Creamy Sub",
];

export function Marquee() {
  const { lang } = useCart();
  const items = lang === "fr" ? ITEMS_FR : ITEMS_EN;
  const run = [...items, ...items];

  return (
    <div className="marquee border-y border-cream/10 bg-charcoal/40 py-4" aria-hidden="true">
      <div className="marquee-track">
        {run.map((item, i) => (
          <span key={i} className="flex shrink-0 items-center">
            <span className="strip px-6 text-sm text-cream/70">{item}</span>
            <span className="h-1.5 w-1.5 rounded-full ember-bg" />
          </span>
        ))}
      </div>
    </div>
  );
}
