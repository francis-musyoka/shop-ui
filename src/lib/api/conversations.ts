import "server-only";
import { apiFetch } from "./client";
import {
    ConversationListResponseSchema,
    ConversationResponseSchema,
    MarkReadResponseSchema,
    MessagesResponseSchema,
    ReportResponseSchema,
    SendMessageResponseSchema,
    UnreadSummaryResponseSchema,
} from "@/lib/schemas/conversation";

const BASE = "/api/conversations";

/**
 * Idempotent on the backend: 201 when the thread is new, 200 when it already
 * existed. Both parse the same, so callers never branch on it.
 */
export function createConversation(shopId: string) {
    return apiFetch({
        path: BASE,
        method: "POST",
        body: { shopId },
        schema: ConversationResponseSchema,
    });
}

export function listConversations(query: {
    as: "customer" | "shop";
    archived: boolean;
    page: number;
    limit: number;
}) {
    return apiFetch({ path: BASE, query, schema: ConversationListResponseSchema });
}

export function getUnreadSummary() {
    return apiFetch({ path: `${BASE}/unread-summary`, schema: UnreadSummaryResponseSchema });
}

export function getConversation(id: string) {
    return apiFetch({ path: `${BASE}/${id}`, schema: ConversationResponseSchema });
}

export function getMessages(id: string, query: { limit: number; before?: string; after?: string }) {
    // buildUrl drops undefined values, so passing both keys is safe — the
    // backend rejects receiving both at once.
    return apiFetch({
        path: `${BASE}/${id}/messages`,
        query: { limit: query.limit, before: query.before, after: query.after },
        schema: MessagesResponseSchema,
    });
}

export function sendMessage(
    id: string,
    body: { body?: string; imageUrl?: string; offerId?: string },
) {
    return apiFetch({
        path: `${BASE}/${id}/messages`,
        method: "POST",
        body,
        schema: SendMessageResponseSchema,
    });
}

export function markConversationRead(id: string) {
    return apiFetch({
        path: `${BASE}/${id}/read`,
        method: "PATCH",
        schema: MarkReadResponseSchema,
    });
}

export function updateConversation(id: string, body: { archived?: boolean; blocked?: boolean }) {
    return apiFetch({
        path: `${BASE}/${id}`,
        method: "PATCH",
        body,
        schema: ConversationResponseSchema,
    });
}

export function reportConversation(id: string, body: { reason: string; note?: string }) {
    return apiFetch({
        path: `${BASE}/${id}/reports`,
        method: "POST",
        body,
        schema: ReportResponseSchema,
    });
}
