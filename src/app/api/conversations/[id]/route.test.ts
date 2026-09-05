import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api/errors";

const getConversation = vi.fn();
const updateConversation = vi.fn();

vi.mock("@/lib/api/conversations", () => ({
    getConversation: (...args: unknown[]) => getConversation(...args),
    updateConversation: (...args: unknown[]) => updateConversation(...args),
}));

import { GET, PATCH } from "./route";

const ID = "cnv1aaaaaaaaaaaaaaaaaaaa";
const params = Promise.resolve({ id: ID });

beforeEach(() => {
    getConversation.mockReset();
    updateConversation.mockReset();
});

function patch(body: unknown, id = ID) {
    return PATCH(
        new Request(`http://localhost/api/conversations/${id}`, {
            method: "PATCH",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        }),
        { params: Promise.resolve({ id }) },
    );
}

describe("GET /api/conversations/[id]", () => {
    it("forwards the id and returns the thread verbatim", async () => {
        getConversation.mockResolvedValue({ success: true, conversation: { id: ID } });
        const res = await GET(new Request(`http://localhost/api/conversations/${ID}`), { params });

        expect(getConversation).toHaveBeenCalledWith(ID);
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ success: true, conversation: { id: ID } });
    });

    it("400s on a malformed id without calling the backend", async () => {
        const res = await GET(new Request("http://localhost/api/conversations/x"), {
            params: Promise.resolve({ id: "x" }),
        });

        expect(res.status).toBe(400);
        expect(getConversation).not.toHaveBeenCalled();
    });

    it("passes a non-participant 404 through unchanged", async () => {
        getConversation.mockRejectedValue(
            new ApiError({
                statusCode: 404,
                code: "NOT_FOUND",
                messages: ["Conversation not found"],
            }),
        );
        const res = await GET(new Request(`http://localhost/api/conversations/${ID}`), { params });

        expect(res.status).toBe(404);
    });
});

describe("PATCH /api/conversations/[id]", () => {
    it("forwards an archive patch", async () => {
        updateConversation.mockResolvedValue({ success: true, conversation: { id: ID } });
        const res = await patch({ archived: true });

        expect(updateConversation).toHaveBeenCalledWith(ID, { archived: true });
        expect(res.status).toBe(200);
    });

    it("forwards a block patch", async () => {
        updateConversation.mockResolvedValue({ success: true, conversation: { id: ID } });
        await patch({ blocked: true });

        expect(updateConversation).toHaveBeenCalledWith(ID, { blocked: true });
    });

    it("400s on an empty patch without calling the backend", async () => {
        const res = await patch({});

        expect(res.status).toBe(400);
        expect(updateConversation).not.toHaveBeenCalled();
    });

    it("400s on a malformed id", async () => {
        const res = await patch({ archived: true }, "x");

        expect(res.status).toBe(400);
        expect(updateConversation).not.toHaveBeenCalled();
    });
});
