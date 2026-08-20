"use client";

import Link from "next/link";
import { useCart } from "./CartProvider";
import { t } from "@/lib/i18n";
import { STORE } from "@/lib/store";
import { HalalBadge } from "./Logo";
import { SliceTitle } from "./motion/SliceTitle";

export function Hero() {
  const { lang } = useCart();
  const copy = t(lang);

  return (
    <section className="grain relative overflow-hidden">
      {/* Media bed: video if present, still frame as poster/fallback */}
      <div className="absolute inset-0" data-parallax="6">
        <video
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/media/hero-poster.jpg"
        >
          <source src="/media/hero.mp4" type="video/mp4" />
        </video>
        <div className="absolute inset-0 bg-gradient-to-r from-charcoal-deep via-charcoal-deep/85 to-charcoal-deep/35" />
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal-deep via-transparent to-charcoal-deep/60" />
      </div>

      <div className="relative mx-auto flex min-h-[86svh] max-w-6xl flex-col justify-center px-4 py-20">
        <div className="flex flex-wrap items-center gap-3">
          <HalalBadge />
          <span className="strip text-[10px] text-smoke">{copy.hero.eyebrow}</span>
        </div>

        <SliceTitle
          lines={copy.hero.title.split("\n")}
          className="display mt-6 max-w-3xl text-[13vw] leading-[0.88] sm:text-[8vw] lg:text-[6.5rem]"
        />

        <p data-reveal data-reveal-delay="0.9" className="mt-6 max-w-xl text-base leading-relaxed text-cream/75 sm:text-lg">
          {copy.hero.sub}
        </p>

        <div data-reveal data-reveal-delay="1.05" className="mt-9 flex flex-wrap items-center gap-3">
          <Link href="/menu" className="btn-ember rounded-full px-8 py-3.5 text-sm">
            {copy.hero.cta}
          </Link>
          <a href={`tel:${STORE.phone}`} className="btn-ghost rounded-full px-7 py-3.5 text-sm">
            {STORE.phoneDisplay}
          </a>
        </div>

        <div data-reveal data-reveal-delay="1.2" className="mt-10 flex items-center gap-3 text-sm">
          <span className="flex gap-0.5 text-gold" aria-hidden>
            {"★★★★★".split("").map((s, i) => (
              <span key={i}>{s}</span>
            ))}
          </span>
          <span className="accent text-cream" data-count={STORE.googleRating} data-count-decimals="1">{STORE.googleRating}</span>
          <span className="text-smoke">
            · {STORE.googleReviews} {copy.hero.rating}
          </span>
        </div>
      </div>
    </section>
  );
}
