"use client";

import Link from "next/link";
import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";
import { t } from "@/lib/i18n";
import { STORE } from "@/lib/store";
import { HalalBadge } from "./Logo";
import { SliceTitle } from "./motion/SliceTitle";

export function Hero() {
  const { lang } = useCart();
  const copy = t(lang);
  const video = useRef<HTMLVideoElement>(null);

  // The hero video is decoration over a poster that already carries the shot.
  // Attaching its source from JS (rather than a <source> tag) keeps the
  // browser from spending the visitor's data on it before we know it is
  // wanted: skipped on Save-Data, on slow or metered connections, on narrow
  // screens, and for anyone who asked for reduced motion. The poster stays.
  useEffect(() => {
    const el = video.current;
    if (!el || el.getAttribute("src")) return;

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    if (window.matchMedia("(max-width: 640px)").matches) return;

    const conn = (navigator as Navigator & {
      connection?: { saveData?: boolean; effectiveType?: string };
    }).connection;
    if (conn?.saveData) return;
    if (conn?.effectiveType && /2g|slow-2g|3g/.test(conn.effectiveType)) return;

    // Wait for the page to settle so the video never competes with the
    // poster, the fonts or the menu data for bandwidth.
    const start = () => {
      el.src = "/media/hero.mp4";
      el.load();
      void el.play().catch(() => {});
    };
    // requestIdleCallback is still missing on Safari, so fall back to a timer.
    const w = window as Window & {
      requestIdleCallback?: (cb: () => void, o?: { timeout: number }) => number;
      cancelIdleCallback?: (h: number) => void;
    };
    const useIdle = typeof w.requestIdleCallback === "function";
    const handle = useIdle
      ? w.requestIdleCallback!(start, { timeout: 2500 })
      : window.setTimeout(start, 1200);

    return () => {
      if (useIdle) w.cancelIdleCallback?.(handle);
      else clearTimeout(handle);
    };
  }, []);

  // Browsers pause media while the document is hidden and do not resume it.
  // This is the first frame of the site, so it must not come back frozen.
  useEffect(() => {
    const el = video.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const resume = () => {
      if (!document.hidden && el.getAttribute("src")) void el.play().catch(() => {});
    };
    document.addEventListener("visibilitychange", resume);
    resume();
    return () => document.removeEventListener("visibilitychange", resume);
  }, []);

  return (
    <section className="grain relative overflow-hidden">
      {/* Media bed: video if present, still frame as poster/fallback */}
      <div className="absolute inset-0" data-parallax="6">
        <video
          ref={video}
          className="h-full w-full object-cover"
          autoPlay
          muted
          loop
          playsInline
          poster="/media/hero-poster.jpg"
          preload="none"
        />
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
          {STORE.onlineOrdering ? (
            <>
              <Link href="/menu" className="btn-ember rounded-full px-8 py-3.5 text-sm">
                {copy.hero.cta}
              </Link>
              <a href={`tel:${STORE.phone}`} className="btn-ghost rounded-full px-7 py-3.5 text-sm">
                {STORE.phoneDisplay}
              </a>
            </>
          ) : (
            <>
              <a href={`tel:${STORE.phone}`} className="btn-ember rounded-full px-8 py-3.5 text-sm">
                {lang === "fr" ? "Appelez pour commander" : "Call to order"} · {STORE.phoneDisplay}
              </a>
              <Link href="/menu" className="btn-ghost rounded-full px-7 py-3.5 text-sm">
                {copy.hero.ctaSecondary}
              </Link>
            </>
          )}
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
