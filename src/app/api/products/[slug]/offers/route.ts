import { NextResponse } from "next/server";
import { getVariantOffers } from "@/lib/api/products";
import { ApiError } from "@/lib/api/errors";

export async function GET(request: Request, { params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;
    const { searchParams } = new URL(request.url);

    const variantId = searchParams.get("variantId");
    if (!variantId) {
        return NextResponse.json(
            { success: false, error: "variantId is required" },
            { status: 400 },
        );
    }

    // `|| default` guards against a non-numeric query value (Number("abc") is
    // NaN) being forwarded to the backend as the literal string "NaN".
    const page = Number(searchParams.get("page")) || 1;
    const limit = Number(searchParams.get("limit")) || 20;

    try {
        const data = await getVariantOffers(slug, { variantId, page, limit });
        return NextResponse.json(data);
    } catch (error) {
        if (error instanceof ApiError) {
            // apiFetch uses statusCode 0 for network failures; clamp anything
            // outside the valid HTTP range so NextResponse.json can't throw a
            // RangeError and mask the error envelope with a generic 500.
            const status =
                error.statusCode >= 400 && error.statusCode <= 599 ? error.statusCode : 502;
            return NextResponse.json({ success: false, error: error.messages }, { status });
        }
        throw error;
    }
}
