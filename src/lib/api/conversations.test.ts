import { describe, it, expect, vi, beforeEach } from "vitest";
import {
    ConversationListResponseSchema,
    ConversationResponseSchema,
    MarkReadResponseSchema,
    MessagesResponseSchema,
    ReportResponseSchema,
    SendMessageResponseSchema,
    UnreadSummaryResponseSchema,
} from "@/lib/schemas/conversation";

type ApiCall = {
    path: string;
    method?: string;
    body?: unknown;
    query?: Record<string, unknown>;
    schema?: unknown;
};

const apiFetch = vi.fn<(req: ApiCall) => Promise<unknown>>();
vi.mock("./client", () => ({ apiFetch: (req: ApiCall) => apiFetch(req) }));

import {
    createConversation,
    listConversations,
    getUnreadSummary,
    getConversation,
    getMessages,
    sendMessage,
    markConversationRead,
    updateConversation,
    reportConversation,
} from "./conversations";

const ID = "cnv1aaaaaaaaaaaaaaaaaaaa";

beforeEach(() => {
    apiFetch.mockReset();
    apiFetch.mockResolvedValue({ success: true });
});

describe("conversations api", () => {
    it("posts a shopId to create a thread", async () => {
        await createConversation("shp1aaaaaaaaaaaaaaaaaaaa");
        const call = apiFetch.mock.calls[0]![0];
        expect(call).toEqual(
            expect.objectContaining({
                path: "/api/conversations",
                method: "POST",
                body: { shopId: "shp1aaaaaaaaaaaaaaaaaaaa" },
            }),
        );
        expect(call.schema).toBe(ConversationResponseSchema);
    });

    it("forwards inbox query params including the side", async () => {
        await listConversations({ as: "shop", archived: true, page: 2, limit: 20 });
        const call = apiFetch.mock.calls[0]![0];
        expect(call).toEqual(
            expect.objectContaining({
                path: "/api/conversations",
                query: { as: "shop", archived: true, page: 2, limit: 20 },
            }),
        );
        expect(call.schema).toBe(ConversationListResponseSchema);
    });

    it("hits the unread summary endpoint", async () => {
        await getUnreadSummary();
        const call = apiFetch.mock.calls[0]![0];
        expect(call).toEqual(
            expect.objectContaining({ path: "/api/conversations/unread-summary" }),
        );
        expect(call.schema).toBe(UnreadSummaryResponseSchema);
    });

    it("fetches a single thread", async () => {
        await getConversation(ID);
        const call = apiFetch.mock.calls[0]![0];
        expect(call).toEqual(expect.objectContaining({ path: `/api/conversations/${ID}` }));
        expect(call.schema).toBe(ConversationResponseSchema);
    });

    it("sends only the cursor that was provided", async () => {
        await getMessages(ID, { limit: 20, after: "msg1aaaaaaaaaaaaaaaaaaaa" });
        const call = apiFetch.mock.calls[0]![0];
        // Object equality treats a missing property as equal to undefined, so
        // toEqual with `before: undefined` would pass even if `before` were
        // never sent. Check the literal keys instead — buildUrl needs both
        // present (it drops the undefined one) since the backend rejects
        // receiving both cursors at once.
        expect(Object.keys(call.query!)).toEqual(["limit", "before", "after"]);
        expect(call.query!.after).toBe("msg1aaaaaaaaaaaaaaaaaaaa");
        expect(call).toEqual(
            expect.objectContaining({ path: `/api/conversations/${ID}/messages` }),
        );
        expect(call.schema).toBe(MessagesResponseSchema);
    });

    it("posts a message body to the thread", async () => {
        await sendMessage(ID, { body: "Hello" });
        const call = apiFetch.mock.calls[0]![0];
        expect(call).toEqual(
            expect.objectContaining({
                path: `/api/conversations/${ID}/messages`,
                method: "POST",
                body: { body: "Hello" },
            }),
        );
        expect(call.schema).toBe(SendMessageResponseSchema);
    });

    it("patches read state", async () => {
        await markConversationRead(ID);
        const call = apiFetch.mock.calls[0]![0];
        expect(call).toEqual(
            expect.objectContaining({ path: `/api/conversations/${ID}/read`, method: "PATCH" }),
        );
        expect(call.schema).toBe(MarkReadResponseSchema);
    });

    it("patches archive and block state", async () => {
        await updateConversation(ID, { archived: true });
        const call = apiFetch.mock.calls[0]![0];
        expect(call).toEqual(
            expect.objectContaining({
                path: `/api/conversations/${ID}`,
                method: "PATCH",
                body: { archived: true },
            }),
        );
        expect(call.schema).toBe(ConversationResponseSchema);
    });

    it("posts a report", async () => {
        await reportConversation(ID, { reason: "SPAM" });
        const call = apiFetch.mock.calls[0]![0];
        expect(call).toEqual(
            expect.objectContaining({
                path: `/api/conversations/${ID}/reports`,
                method: "POST",
                body: { reason: "SPAM" },
            }),
        );
        expect(call.schema).toBe(ReportResponseSchema);
    });
});
