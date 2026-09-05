import { NextResponse } from "next/server";
import { getUnreadSummary } from "@/lib/api/conversations";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse } from "@/lib/api/route-error";

/**
 * Returns both sides' counts in one call, so the navbar badge (customer) and
 * the seller nav badge (shop) share a single query instead of polling twice.
 */
export async function GET() {
    try {
        return NextResponse.json(await getUnreadSummary());
    } catch (error) {
        if (error instanceof ApiError) return apiErrorResponse(error);
        throw error;
    }
}
