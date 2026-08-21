"use client";

import { useEffect, useRef } from "react";
import { useCart } from "./CartProvider";

/**
 * The kitchen, filmed in the kitchen.
 *
 * These are the restaurant's own phone clips — dough sauced and cheesed, patties
 * pressed on the flat-top — trimmed and graded, not generated. They only play
 * while on screen, so a phone isn't decoding two videos in the background.
 */
const CLIPS = [
  {
    src: "/media/kitchen-pizza.mp4",
    poster: "/media/kitchen-pizza.jpg",
    fr: { title: "La pâte", body: "Étirée, saucée et garnie à la commande." },
    en: { title: "The dough", body: "Stretched, sauced and topped to order." },
  },
  {
    src: "/media/kitchen-burger.mp4",
    poster: "/media/kitchen-burger.jpg",
    fr: { title: "La plaque", body: "Smashé sur la plaque brûlante, fromage fondu dessus." },
    en: { title: "The flat-top", body: "Smashed on the hot plate, cheese melted over." },
  },
];

export function KitchenReel() {
  const { lang } = useCart();
  const wrap = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const root = wrap.current;
    if (!root) return;

    const videos = Array.from(root.querySelectorAll("video"));
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    // With motion reduced, leave the poster frame up and never autoplay.
    if (reduce) {
      videos.forEach((v) => {
        v.controls = true;
        v.removeAttribute("autoplay");
      });
      return;
    }

    // Track what *should* be playing, separately from what is. The browser
    // pauses media whenever the document goes hidden (tab switch, phone lock,
    // app backgrounded) and never resumes it on its own, so without the
    // visibilitychange handler below a viewer who glances away comes back to a
    // dead frame.
    const wanted = new Set<HTMLVideoElement>();

    const play = (v: HTMLVideoElement) => {
      if (document.hidden) return;
      void v.play().catch(() => {
        // Autoplay blocked (some mobile data-saver modes). The poster stays up,
        // so give the viewer a way to start it themselves.
        v.controls = true;
      });
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          const v = entry.target as HTMLVideoElement;
          if (entry.isIntersecting) {
            wanted.add(v);
            play(v);
          } else {
            wanted.delete(v);
            v.pause();
          }
        });
      },
      { threshold: 0.35 }
    );

    const onVisibility = () => {
      if (document.hidden) return;
      wanted.forEach(play);
    };
    document.addEventListener("visibilitychange", onVisibility);

    videos.forEach((v) => io.observe(v));
    return () => {
      io.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, []);

  return (
    <section className="border-t border-cream/10 px-4 py-20">
      <div className="mx-auto max-w-6xl" ref={wrap}>
        <h2 data-reveal className="display text-4xl sm:text-5xl">
          {lang === "fr" ? (
            <>Dans la <span className="ember-text">cuisine</span></>
          ) : (
            <>In the <span className="ember-text">kitchen</span></>
          )}
        </h2>
        <p data-reveal data-reveal-delay="0.08" className="editorial mt-3 max-w-xl text-lg text-cream/65">
          {lang === "fr"
            ? "Filmé chez nous, sur Sherbrooke Ouest. Rien de mis en scène."
            : "Filmed in our own kitchen on Sherbrooke West. Nothing staged."}
        </p>

        <div data-stagger className="mt-10 grid gap-5 sm:grid-cols-2">
          {CLIPS.map((clip) => {
            const copy = lang === "fr" ? clip.fr : clip.en;
            return (
              <figure key={clip.src} className="card card-hover overflow-hidden">
                <div className="relative aspect-[9/16] max-h-[70vh] overflow-hidden bg-slate-soft">
                  <video
                    className="h-full w-full object-cover"
                    poster={clip.poster}
                    muted
                    loop
                    playsInline
                    preload="metadata"
                  >
                    <source src={clip.src} type="video/mp4" />
                  </video>
                  <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1/3 bg-gradient-to-t from-charcoal-deep/95 to-transparent" />
                </div>
                <figcaption className="p-5">
                  <h3 className="editorial text-xl text-gold">{copy.title}</h3>
                  <p className="mt-1 text-sm text-cream/65">{copy.body}</p>
                </figcaption>
              </figure>
            );
          })}
        </div>
      </div>
    </section>
  );
}
