"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { t } from "@/lib/i18n";
import { STORE } from "@/lib/store";
import { HalalBadge } from "./Logo";

const HOURS = [
  { fr: "Lundi – Jeudi", en: "Monday – Thursday", time: "11:00 – 23:00" },
  { fr: "Vendredi – Samedi", en: "Friday – Saturday", time: "11:00 – 00:00" },
  { fr: "Dimanche", en: "Sunday", time: "12:00 – 23:00" },
];

export function Footer() {
  const { lang } = useCart();
  const copy = t(lang);

  return (
    <footer className="grain relative border-t border-cream/10 bg-charcoal-deep">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-4">
        <div>
          <div className="flex flex-col leading-none">
            <span className="sign text-sm text-gold tracking-[0.2em]">MR</span>
            <span className="sign text-xl">
              <span className="text-cream">SMOKE</span>
              <span className="text-flame"> ET </span>
              <span className="text-cream">SLICE</span>
            </span>
          </div>
          <p className="strip mt-2 text-[10px] text-smoke">
            {lang === "fr" ? STORE.taglineFr : STORE.taglineEn}
          </p>
          <HalalBadge className="mt-4" />
        </div>

        <div>
          <h3 className="accent mb-3 text-sm text-gold">{copy.footer.hours}</h3>
          <ul className="space-y-1.5 text-sm text-smoke">
            {HOURS.map((h) => (
              <li key={h.en} className="flex justify-between gap-4">
                <span>{lang === "fr" ? h.fr : h.en}</span>
                <span className="text-cream/80">{h.time}</span>
              </li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="accent mb-3 text-sm text-gold">{copy.footer.contact}</h3>
          <address className="space-y-1.5 text-sm not-italic text-smoke">
            <a href={STORE.mapsUrl} target="_blank" rel="noreferrer" className="block hover:text-gold">
              5518 Sherbrooke St W<br />
              Montréal, QC H4A 1W2
            </a>
            <a href={`tel:${STORE.phone}`} className="block hover:text-gold">
              {STORE.phoneDisplay}
            </a>
            <a href={`tel:${STORE.phoneAlt}`} className="block hover:text-gold">
              {STORE.phoneAltDisplay}
            </a>
          </address>
        </div>

        <div>
          <h3 className="accent mb-3 text-sm text-gold">{copy.nav.menu}</h3>
          <ul className="space-y-1.5 text-sm text-smoke">
            <li><Link href="/menu" className="hover:text-gold">{copy.nav.menu}</Link></li>
            <li><Link href="/checkout" className="hover:text-gold">{copy.common.checkout}</Link></li>
            <li><Link href="/track" className="hover:text-gold">{copy.nav.track}</Link></li>
            <li><Link href="/account" className="hover:text-gold">{copy.nav.account}</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream/10 px-4 py-5">
        <p className="mx-auto max-w-6xl text-center text-xs text-smoke">
          © {new Date().getFullYear()} {STORE.name} · {STORE.addressShort} ·{" "}
          {lang === "fr" ? "Livraison par" : "Delivery powered by"} Uber Direct
        </p>
      </div>
    </footer>
  );
}
