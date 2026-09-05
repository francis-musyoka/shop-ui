import { NextResponse } from "next/server";
import type { z } from "zod";
import { CUID } from "@/lib/schemas/common";

export function badRequest(messages: string[]): NextResponse {
    return NextResponse.json({ success: false, error: messages }, { status: 400 });
}

/** Validates the dynamic segment before it reaches the backend. */
export function parseConversationId(id: string): { ok: true; id: string } | { ok: false } {
    return CUID.safeParse(id).success ? { ok: true, id } : { ok: false };
}

/**
 * Reads and validates a JSON body. A non-JSON body is a 400, not a crash —
 * the browser is the only caller, but a malformed request should not 500.
 */
export async function parseJsonBody<T extends z.ZodTypeAny>(
    request: Request,
    schema: T,
): Promise<{ ok: true; data: z.infer<T> } | { ok: false; response: NextResponse }> {
    let raw: unknown;
    try {
        raw = await request.json();
    } catch {
        return { ok: false, response: badRequest(["Request body must be JSON"]) };
    }

    const parsed = schema.safeParse(raw);
    if (!parsed.success) {
        return { ok: false, response: badRequest(parsed.error.issues.map((i) => i.message)) };
    }
    return { ok: true, data: parsed.data };
}
