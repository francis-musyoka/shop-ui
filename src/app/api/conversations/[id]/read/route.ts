import { NextResponse } from "next/server";
import { markConversationRead } from "@/lib/api/conversations";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse } from "@/lib/api/route-error";
import { badRequest, parseConversationId } from "../../_request";

type Ctx = { params: Promise<{ id: string }> };

/** Zeroes the caller's own unread counter. No body. */
export async function PATCH(_request: Request, { params }: Ctx) {
    const { id } = await params;
    const conversation = parseConversationId(id);
    if (!conversation.ok) return badRequest(["Invalid conversation id"]);

    try {
        return NextResponse.json(await markConversationRead(conversation.id));
    } catch (error) {
        if (error instanceof ApiError) return apiErrorResponse(error);
        throw error;
    }
}
