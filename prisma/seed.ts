import { PrismaClient } from "@prisma/client";
import { scrypt, randomBytes } from "node:crypto";
import { promisify } from "node:util";

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

  console.log("✓ seeded store settings + admin user");
  console.log("✓ admin login: admin@mrsmokeetslice.ca / smoke2026  (change this before launch)");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
