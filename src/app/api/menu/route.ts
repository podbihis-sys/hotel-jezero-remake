import { NextResponse } from "next/server";
import { getMenuItems } from "@/lib/page-store";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const items = await getMenuItems();
    return NextResponse.json(items, {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=300" },
    });
  } catch {
    return NextResponse.json([]);
  }
}
