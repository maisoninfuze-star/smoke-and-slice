/** Prints the seeded menu back as dollar prices so it can be diffed against the printed card. */
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();
const f = (c: number) => (c / 100).toFixed(2);

async function main() {
  const cats = await db.category.findMany({
    orderBy: { sort: "asc" },
    include: {
      items: {
        orderBy: { sort: "asc" },
        include: { optionGroups: { include: { options: { orderBy: { sort: "asc" } } } } },
      },
    },
  });

  for (const c of cats) {
    console.log(`\n### ${c.nameFr} / ${c.nameEn}  (${c.items.length} items)`);
    for (const i of c.items) {
      const size = i.optionGroups.find((g) => g.nameEn === "Size");
      if (size) {
        const ladder = size.options.map((o) => f(i.priceCents + o.priceCents)).join(" | ");
        console.log(`  ${i.nameFr.padEnd(24)} ${ladder}`);
      } else {
        console.log(`  ${i.nameFr.padEnd(24)} ${f(i.priceCents)}`);
      }
    }
  }
  await db.$disconnect();
}

main();
