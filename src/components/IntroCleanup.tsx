"use client";

import { useEffect } from "react";

/**
 * Retires the opening overlay.
 *
 * The animation itself is pure CSS, so this only has to take the overlay out
 * of the layer once it has left — and, more importantly, guarantee it leaves.
 * If CSS animations never run (an extension, a rendering mode we did not
 * anticipate, an `animationend` that never fires), a fixed full-screen panel
 * with the page scroll locked behind it would trap the visitor completely.
 * The failsafe below is the reason that cannot happen.
 */
const RUN_MS = 3770; // 3.05s hold + 0.72s slide
const FAILSAFE_MS = 5200;

export function IntroCleanup() {
  useEffect(() => {
    const el = document.getElementById("intro");
    if (!el) return;

    // #introhold freezes the overlay so the animation can be reviewed frame by
    // frame; leave it up and do not lock anything away.
    // The pre-paint script sets this, which is authoritative: the hash is not
    // guaranteed to be applied to location by the time this effect runs.
    if (document.documentElement.dataset.introHold === "1") {
      el.classList.add("intro-hold");
      return;
    }

    const finish = () => {
      el.classList.add("intro-done");
      el.style.display = "none";
    };

    const onEnd = (e: AnimationEvent) => {
      if (e.animationName === "intro-leave") finish();
    };

    el.addEventListener("animationend", onEnd);
    const belt = window.setTimeout(finish, RUN_MS + 250);
    const braces = window.setTimeout(finish, FAILSAFE_MS);

    return () => {
      el.removeEventListener("animationend", onEnd);
      window.clearTimeout(belt);
      window.clearTimeout(braces);
    };
  }, []);

  return null;
}
