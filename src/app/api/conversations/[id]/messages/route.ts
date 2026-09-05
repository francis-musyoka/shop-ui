import { NextResponse } from "next/server";
import { getMessages, sendMessage } from "@/lib/api/conversations";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse } from "@/lib/api/route-error";
import { MessageCursorQuerySchema, SendMessageSchema } from "@/lib/schemas/conversation";
import { badRequest, parseConversationId, parseJsonBody } from "../../_request";

type Ctx = { params: Promise<{ id: string }> };

/**
 * Serves two callers with one endpoint: the thread's backwards pager (`before`)
 * and the 5s sync poll (`after`). The backend rejects both cursors at once, so
 * that combination is refused here before a round trip.
 */
export async function GET(request: Request, { params }: Ctx) {
    const { id } = await params;
    const conversation = parseConversationId(id);
    if (!conversation.ok) return badRequest(["Invalid conversation id"]);

    const { searchParams } = new URL(request.url);
    const parsed = MessageCursorQuerySchema.safeParse({
        limit: searchParams.get("limit") ?? undefined,
        before: searchParams.get("before") ?? undefined,
        after: searchParams.get("after") ?? undefined,
    });
    if (!parsed.success) return badRequest(parsed.error.issues.map((i) => i.message));

    try {
        return NextResponse.json(await getMessages(conversation.id, parsed.data));
    } catch (error) {
        if (error instanceof ApiError) return apiErrorResponse(error);
        throw error;
    }
}

export async function POST(request: Request, { params }: Ctx) {
    const { id } = await params;
    const conversation = parseConversationId(id);
    if (!conversation.ok) return badRequest(["Invalid conversation id"]);

    const body = await parseJsonBody(request, SendMessageSchema);
    if (!body.ok) return body.response;

    try {
        // 201 mirrors the backend's own status. A send always creates a row,
        // so there is no no-op case to distinguish -- that rationale belongs to
        // POST /conversations, which is idempotent and deliberately flattens
        // its status to 200 (spec §8.1).
        return NextResponse.json(await sendMessage(conversation.id, body.data), { status: 201 });
    } catch (error) {
        if (error instanceof ApiError) return apiErrorResponse(error);
        throw error;
    }
}
