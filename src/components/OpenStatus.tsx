"use client";

import { useEffect, useState } from "react";
import { useCart } from "./CartProvider";
import { openState, dayName, type OpenState } from "@/lib/hours";

/**
 * Live "open now / closed" pill. Computed after mount only — the server and
 * the visitor can be in different timezones, and rendering it during SSR
 * would produce a hydration mismatch.
 */
export function OpenStatus({ className = "" }: { className?: string }) {
  const { lang } = useCart();
  const [state, setState] = useState<OpenState | null>(null);

  useEffect(() => {
    const tick = () => setState(openState());
    tick();
    const id = setInterval(tick, 60_000);
    return () => clearInterval(id);
  }, []);

  if (!state) return null;

  if (state.open) {
    return (
      <span className={`inline-flex items-center gap-2 text-sm ${className}`}>
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-halal opacity-60" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-halal" />
        </span>
        <span className="text-halal">{lang === "fr" ? "Ouvert" : "Open now"}</span>
        <span className="text-smoke">
          · {lang === "fr" ? "ferme à" : "closes"} {state.closesAt}
        </span>
      </span>
    );
  }

  return (
    <span className={`inline-flex items-center gap-2 text-sm ${className}`}>
      <span className="inline-flex h-2 w-2 rounded-full bg-flame" />
      <span className="text-flame">{lang === "fr" ? "Fermé" : "Closed"}</span>
      {state.opensDay !== null && (
        <span className="text-smoke">
          · {lang === "fr" ? "ouvre" : "opens"} {dayName(state.opensDay, lang)} {state.opensAt}
        </span>
      )}
    </span>
  );
}
