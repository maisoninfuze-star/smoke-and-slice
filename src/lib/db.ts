import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"] });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = db;

/**
 * Run a query that happens during prerender, and degrade instead of exploding.
 *
 * Next.js prerenders the home page, the menu page and /api/menu at build time,
 * which means they hit Postgres during `next build`. On a fresh deploy the
 * database may not be reachable yet (env var not set, database still
 * provisioning). Without this guard the whole build fails with a Prisma error
 * and nothing ships. With it the build completes, the page renders empty, and
 * the next revalidation fills it in once the database is live.
 *
 * Runtime requests are unaffected — a genuine outage still surfaces there.
 */
export async function safeQuery<T>(run: () => Promise<T>, fallback: T, label: string): Promise<T> {
  try {
    return await run();
  } catch (err) {
    const message = err instanceof Error ? err.message.split("\n")[0] : String(err);
    console.warn(`[db] ${label} failed, using fallback — ${message}`);
    return fallback;
  }
}
