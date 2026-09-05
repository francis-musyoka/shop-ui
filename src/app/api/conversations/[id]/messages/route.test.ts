import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api/errors";

const getMessages = vi.fn();
const sendMessage = vi.fn();

vi.mock("@/lib/api/conversations", () => ({
    getMessages: (...args: unknown[]) => getMessages(...args),
    sendMessage: (...args: unknown[]) => sendMessage(...args),
}));

import { GET, POST } from "./route";

const ID = "cnv1aaaaaaaaaaaaaaaaaaaa";
const MSG = "msg1aaaaaaaaaaaaaaaaaaaa";
const params = Promise.resolve({ id: ID });

beforeEach(() => {
    getMessages.mockReset();
    sendMessage.mockReset();
});

describe("GET .../messages", () => {
    it("defaults to a 20-row page with no cursor", async () => {
        getMessages.mockResolvedValue({ success: true, data: [], direction: "before" });
        await GET(new Request(`http://localhost/api/conversations/${ID}/messages`), { params });
        expect(getMessages).toHaveBeenCalledWith(ID, {
            limit: 20,
            before: undefined,
            after: undefined,
        });
    });

    it("forwards the after cursor used by the sync poll", async () => {
        getMessages.mockResolvedValue({ success: true, data: [], direction: "after" });
        await GET(new Request(`http://localhost/api/conversations/${ID}/messages?after=${MSG}`), {
            params,
        });
        expect(getMessages).toHaveBeenCalledWith(ID, {
            limit: 20,
            before: undefined,
            after: MSG,
        });
    });

    it("400s when both cursors are supplied", async () => {
        const res = await GET(
            new Request(
                `http://localhost/api/conversations/${ID}/messages?before=${MSG}&after=${MSG}`,
            ),
            { params },
        );
        expect(res.status).toBe(400);
        expect(getMessages).not.toHaveBeenCalled();
    });

    it("400s on a malformed conversation id", async () => {
        const res = await GET(new Request("http://localhost/api/conversations/x/messages"), {
            params: Promise.resolve({ id: "x" }),
        });
        expect(res.status).toBe(400);
        expect(getMessages).not.toHaveBeenCalled();
    });
});

describe("POST .../messages", () => {
    function post(body: unknown) {
        return POST(
            new Request(`http://localhost/api/conversations/${ID}/messages`, {
                method: "POST",
                body: JSON.stringify(body),
                headers: { "Content-Type": "application/json" },
            }),
            { params },
        );
    }

    it("forwards text with an attached offer", async () => {
        sendMessage.mockResolvedValue({ success: true, message: { id: MSG } });
        const res = await post({ body: "Hi", offerId: "ofr1aaaaaaaaaaaaaaaaaaaa" });
        expect(sendMessage).toHaveBeenCalledWith(ID, {
            body: "Hi",
            offerId: "ofr1aaaaaaaaaaaaaaaaaaaa",
        });
        expect(res.status).toBe(201);
    });

    it("400s on an empty message without calling the backend", async () => {
        const res = await post({});
        expect(res.status).toBe(400);
        expect(sendMessage).not.toHaveBeenCalled();
    });

    it("400s on a body over the 2000-char limit", async () => {
        const res = await post({ body: "x".repeat(2001) });
        expect(res.status).toBe(400);
        expect(sendMessage).not.toHaveBeenCalled();
    });

    it("passes the rate-limit status through unchanged", async () => {
        sendMessage.mockRejectedValue(
            new ApiError({
                statusCode: 429,
                code: "RATE_LIMITED",
                messages: ["Too many messages. Please slow down and try again shortly."],
            }),
        );
        const res = await post({ body: "Hi" });
        expect(res.status).toBe(429);
    });

    it("passes the blocked 403 through unchanged", async () => {
        sendMessage.mockRejectedValue(
            new ApiError({
                statusCode: 403,
                code: "FORBIDDEN",
                messages: ["This conversation is blocked"],
            }),
        );
        const res = await post({ body: "Hi" });
        expect(res.status).toBe(403);
    });
});
