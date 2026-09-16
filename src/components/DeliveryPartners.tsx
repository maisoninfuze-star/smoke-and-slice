"use client";

import { useCart } from "./CartProvider";
import { activeDeliveryPartners } from "@/lib/store";

/**
 * "Order delivery through…" buttons for the marketplaces the shop is listed
 * on. Renders nothing if no partner has a URL yet, so it can sit anywhere
 * without leaving an empty heading behind.
 */
export function DeliveryPartners({
  size = "md",
  align = "start",
}: {
  size?: "sm" | "md";
  align?: "start" | "center";
}) {
  const { lang } = useCart();
  const partners = activeDeliveryPartners();
  if (partners.length === 0) return null;

  const pad = size === "sm" ? "px-4 py-2 text-xs" : "px-6 py-3 text-sm";
  const justify = align === "center" ? "justify-center" : "justify-start";

  return (
    <div className={`flex flex-wrap items-center gap-2 ${justify}`}>
      {partners.map((p) => (
        <a
          key={p.key}
          href={lang === "fr" ? p.urlFr : p.urlEn}
          target="_blank"
          rel="noopener noreferrer"
          className={`accent inline-flex items-center gap-2 rounded-full border font-medium tracking-wide transition-transform hover:-translate-y-0.5 ${pad}`}
          style={{ borderColor: p.color, color: p.color, background: `${p.color}14` }}
        >
          <span
            aria-hidden
            className="inline-block h-2 w-2 rounded-full"
            style={{ background: p.color }}
          />
          {lang === "fr" ? `Commander sur ${p.name}` : `Order on ${p.name}`}
          <svg viewBox="0 0 24 24" className="h-3.5 w-3.5" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden>
            <path d="M7 17 17 7M8 7h9v9" />
          </svg>
        </a>
      ))}
    </div>
  );
}
