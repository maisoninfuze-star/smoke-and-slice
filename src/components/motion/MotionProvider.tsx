"use client";

import { useEffect } from "react";

/**
 * Site-wide motion runtime.
 *
 * Lenis drives smooth scrolling and GSAP's ScrollTrigger is slaved to it, so
 * scroll-linked animation stays in step with the eased scroll position instead
 * of fighting it.
 *
 * Everything here is a no-op under `prefers-reduced-motion: reduce` — no Lenis,
 * no ScrollTrigger, no parallax. The page then relies on the plain CSS in
 * globals.css, where every animated element has a visible resting state.
 */
export function MotionProvider() {
  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduce) {
      document.documentElement.classList.add("reduce-motion");
      return;
    }

    let cleanup: (() => void) | undefined;
    let disposed = false;

    (async () => {
      const [{ default: Lenis }, { gsap }, { ScrollTrigger }] = await Promise.all([
        import("lenis"),
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (disposed) return;

      gsap.registerPlugin(ScrollTrigger);

      const lenis = new Lenis({ duration: 1.05, smoothWheel: true, anchors: true });
      lenis.on("scroll", ScrollTrigger.update);
      // Exposed so anchors, tests and any future scroll-to logic drive the same
      // instance rather than fighting it with native scrollTo.
      (window as unknown as { mssLenis?: unknown }).mssLenis = lenis;

      const raf = (time: number) => lenis.raf(time * 1000);
      gsap.ticker.add(raf);
      gsap.ticker.lagSmoothing(0);

      document.documentElement.classList.add("motion-ready");

      // `gsap.fromTo` writes its from-state (opacity: 0) inline the moment it
      // is created. If a ScrollTrigger then never fires — a jump-scroll, a
      // refresh partway down the page, a resize race — the element is stranded
      // invisible, and an inline style beats any resting state in the
      // stylesheet. So: anything already on screen is simply shown, only
      // genuinely below-the-fold elements get the animated entrance, and a
      // late sweep un-hides anything still stuck.
      const onScreen = (el: Element) => el.getBoundingClientRect().top < window.innerHeight * 0.88;

      // --- scroll reveals ---------------------------------------------------
      const reveals = gsap.utils.toArray<HTMLElement>("[data-reveal]");
      reveals.forEach((el) => {
        if (onScreen(el)) {
          gsap.set(el, { opacity: 1, y: 0 });
          return;
        }
        gsap.fromTo(
          el,
          { y: 34, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.95,
            delay: Number(el.dataset.revealDelay ?? 0),
            ease: "power3.out",
            scrollTrigger: { trigger: el, start: "top 88%", once: true },
          }
        );
      });

      // --- staggered groups -------------------------------------------------
      const groups = gsap.utils.toArray<HTMLElement>("[data-stagger]");
      groups.forEach((group) => {
        if (onScreen(group)) {
          gsap.set(group.children, { opacity: 1, y: 0 });
          return;
        }
        gsap.fromTo(
          group.children,
          { y: 40, opacity: 0 },
          {
            y: 0,
            opacity: 1,
            duration: 0.8,
            ease: "power3.out",
            stagger: 0.075,
            scrollTrigger: { trigger: group, start: "top 85%", once: true },
          }
        );
      });

      // --- parallax ---------------------------------------------------------
      gsap.utils.toArray<HTMLElement>("[data-parallax]").forEach((el) => {
        const strength = Number(el.dataset.parallax || 12);
        gsap.fromTo(
          el,
          { yPercent: -strength },
          {
            yPercent: strength,
            ease: "none",
            scrollTrigger: { trigger: el, start: "top bottom", end: "bottom top", scrub: true },
          }
        );
      });

      // --- counters ---------------------------------------------------------
      gsap.utils.toArray<HTMLElement>("[data-count]").forEach((el) => {
        const target = Number(el.dataset.count || 0);
        const decimals = Number(el.dataset.countDecimals ?? 0);
        const obj = { v: 0 };
        gsap.to(obj, {
          v: target,
          duration: 1.6,
          ease: "power2.out",
          scrollTrigger: { trigger: el, start: "top 90%", once: true },
          onUpdate: () => {
            el.textContent = obj.v.toFixed(decimals);
          },
        });
      });

      ScrollTrigger.refresh();

      // Safety net: nothing on this page is allowed to stay invisible. If a
      // trigger has not run by now, show the element outright.
      const rescue = window.setTimeout(() => {
        [...reveals, ...groups.flatMap((g) => [...g.children] as HTMLElement[])].forEach((el) => {
          if (Number(getComputedStyle(el).opacity) < 0.99) {
            gsap.set(el, { opacity: 1, y: 0 });
          }
        });
        ScrollTrigger.refresh();
      }, 2600);

      cleanup = () => {
        window.clearTimeout(rescue);
        gsap.ticker.remove(raf);
        ScrollTrigger.getAll().forEach((t) => t.kill());
        lenis.destroy();
        delete (window as unknown as { mssLenis?: unknown }).mssLenis;
        document.documentElement.classList.remove("motion-ready");
      };
    })();

    return () => {
      disposed = true;
      cleanup?.();
    };
  }, []);

  return null;
}
