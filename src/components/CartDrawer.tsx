"use client";

import Link from "next/link";
import { useCart, lineTotal } from "./CartProvider";
import { formatMoney } from "@/lib/money";
import { t } from "@/lib/i18n";

export function CartDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const { lines, setQty, remove, subtotalCents, lang } = useCart();
  const copy = t(lang);

  return (
    <div
      className={`fixed inset-0 z-50 transition-opacity duration-200 ${
        open ? "opacity-100" : "pointer-events-none opacity-0"
      }`}
      aria-hidden={!open}
    >
      <div className="absolute inset-0 bg-charcoal-deep/70 backdrop-blur-sm" onClick={onClose} />

      <aside
        className={`absolute right-0 top-0 flex h-full w-full max-w-md flex-col border-l border-cream/10 bg-charcoal transition-transform duration-300 ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
        role="dialog"
        aria-label={copy.common.cart}
      >
        <div className="flex items-center justify-between border-b border-cream/10 px-5 py-4">
          <h2 className="display text-xl">{copy.common.cart}</h2>
          <button onClick={onClose} className="rounded-full p-1.5 text-smoke hover:text-cream" aria-label="Close">
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M6 6l12 12M18 6 6 18" />
            </svg>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {lines.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
              <div className="text-5xl opacity-40">🔥</div>
              <p className="text-smoke">{copy.common.empty}</p>
              <Link href="/menu" onClick={onClose} className="btn-ghost rounded-full px-5 py-2 text-sm">
                {copy.nav.menu}
              </Link>
            </div>
          ) : (
            <ul className="space-y-4">
              {lines.map((line) => (
                <li key={line.key} className="flex gap-3">
                  <div className="flex-1">
                    <p className="font-medium leading-snug">{line.name}</p>
                    {line.options.length > 0 && (
                      <p className="mt-0.5 text-xs text-smoke">
                        {line.options.map((o) => o.name).join(" · ")}
                      </p>
                    )}
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex items-center rounded-full border border-cream/20">
                        <button
                          onClick={() => setQty(line.key, line.qty - 1)}
                          className="px-2.5 py-1 text-smoke hover:text-gold"
                          aria-label="−"
                        >
                          −
                        </button>
                        <span className="accent min-w-6 text-center text-sm">{line.qty}</span>
                        <button
                          onClick={() => setQty(line.key, line.qty + 1)}
                          className="px-2.5 py-1 text-smoke hover:text-gold"
                          aria-label="+"
                        >
                          +
                        </button>
                      </div>
                      <button
                        onClick={() => remove(line.key)}
                        className="text-xs text-smoke underline underline-offset-2 hover:text-flame"
                      >
                        {lang === "fr" ? "Retirer" : "Remove"}
                      </button>
                    </div>
                  </div>
                  <span className="accent shrink-0 text-gold">{formatMoney(lineTotal(line), lang)}</span>
                </li>
              ))}
            </ul>
          )}
        </div>

        {lines.length > 0 && (
          <div className="border-t border-cream/10 px-5 py-4">
            <div className="mb-3 flex justify-between text-sm">
              <span className="text-smoke">{copy.common.subtotal}</span>
              <span className="accent text-lg text-cream">{formatMoney(subtotalCents, lang)}</span>
            </div>
            <p className="mb-3 text-xs text-smoke">
              {lang === "fr"
                ? "Taxes et livraison calculées à la caisse."
                : "Taxes and delivery calculated at checkout."}
            </p>
            <Link
              href="/checkout"
              onClick={onClose}
              className="btn-ember block rounded-full py-3 text-center text-sm"
            >
              {copy.common.checkout}
            </Link>
          </div>
        )}
      </aside>
    </div>
  );
}
