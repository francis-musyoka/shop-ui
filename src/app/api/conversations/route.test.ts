import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api/errors";

const listConversations = vi.fn();
const createConversation = vi.fn();

vi.mock("@/lib/api/conversations", () => ({
    listConversations: (...args: unknown[]) => listConversations(...args),
    createConversation: (...args: unknown[]) => createConversation(...args),
}));

import { GET, POST } from "./route";

beforeEach(() => {
    listConversations.mockReset();
    createConversation.mockReset();
});

function get(url: string) {
    return GET(new Request(url));
}

function post(body: unknown) {
    return POST(
        new Request("http://localhost/api/conversations", {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        }),
    );
}

describe("GET /api/conversations", () => {
    it("defaults to the customer side, unarchived, page 1", async () => {
        listConversations.mockResolvedValue({ success: true, data: [], pagination: {} });
        await get("http://localhost/api/conversations");
        expect(listConversations).toHaveBeenCalledWith({
            as: "customer",
            archived: false,
            page: 1,
            limit: 20,
        });
    });

    it("passes through the shop side and archived flag", async () => {
        listConversations.mockResolvedValue({ success: true, data: [], pagination: {} });
        await get("http://localhost/api/conversations?as=shop&archived=true&page=3&limit=10");
        expect(listConversations).toHaveBeenCalledWith({
            as: "shop",
            archived: true,
            page: 3,
            limit: 10,
        });
    });

    it("treats archived=false as false", async () => {
        listConversations.mockResolvedValue({ success: true, data: [], pagination: {} });
        await get("http://localhost/api/conversations?archived=false");
        expect(listConversations).toHaveBeenCalledWith(
            expect.objectContaining({ archived: false }),
        );
    });

    it("400s on an unknown side rather than forwarding it", async () => {
        const res = await get("http://localhost/api/conversations?as=admin");
        expect(res.status).toBe(400);
        expect(listConversations).not.toHaveBeenCalled();
    });

    it("maps a backend failure onto its status", async () => {
        listConversations.mockRejectedValue(
            new ApiError({ statusCode: 404, code: "NOT_FOUND", messages: ["Shop not found"] }),
        );
        const res = await get("http://localhost/api/conversations?as=shop");
        expect(res.status).toBe(404);
        await expect(res.json()).resolves.toEqual({
            success: false,
            error: ["Shop not found"],
        });
    });
});

describe("POST /api/conversations", () => {
    it("forwards a valid shopId", async () => {
        createConversation.mockResolvedValue({ success: true, conversation: { id: "x" } });
        const res = await post({ shopId: "shp1aaaaaaaaaaaaaaaaaaaa" });
        expect(createConversation).toHaveBeenCalledWith("shp1aaaaaaaaaaaaaaaaaaaa");
        expect(res.status).toBe(200);
    });

    it("400s on a malformed shopId without calling the backend", async () => {
        const res = await post({ shopId: "nope" });
        expect(res.status).toBe(400);
        expect(createConversation).not.toHaveBeenCalled();
    });

    it("surfaces the own-shop 422 from the backend", async () => {
        createConversation.mockRejectedValue(
            new ApiError({
                statusCode: 422,
                code: "INTERNAL_SERVER_ERROR",
                messages: ["You cannot message your own shop"],
            }),
        );
        const res = await post({ shopId: "shp1aaaaaaaaaaaaaaaaaaaa" });
        expect(res.status).toBe(422);
        await expect(res.json()).resolves.toEqual({
            success: false,
            error: ["You cannot message your own shop"],
        });
    });
});
