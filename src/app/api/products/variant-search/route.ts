import { NextRequest, NextResponse } from "next/server";
import { searchVariants } from "@/lib/api/offers";

export async function GET(req: NextRequest) {
    const p = req.nextUrl.searchParams;
    const search = p.get("search")?.trim() ?? "";
    if (search.length < 4)
        return NextResponse.json({
            success: true,
            data: [],
            pagination: { page: 1, limit: 20, total: 0, totalPages: 0 },
        });
    const res = await searchVariants({
        search,
        categoryId: p.get("categoryId") ?? undefined,
        brandId: p.get("brandId") ?? undefined,
        page: Number(p.get("page") ?? 1),
    });
    return NextResponse.json(res);
}
