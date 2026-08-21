/**
 * Print the menu exactly as the site will render it, so it can be diffed
 * against the printed card. Reads the same file the site reads — no database.
 *
 *   npx tsx scripts/audit-menu.ts
 */
import { getMenu, menuCounts } from "../src/lib/menu.js";

const money = (c: number) => (c / 100).toFixed(2);

for (const cat of getMenu()) {
  console.log(`\n### ${cat.nameFr} / ${cat.nameEn}  (${cat.items.length} items)`);
  for (const item of cat.items) {
    console.log(`  ${item.nameFr.padEnd(26)} ${money(item.priceCents).padStart(6)}`);
    for (const g of item.optionGroups) {
      const priced = g.options.filter((o) => o.priceCents > 0);
      if (priced.length) {
        console.log(
          `      ${g.nameFr}: ` + priced.map((o) => `${o.nameFr} +${money(o.priceCents)}`).join(", ")
        );
      }
    }
  }
}

const c = menuCounts();
console.log(`\n${c.categories} categories, ${c.items} items, ${c.options} options`);
