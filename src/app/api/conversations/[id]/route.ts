import { NextResponse } from "next/server";
import { getConversation, updateConversation } from "@/lib/api/conversations";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse } from "@/lib/api/route-error";
import { UpdateConversationSchema } from "@/lib/schemas/conversation";
import { badRequest, parseConversationId, parseJsonBody } from "../_request";

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_request: Request, { params }: Ctx) {
    const { id } = await params;
    const conversation = parseConversationId(id);
    if (!conversation.ok) return badRequest(["Invalid conversation id"]);

    try {
        return NextResponse.json(await getConversation(conversation.id));
    } catch (error) {
        if (error instanceof ApiError) return apiErrorResponse(error);
        throw error;
    }
}

/** Archive and block both live here; the backend rejects an empty patch. */
export async function PATCH(request: Request, { params }: Ctx) {
    const { id } = await params;
    const conversation = parseConversationId(id);
    if (!conversation.ok) return badRequest(["Invalid conversation id"]);

    const body = await parseJsonBody(request, UpdateConversationSchema);
    if (!body.ok) return body.response;

    try {
        return NextResponse.json(await updateConversation(conversation.id, body.data));
    } catch (error) {
        if (error instanceof ApiError) return apiErrorResponse(error);
        throw error;
    }
}
