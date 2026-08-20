"use client";

import Image from "next/image";
import { useMemo, useState } from "react";
import { useCart } from "./CartProvider";
import { formatMoney } from "@/lib/money";
import { t } from "@/lib/i18n";

export type OptionFull = { id: string; nameFr: string; nameEn: string; priceCents: number };
export type OptionGroupFull = {
  id: string;
  nameFr: string;
  nameEn: string;
  minSelect: number;
  maxSelect: number;
  options: OptionFull[];
};
export type MenuItemFull = {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  descFr: string | null;
  descEn: string | null;
  priceCents: number;
  image: string | null;
  badges: string;
  optionGroups: OptionGroupFull[];
};

export function ItemDialog({ item, onClose }: { item: MenuItemFull; onClose: () => void }) {
  const { add, lang } = useCart();
  const copy = t(lang);
  const [qty, setQty] = useState(1);

  // Pre-select the first option of any required single-choice group.
  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    const initial: Record<string, string[]> = {};
    for (const g of item.optionGroups) {
      initial[g.id] = g.minSelect > 0 && g.maxSelect === 1 && g.options[0] ? [g.options[0].id] : [];
    }
    return initial;
  });

  const toggle = (group: OptionGroupFull, optionId: string) => {
    setSelected((prev) => {
      const current = prev[group.id] ?? [];
      if (group.maxSelect === 1) {
        // Radio behaviour — required groups can't be emptied.
        if (current[0] === optionId && group.minSelect === 0) return { ...prev, [group.id]: [] };
        return { ...prev, [group.id]: [optionId] };
      }
      if (current.includes(optionId)) {
        return { ...prev, [group.id]: current.filter((id) => id !== optionId) };
      }
      if (current.length >= group.maxSelect) return prev;
      return { ...prev, [group.id]: [...current, optionId] };
    });
  };

  const chosen = useMemo(
    () =>
      item.optionGroups.flatMap((g) =>
        (selected[g.id] ?? [])
          .map((id) => g.options.find((o) => o.id === id))
          .filter((o): o is OptionFull => Boolean(o))
      ),
    [selected, item.optionGroups]
  );

  const unitCents = item.priceCents + chosen.reduce((sum, o) => sum + o.priceCents, 0);

  const unmetGroup = item.optionGroups.find((g) => (selected[g.id] ?? []).length < g.minSelect);
  const canAdd = !unmetGroup;

  const submit = () => {
    if (!canAdd) return;
    add({
      menuItemId: item.id,
      slug: item.slug,
      name: lang === "fr" ? item.nameFr : item.nameEn,
      unitPriceCents: item.priceCents,
      qty,
      options: chosen.map((o) => ({
        id: o.id,
        name: lang === "fr" ? o.nameFr : o.nameEn,
        priceCents: o.priceCents,
      })),
      image: item.image,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center sm:items-center">
      <div className="absolute inset-0 bg-charcoal-deep/80 backdrop-blur-sm" onClick={onClose} />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={lang === "fr" ? item.nameFr : item.nameEn}
        className="relative flex max-h-[92svh] w-full max-w-lg flex-col overflow-hidden rounded-t-2xl border border-cream/12 bg-charcoal sm:rounded-2xl"
      >
        {item.image && (
          <div className="relative aspect-[16/9] shrink-0 bg-slate-soft">
            <Image
              src={item.image}
              alt={lang === "fr" ? item.nameFr : item.nameEn}
              fill
              sizes="512px"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-charcoal to-transparent" />
          </div>
        )}

        <button
          onClick={onClose}
          className="absolute right-3 top-3 rounded-full bg-charcoal-deep/70 p-2 text-cream/80 backdrop-blur hover:text-cream"
          aria-label="Close"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6 6 18" />
          </svg>
        </button>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          <h2 className="display text-2xl">{lang === "fr" ? item.nameFr : item.nameEn}</h2>
          {(lang === "fr" ? item.descFr : item.descEn) && (
            <p className="mt-2 text-sm leading-relaxed text-cream/65">
              {lang === "fr" ? item.descFr : item.descEn}
            </p>
          )}

          {item.optionGroups.map((group) => {
            const current = selected[group.id] ?? [];
            const required = group.minSelect > 0;
            const isSizeGroup = required && group.maxSelect === 1 && group.options.length > 1;
            return (
              <fieldset key={group.id} className="mt-7">
                <legend className="flex w-full items-baseline justify-between gap-3">
                  <span className="accent text-sm text-gold">
                    {lang === "fr" ? group.nameFr : group.nameEn}
                  </span>
                  <span className="text-[11px] text-smoke">
                    {required
                      ? lang === "fr" ? "Obligatoire" : "Required"
                      : `${lang === "fr" ? "Max" : "Max"} ${group.maxSelect}`}
                  </span>
                </legend>

                <div className="mt-2.5 space-y-1.5">
                  {group.options.map((opt) => {
                    const isOn = current.includes(opt.id);
                    const atLimit = !isOn && group.maxSelect > 1 && current.length >= group.maxSelect;
                    return (
                      <label
                        key={opt.id}
                        className={`flex cursor-pointer items-center gap-3 rounded-lg border px-3.5 py-2.5 text-sm transition-colors ${
                          isOn ? "border-ember bg-ember/10" : "border-cream/12 hover:border-cream/25"
                        } ${atLimit ? "cursor-not-allowed opacity-40" : ""}`}
                      >
                        <input
                          type={group.maxSelect === 1 ? "radio" : "checkbox"}
                          name={group.id}
                          checked={isOn}
                          disabled={atLimit}
                          onChange={() => toggle(group, opt.id)}
                          className="accent-ember"
                        />
                        <span className="flex-1">{lang === "fr" ? opt.nameFr : opt.nameEn}</span>
                        {/* Size-style groups read like the printed card: absolute price per
                            size. Add-on groups stay as surcharges. */}
                        {isSizeGroup ? (
                          <span className="accent text-gold">
                            {formatMoney(item.priceCents + opt.priceCents, lang)}
                          </span>
                        ) : (
                          opt.priceCents > 0 && (
                            <span className="accent text-gold">+{formatMoney(opt.priceCents, lang)}</span>
                          )
                        )}
                      </label>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>

        <div className="flex items-center gap-3 border-t border-cream/10 px-6 py-4">
          <div className="flex items-center rounded-full border border-cream/20">
            <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="px-3 py-2 text-smoke hover:text-gold">
              −
            </button>
            <span className="accent min-w-6 text-center">{qty}</span>
            <button onClick={() => setQty((q) => Math.min(50, q + 1))} className="px-3 py-2 text-smoke hover:text-gold">
              +
            </button>
          </div>

          <button onClick={submit} disabled={!canAdd} className="btn-ember flex-1 rounded-full py-3 text-sm">
            {canAdd
              ? `${copy.common.addToCart} · ${formatMoney(unitCents * qty, lang)}`
              : lang === "fr"
                ? `Choisir : ${unmetGroup?.nameFr}`
                : `Choose: ${unmetGroup?.nameEn}`}
          </button>
        </div>
      </div>
    </div>
  );
}
