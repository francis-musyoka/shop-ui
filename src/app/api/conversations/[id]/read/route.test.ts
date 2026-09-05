import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api/errors";

const markConversationRead = vi.fn();

vi.mock("@/lib/api/conversations", () => ({
    markConversationRead: (...args: unknown[]) => markConversationRead(...args),
}));

import { PATCH } from "./route";

const ID = "cnv1aaaaaaaaaaaaaaaaaaaa";

function read(id = ID) {
    return PATCH(
        new Request(`http://localhost/api/conversations/${id}/read`, { method: "PATCH" }),
        {
            params: Promise.resolve({ id }),
        },
    );
}

beforeEach(() => {
    markConversationRead.mockReset();
});

describe("PATCH /api/conversations/[id]/read", () => {
    it("zeroes the caller's unread counter and returns the body verbatim", async () => {
        markConversationRead.mockResolvedValue({ success: true, unreadCount: 0 });
        const res = await read();

        expect(markConversationRead).toHaveBeenCalledWith(ID);
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ success: true, unreadCount: 0 });
    });

    it("400s on a malformed id without calling the backend", async () => {
        const res = await read("x");

        expect(res.status).toBe(400);
        expect(markConversationRead).not.toHaveBeenCalled();
    });

    it("passes a 404 through unchanged", async () => {
        markConversationRead.mockRejectedValue(
            new ApiError({
                statusCode: 404,
                code: "NOT_FOUND",
                messages: ["Conversation not found"],
            }),
        );
        const res = await read();

        expect(res.status).toBe(404);
    });
});
