import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api/errors";

const reportConversation = vi.fn();

vi.mock("@/lib/api/conversations", () => ({
    reportConversation: (...args: unknown[]) => reportConversation(...args),
}));

import { POST } from "./route";

const ID = "cnv1aaaaaaaaaaaaaaaaaaaa";

function report(body: unknown, id = ID) {
    return POST(
        new Request(`http://localhost/api/conversations/${id}/reports`, {
            method: "POST",
            body: JSON.stringify(body),
            headers: { "Content-Type": "application/json" },
        }),
        { params: Promise.resolve({ id }) },
    );
}

beforeEach(() => {
    reportConversation.mockReset();
});

describe("POST /api/conversations/[id]/reports", () => {
    it("forwards a reason with an optional note at 201", async () => {
        reportConversation.mockResolvedValue({ success: true, report: { id: "rep1" } });
        const res = await report({ reason: "SCAM", note: "Asked for M-Pesa" });

        expect(reportConversation).toHaveBeenCalledWith(ID, {
            reason: "SCAM",
            note: "Asked for M-Pesa",
        });
        expect(res.status).toBe(201);
    });

    it("forwards a reason with no note", async () => {
        reportConversation.mockResolvedValue({ success: true, report: { id: "rep1" } });
        await report({ reason: "SPAM" });

        expect(reportConversation).toHaveBeenCalledWith(ID, { reason: "SPAM" });
    });

    it("400s on a reason outside the enum without calling the backend", async () => {
        const res = await report({ reason: "RUDE" });

        expect(res.status).toBe(400);
        expect(reportConversation).not.toHaveBeenCalled();
    });

    it("400s on a note over 500 characters", async () => {
        const res = await report({ reason: "OTHER", note: "x".repeat(501) });

        expect(res.status).toBe(400);
        expect(reportConversation).not.toHaveBeenCalled();
    });

    it("passes a backend failure through unchanged", async () => {
        reportConversation.mockRejectedValue(
            new ApiError({ statusCode: 403, code: "FORBIDDEN", messages: ["Forbidden"] }),
        );
        const res = await report({ reason: "SPAM" });

        expect(res.status).toBe(403);
    });
});
