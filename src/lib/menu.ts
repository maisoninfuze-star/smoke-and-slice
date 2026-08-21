/**
 * The menu, read straight from src/data/menu-data.ts.
 *
 * The menu is static content — it changes when the restaurant reprints its
 * card, not while the site is running. Storing it in the database meant the
 * site could not show a menu until someone provisioned Postgres and ran a
 * seed, which is a lot of machinery for a list of food. It lives in a file
 * now: edit the file, push, the menu changes.
 *
 * The database is still used for the things that genuinely need one — orders,
 * accounts, sessions.
 *
 * IDs are derived from slugs so they are stable across deploys. That matters
 * because order line items store the id they were bought with.
 */
import { MENU, type SeedCategory, type SeedItem, type SeedOptionGroup } from "@/data/menu-data";

export type MenuOption = {
  id: string;
  nameFr: string;
  nameEn: string;
  priceCents: number;
};

export type MenuOptionGroup = {
  id: string;
  nameFr: string;
  nameEn: string;
  minSelect: number;
  maxSelect: number;
  options: MenuOption[];
};

export type MenuItem = {
  id: string;
  slug: string;
  categorySlug: string;
  nameFr: string;
  nameEn: string;
  descFr: string | null;
  descEn: string | null;
  priceCents: number;
  image: string | null;
  badges: string;
  optionGroups: MenuOptionGroup[];
};

export type MenuCategory = {
  id: string;
  slug: string;
  nameFr: string;
  nameEn: string;
  descFr: string | null;
  descEn: string | null;
  items: MenuItem[];
};

/** Option ids must be stable, so they are built from names rather than order. */
function optionId(itemSlug: string, groupIndex: number, option: { nameEn: string }): string {
  const name = option.nameEn
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
  return `${itemSlug}__g${groupIndex}__${name}`;
}

function buildGroup(itemSlug: string, group: SeedOptionGroup, index: number): MenuOptionGroup {
  return {
    id: `${itemSlug}__g${index}`,
    nameFr: group.nameFr,
    nameEn: group.nameEn,
    minSelect: group.minSelect ?? 0,
    maxSelect: group.maxSelect ?? 1,
    options: group.options.map((o) => ({
      id: optionId(itemSlug, index, o),
      nameFr: o.nameFr,
      nameEn: o.nameEn,
      priceCents: o.priceCents ?? 0,
    })),
  };
}

function buildItem(categorySlug: string, item: SeedItem): MenuItem {
  return {
    id: item.slug,
    slug: item.slug,
    categorySlug,
    nameFr: item.nameFr,
    nameEn: item.nameEn,
    descFr: item.descFr ?? null,
    descEn: item.descEn ?? null,
    priceCents: item.priceCents,
    image: item.image ?? null,
    badges: item.badges ?? "",
    optionGroups: (item.optionGroups ?? []).map((g, i) => buildGroup(item.slug, g, i)),
  };
}

function build(): MenuCategory[] {
  return (MENU as SeedCategory[]).map((cat) => ({
    id: cat.slug,
    slug: cat.slug,
    nameFr: cat.nameFr,
    nameEn: cat.nameEn,
    descFr: cat.descFr ?? null,
    descEn: cat.descEn ?? null,
    items: cat.items.map((i) => buildItem(cat.slug, i)),
  }));
}

// Built once per process — it is derived from a static import.
const CATEGORIES: MenuCategory[] = build();

const ITEMS_BY_ID = new Map<string, MenuItem>(
  CATEGORIES.flatMap((c) => c.items.map((i) => [i.id, i] as const))
);

export function getMenu(): MenuCategory[] {
  return CATEGORIES;
}

export function getItem(id: string): MenuItem | undefined {
  return ITEMS_BY_ID.get(id);
}

export function getFeatured(limit = 6): MenuItem[] {
  return CATEGORIES.flatMap((c) => c.items)
    .filter((i) => i.badges.includes("popular"))
    .slice(0, limit);
}

export function menuCounts() {
  const items = CATEGORIES.reduce((n, c) => n + c.items.length, 0);
  const options = CATEGORIES.reduce(
    (n, c) => n + c.items.reduce((m, i) => m + i.optionGroups.reduce((k, g) => k + g.options.length, 0), 0),
    0
  );
  return { categories: CATEGORIES.length, items, options };
}
