import { PrismaClient } from "@prisma/client";
import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";
import { MENU } from "./menu-data.js";

const db = new PrismaClient();
const scryptAsync = promisify(scrypt) as (p: string, s: string, k: number) => Promise<Buffer>;

async function hash(password: string) {
  const salt = randomBytes(16).toString("hex");
  const derived = await scryptAsync(password, salt, 64);
  return `${salt}:${derived.toString("hex")}`;
}

const HOURS = [
  { day: "Lundi / Monday", open: "11:00", close: "23:00" },
  { day: "Mardi / Tuesday", open: "11:00", close: "23:00" },
  { day: "Mercredi / Wednesday", open: "11:00", close: "23:00" },
  { day: "Jeudi / Thursday", open: "11:00", close: "23:00" },
  { day: "Vendredi / Friday", open: "11:00", close: "00:00" },
  { day: "Samedi / Saturday", open: "11:00", close: "00:00" },
  { day: "Dimanche / Sunday", open: "12:00", close: "23:00" },
];

async function main() {
  console.log("→ clearing menu tables");
  await db.option.deleteMany();
  await db.optionGroup.deleteMany();
  await db.menuItem.deleteMany();
  await db.category.deleteMany();

  console.log("→ seeding menu");
  let catSort = 0;
  for (const cat of MENU) {
    const category = await db.category.create({
      data: {
        slug: cat.slug,
        nameFr: cat.nameFr,
        nameEn: cat.nameEn,
        descFr: cat.descFr,
        descEn: cat.descEn,
        sort: catSort++,
      },
    });

    let itemSort = 0;
    for (const item of cat.items) {
      const created = await db.menuItem.create({
        data: {
          slug: item.slug,
          categoryId: category.id,
          nameFr: item.nameFr,
          nameEn: item.nameEn,
          descFr: item.descFr,
          descEn: item.descEn,
          priceCents: item.priceCents,
          image: item.image,
          badges: item.badges ?? "",
          sort: itemSort++,
        },
      });

      let groupSort = 0;
      for (const group of item.optionGroups ?? []) {
        const g = await db.optionGroup.create({
          data: {
            menuItemId: created.id,
            nameFr: group.nameFr,
            nameEn: group.nameEn,
            minSelect: group.minSelect ?? 0,
            maxSelect: group.maxSelect ?? 1,
            sort: groupSort++,
          },
        });
        let optSort = 0;
        for (const opt of group.options) {
          await db.option.create({
            data: {
              optionGroupId: g.id,
              nameFr: opt.nameFr,
              nameEn: opt.nameEn,
              priceCents: opt.priceCents ?? 0,
              sort: optSort++,
            },
          });
        }
      }
    }
  }

  console.log("→ seeding store settings");
  await db.storeSetting.upsert({
    where: { id: "singleton" },
    update: { hoursJson: JSON.stringify(HOURS) },
    create: { id: "singleton", hoursJson: JSON.stringify(HOURS) },
  });

  console.log("→ seeding admin user");
  const adminEmail = "admin@mrsmokeetslice.ca";
  await db.user.upsert({
    where: { email: adminEmail },
    update: { role: "ADMIN" },
    create: {
      email: adminEmail,
      name: "Store Manager",
      role: "ADMIN",
      phone: "+15148265780",
      passwordHash: await hash("smoke2026"),
    },
  });

  const counts = {
    categories: await db.category.count(),
    items: await db.menuItem.count(),
    options: await db.option.count(),
  };
  console.log("✓ seeded", counts);
  console.log("✓ admin login: admin@mrsmokeetslice.ca / smoke2026  (change this before launch)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
