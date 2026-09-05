import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api/errors";

const getUnreadSummary = vi.fn();

vi.mock("@/lib/api/conversations", () => ({
    getUnreadSummary: () => getUnreadSummary(),
}));

import { GET } from "./route";

beforeEach(() => {
    getUnreadSummary.mockReset();
});

describe("GET /api/conversations/unread-summary", () => {
    it("returns both sides' counts verbatim", async () => {
        getUnreadSummary.mockResolvedValue({ success: true, customer: 3, shop: 7 });
        const res = await GET();
        expect(res.status).toBe(200);
        await expect(res.json()).resolves.toEqual({ success: true, customer: 3, shop: 7 });
    });

    it("maps a backend failure onto its status", async () => {
        getUnreadSummary.mockRejectedValue(
            new ApiError({ statusCode: 404, code: "NOT_FOUND", messages: ["Shop not found"] }),
        );
        const res = await GET();
        expect(res.status).toBe(404);
        await expect(res.json()).resolves.toEqual({
            success: false,
            error: ["Shop not found"],
        });
    });
});
