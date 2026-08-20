import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const revalidate = 60;

export async function GET() {
  const categories = await db.category.findMany({
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
  });
  return NextResponse.json({ categories });
}
