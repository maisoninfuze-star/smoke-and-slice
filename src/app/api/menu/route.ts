import { NextResponse } from "next/server";
import { getMenu } from "@/lib/menu";

export const dynamic = "force-static";

export async function GET() {
  return NextResponse.json({ categories: getMenu() });
}
