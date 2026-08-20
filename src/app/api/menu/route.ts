import { NextResponse } from "next/server";
import { db, safeQuery } from "@/lib/db";

export const revalidate = 60;

export async function GET() {
  const categories = await safeQuery(
    () => db.category.findMany({
    where: { active: true },
    orderBy: { sort: "asc" },
    include: {
      items: {
        where: { active: true },
        orderBy: { sort: "asc" },
        include: {
          optionGroups: {
            orderBy: { sort: "asc" },
            include: { options: { orderBy: { sort: "asc" } } },
          },
        },
      },
    },
  }),
    [],
    "api menu"
  );
  return NextResponse.json({ categories });
}
