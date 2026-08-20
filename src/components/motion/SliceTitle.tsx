"use client";

import { useEffect, useRef } from "react";

/**
 * The signature move.
 *
 * The shop's tagline is "L'amour à la première slice", so the headline is
 * literally sliced: a cutter sweeps across, and the two halves of every letter
 * part along the cut before settling back together.
 *
 * Implementation: the line is rendered twice, clipped to the top and bottom
 * halves of the same text. The halves shear apart and return. Because both
 * copies contain the real text, the accessible name is unchanged — the visible
 * copy is aria-hidden and a screen-reader-only copy carries the words.
 */
export function SliceTitle({
  lines,
  className = "",
  emberize = true,
  gradientLine = 1,
}: {
  lines: string[];
  className?: string;
  emberize?: boolean;
  /** Index of the line that takes the ember gradient; -1 for none. */
  gradientLine?: number;
}) {
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = root.current;
    if (!el) return;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      el.classList.add("slice-settled");
      return;
    }
    const t = setTimeout(() => el.classList.add("slice-run"), 180);
    return () => clearTimeout(t);
  }, []);

  return (
    <div ref={root} className={`slice-title ${className}`}>
      <span className="sr-only">{lines.join(" ")}</span>

      <span aria-hidden="true">
        {lines.map((line, i) => (
          <span key={i} className="slice-line" style={{ ["--i" as string]: i }}>
            {/* The gradient must live on the halves, not the line: `ember-text`
                sets `color: transparent` and clips a background to its own
                glyphs, so on the empty grid parent it would only make the
                children invisible. */}
            <span className={`slice-half slice-top${i === gradientLine ? " ember-text" : ""}`}>
              {line}
            </span>
            <span className={`slice-half slice-bottom${i === gradientLine ? " ember-text" : ""}`}>
              {line}
            </span>
            <span className="slice-cut" />
          </span>
        ))}
      </span>

      {emberize && <EmberField />}
    </div>
  );
}

/**
 * Embers drifting up off the grill. Pure CSS animation on a handful of spans —
 * cheaper and calmer than a canvas particle system, and it stops dead under
 * reduced motion.
 */
function EmberField({ count = 14 }: { count?: number }) {
  // Deterministic pseudo-random so server and client markup agree.
  const embers = Array.from({ length: count }, (_, i) => {
    const seed = (i * 9301 + 49297) % 233280;
    const r = seed / 233280;
    const r2 = ((i * 4079 + 12345) % 2048) / 2048;
    return { left: 4 + r * 92, delay: r2 * 7, dur: 5.5 + r * 5, size: 2 + r2 * 3 };
  });

  return (
    <span className="ember-field" aria-hidden="true">
      {embers.map((e, i) => (
        <span
          key={i}
          className="ember"
          style={{
            left: `${e.left}%`,
            animationDelay: `${e.delay}s`,
            animationDuration: `${e.dur}s`,
            width: `${e.size}px`,
            height: `${e.size}px`,
          }}
        />
      ))}
    </span>
  );
}
