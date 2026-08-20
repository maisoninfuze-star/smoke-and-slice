"use client";

import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Lang } from "@/lib/i18n";

export type CartOption = { id: string; name: string; priceCents: number };
export type CartLine = {
  key: string;
  menuItemId: string;
  slug: string;
  name: string;
  unitPriceCents: number;
  qty: number;
  options: CartOption[];
  image?: string | null;
};

type CartContextValue = {
  lines: CartLine[];
  add: (line: Omit<CartLine, "key">) => void;
  setQty: (key: string, qty: number) => void;
  remove: (key: string) => void;
  clear: () => void;
  count: number;
  subtotalCents: number;
  lang: Lang;
  setLang: (l: Lang) => void;
  hydrated: boolean;
};

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = "mss_cart_v1";
const LANG_KEY = "mss_lang";

function lineKey(menuItemId: string, options: CartOption[]) {
  const sig = options
    .map((o) => o.id)
    .sort()
    .join("|");
  return `${menuItemId}::${sig}`;
}

export function lineTotal(line: CartLine): number {
  const optionsTotal = line.options.reduce((sum, o) => sum + o.priceCents, 0);
  return (line.unitPriceCents + optionsTotal) * line.qty;
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [lang, setLangState] = useState<Lang>("fr");
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) setLines(JSON.parse(raw) as CartLine[]);
      const savedLang = localStorage.getItem(LANG_KEY);
      if (savedLang === "fr" || savedLang === "en") setLangState(savedLang);
    } catch {
      /* corrupt storage — start clean */
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
  }, [lines, hydrated]);

  const setLang = (l: Lang) => {
    setLangState(l);
    localStorage.setItem(LANG_KEY, l);
    document.documentElement.lang = l === "fr" ? "fr-CA" : "en-CA";
  };

  const value = useMemo<CartContextValue>(() => {
    const add: CartContextValue["add"] = (incoming) => {
      const key = lineKey(incoming.menuItemId, incoming.options);
      setLines((prev) => {
        const existing = prev.find((l) => l.key === key);
        if (existing) {
          return prev.map((l) => (l.key === key ? { ...l, qty: l.qty + incoming.qty } : l));
        }
        return [...prev, { ...incoming, key }];
      });
    };

    return {
      lines,
      add,
      setQty: (key, qty) =>
        setLines((prev) =>
          qty <= 0 ? prev.filter((l) => l.key !== key) : prev.map((l) => (l.key === key ? { ...l, qty } : l))
        ),
      remove: (key) => setLines((prev) => prev.filter((l) => l.key !== key)),
      clear: () => setLines([]),
      count: lines.reduce((n, l) => n + l.qty, 0),
      subtotalCents: lines.reduce((sum, l) => sum + lineTotal(l), 0),
      lang,
      setLang,
      hydrated,
    };
  }, [lines, lang, hydrated]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used inside <CartProvider>");
  return ctx;
}
