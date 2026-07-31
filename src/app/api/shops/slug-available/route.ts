import { NextRequest, NextResponse } from "next/server";
import { isSlugAvailable } from "@/lib/api/shops";

export async function GET(req: NextRequest) {
    const slug = req.nextUrl.searchParams.get("slug")?.trim() ?? "";
    if (slug.length < 2) return NextResponse.json({ available: false });
    return NextResponse.json({ available: await isSlugAvailable(slug) });
}
