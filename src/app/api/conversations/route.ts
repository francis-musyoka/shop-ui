import { NextResponse } from "next/server";
import { z } from "zod";
import { createConversation, listConversations } from "@/lib/api/conversations";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse } from "@/lib/api/route-error";
import { ConversationListQuerySchema } from "@/lib/schemas/conversation";
import { CUID } from "@/lib/schemas/common";
import { badRequest, parseJsonBody } from "./_request";

const CreateBodySchema = z.object({ shopId: CUID });

/**
 * The browser's door to the conversation inbox. apiFetch is server-only, so
 * every client read goes through here; it forwards cookies and refreshes a
 * stale session on its own.
 *
 * ZodError from a response schema is deliberately NOT caught — that is
 * frontend/backend drift and must surface loudly as a 500.
 */
export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const parsed = ConversationListQuerySchema.safeParse({
        as: searchParams.get("as") ?? undefined,
        archived: searchParams.get("archived") ?? undefined,
        page: searchParams.get("page") ?? undefined,
        limit: searchParams.get("limit") ?? undefined,
    });

    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message));

    try {
        return NextResponse.json(await listConversations(parsed.data));
    } catch (error) {
        if (error instanceof ApiError) return apiErrorResponse(error);
        throw error;
    }
}

/**
 * Always answers 200, never 201: creating is idempotent -- an existing thread
 * comes back unchanged -- and MessageSellerDialog retries only the send, so the
 * create/no-op distinction the backend's status would carry is deliberately
 * flattened here (spec §8.1).
 */
export async function POST(request: Request) {
    const body = await parseJsonBody(request, CreateBodySchema);
    if (!body.ok) return body.response;

    try {
        return NextResponse.json(await createConversation(body.data.shopId));
    } catch (error) {
        if (error instanceof ApiError) return apiErrorResponse(error);
        throw error;
    }
}
