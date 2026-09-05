import { NextResponse } from "next/server";
import { reportConversation } from "@/lib/api/conversations";
import { ApiError } from "@/lib/api/errors";
import { apiErrorResponse } from "@/lib/api/route-error";
import { ReportSchema } from "@/lib/schemas/conversation";
import { badRequest, parseConversationId, parseJsonBody } from "../../_request";

type Ctx = { params: Promise<{ id: string }> };

export async function POST(request: Request, { params }: Ctx) {
    const { id } = await params;
    const conversation = parseConversationId(id);
    if (!conversation.ok) return badRequest(["Invalid conversation id"]);

    const body = await parseJsonBody(request, ReportSchema);
    if (!body.ok) return body.response;

    try {
        return NextResponse.json(await reportConversation(conversation.id, body.data), {
            status: 201,
        });
    } catch (error) {
        if (error instanceof ApiError) return apiErrorResponse(error);
        throw error;
    }
}
