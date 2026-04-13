import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";
import { z } from "zod";

vi.mock("server-only", () => ({}));
// Mock @/lib/env so env.ts doesn't throw at module load (Vitest doesn't load .env.local).
vi.mock("@/lib/env", () => ({
    env: {
        BACKEND_API_URL: "http://backend.test",
        NEXT_PUBLIC_APP_URL: "http://app.test",
        NODE_ENV: "test",
    },
}));
vi.mock("@/lib/auth/cookie-store", () => ({
    readCookieHeader: vi.fn(),
    writeCookie: vi.fn(),
}));

import { apiFetch } from "./client";
import { ApiError } from "./errors";
import { readCookieHeader, writeCookie } from "@/lib/auth/cookie-store";

const TestSchema = z.object({ ok: z.boolean() });

function jsonResponse(status: number, body: unknown, setCookies?: string[]): Response {
    const headers = new Headers({ "Content-Type": "application/json" });
    if (setCookies) {
        for (const c of setCookies) headers.append("Set-Cookie", c);
    }
    return new Response(JSON.stringify(body), { status, headers });
}

describe("apiFetch", () => {
    let fetchMock: Mock;

    beforeEach(() => {
        fetchMock = vi.fn();
        global.fetch = fetchMock as unknown as typeof fetch;
        vi.mocked(readCookieHeader).mockResolvedValue(undefined);
        vi.mocked(writeCookie).mockResolvedValue(undefined);
    });

    it("calls the backend with the joined URL and parses the response", async () => {
        fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));
        const result = await apiFetch({
            path: "/api/widgets",
            schema: TestSchema,
        });
        expect(result).toEqual({ ok: true });
        expect(fetchMock).toHaveBeenCalledTimes(1);
        expect(fetchMock).toHaveBeenCalledWith(
            "http://backend.test/api/widgets",
            expect.objectContaining({ method: "GET" }),
        );
    });

    it("appends query parameters and skips undefined values", async () => {
        fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));
        await apiFetch({
            path: "/api/widgets",
            schema: TestSchema,
            query: { q: "phone", page: 2, sort: undefined, isFeatured: true },
        });
        const calledUrl = fetchMock.mock.calls[0]?.[0] as string;
        expect(calledUrl).toContain("q=phone");
        expect(calledUrl).toContain("page=2");
        expect(calledUrl).toContain("isFeatured=true");
        expect(calledUrl).not.toContain("sort=");
    });

    it("serializes JSON body and sets Content-Type for POST", async () => {
        fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));
        await apiFetch({
            path: "/api/widgets",
            method: "POST",
            body: { name: "x" },
            schema: TestSchema,
        });
        const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
        expect(init.method).toBe("POST");
        expect((init.headers as Record<string, string>)["Content-Type"]).toBe("application/json");
        expect(init.body).toBe(JSON.stringify({ name: "x" }));
    });

    it("forwards incoming Cookie header by default", async () => {
        vi.mocked(readCookieHeader).mockResolvedValue("customerAccessToken=abc; foo=bar");
        fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));
        await apiFetch({ path: "/api/profile", schema: TestSchema });
        const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
        expect((init.headers as Record<string, string>).Cookie).toBe(
            "customerAccessToken=abc; foo=bar",
        );
    });

    it("does NOT forward cookies when forwardCookies is false", async () => {
        vi.mocked(readCookieHeader).mockResolvedValue("foo=bar");
        fetchMock.mockResolvedValue(jsonResponse(200, { ok: true }));
        await apiFetch({
            path: "/api/customers/signin",
            method: "POST",
            body: {},
            schema: TestSchema,
            forwardCookies: false,
        });
        const init = fetchMock.mock.calls[0]?.[1] as RequestInit;
        expect((init.headers as Record<string, string>).Cookie).toBeUndefined();
        expect(readCookieHeader).not.toHaveBeenCalled();
    });

    it("throws ApiError on non-2xx with backend error string", async () => {
        fetchMock.mockResolvedValue(
            jsonResponse(401, { success: false, error: "Invalid credentials" }),
        );
        await expect(
            apiFetch({ path: "/api/customers/signin", schema: TestSchema, forwardCookies: false }),
        ).rejects.toMatchObject({
            statusCode: 401,
            code: "UNAUTHORIZED",
            messages: ["Invalid credentials"],
        });
    });

    it("throws ApiError on non-2xx with backend error array", async () => {
        fetchMock.mockResolvedValue(
            jsonResponse(400, {
                success: false,
                error: ["a", "b"],
            }),
        );
        await expect(
            apiFetch({ path: "/api/x", schema: TestSchema, forwardCookies: false }),
        ).rejects.toMatchObject({
            statusCode: 400,
            code: "VALIDATION_ERROR",
            messages: ["a", "b"],
            isFieldLevel: true,
        });
    });

    it("falls back to INTERNAL_SERVER_ERROR if error body is not JSON", async () => {
        const headers = new Headers({ "Content-Type": "text/plain" });
        fetchMock.mockResolvedValue(new Response("oops", { status: 500, headers }));
        await expect(
            apiFetch({ path: "/api/x", schema: TestSchema, forwardCookies: false }),
        ).rejects.toMatchObject({
            statusCode: 500,
            code: "INTERNAL_SERVER_ERROR",
        });
    });

    it("throws ApiError when fetch itself throws (network failure)", async () => {
        fetchMock.mockRejectedValue(new Error("ECONNREFUSED"));
        await expect(
            apiFetch({ path: "/api/x", schema: TestSchema, forwardCookies: false }),
        ).rejects.toBeInstanceOf(ApiError);
    });

    it("writes parsed Set-Cookie headers via writeCookie on 2xx", async () => {
        fetchMock.mockResolvedValue(
            jsonResponse(200, { ok: true }, [
                "customerAccessToken=abc; HttpOnly; Path=/; Max-Age=600",
                "customerRefreshToken=xyz; HttpOnly; Path=/api; Max-Age=604800",
            ]),
        );
        await apiFetch({
            path: "/api/customers/signin",
            method: "POST",
            body: {},
            schema: TestSchema,
            forwardCookies: false,
        });
        expect(writeCookie).toHaveBeenCalledTimes(2);
        expect(writeCookie).toHaveBeenCalledWith(
            expect.objectContaining({ name: "customerAccessToken", value: "abc", maxAge: 600 }),
        );
        expect(writeCookie).toHaveBeenCalledWith(
            expect.objectContaining({ name: "customerRefreshToken", value: "xyz", path: "/api" }),
        );
    });

    it("throws when response shape doesn't match the schema", async () => {
        fetchMock.mockResolvedValue(jsonResponse(200, { wrongField: 123 }));
        await expect(
            apiFetch({ path: "/api/x", schema: TestSchema, forwardCookies: false }),
        ).rejects.toThrow();
    });

    it("on 401 with cookie forwarding, attempts refresh and retries once", async () => {
        vi.mocked(readCookieHeader).mockResolvedValue("customerRefreshToken=tok");
        fetchMock
            .mockResolvedValueOnce(jsonResponse(401, { success: false, error: "Token expired" }))
            .mockResolvedValueOnce(
                jsonResponse(200, { success: true }, [
                    "customerAccessToken=newAbc; HttpOnly; Path=/",
                ]),
            )
            .mockResolvedValueOnce(jsonResponse(200, { ok: true }));

        const result = await apiFetch({
            path: "/api/profile",
            schema: TestSchema,
        });
        expect(result).toEqual({ ok: true });
        expect(fetchMock).toHaveBeenCalledTimes(3);
        const refreshCall = fetchMock.mock.calls[1];
        expect(refreshCall?.[0]).toBe("http://backend.test/api/customers/refresh-token");
    });

    it("does NOT attempt refresh when forwardCookies is false", async () => {
        fetchMock.mockResolvedValueOnce(jsonResponse(401, { success: false, error: "Bad creds" }));
        await expect(
            apiFetch({
                path: "/api/customers/signin",
                method: "POST",
                body: {},
                schema: TestSchema,
                forwardCookies: false,
            }),
        ).rejects.toMatchObject({ statusCode: 401 });
        expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    it("throws original 401 if refresh itself fails", async () => {
        vi.mocked(readCookieHeader).mockResolvedValue("customerRefreshToken=tok");
        fetchMock
            .mockResolvedValueOnce(jsonResponse(401, { success: false, error: "Token expired" }))
            .mockResolvedValueOnce(jsonResponse(401, { success: false, error: "Refresh expired" }));

        await expect(apiFetch({ path: "/api/profile", schema: TestSchema })).rejects.toMatchObject({
            statusCode: 401,
            messages: ["Token expired"],
        });
        expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    it("does not loop on 401 if the retry also returns 401", async () => {
        vi.mocked(readCookieHeader).mockResolvedValue("customerRefreshToken=tok");
        fetchMock
            .mockResolvedValueOnce(jsonResponse(401, { success: false, error: "Token expired" }))
            .mockResolvedValueOnce(jsonResponse(200, { success: true }))
            .mockResolvedValueOnce(jsonResponse(401, { success: false, error: "Still expired" }));

        await expect(apiFetch({ path: "/api/profile", schema: TestSchema })).rejects.toMatchObject({
            statusCode: 401,
            messages: ["Still expired"],
        });
        expect(fetchMock).toHaveBeenCalledTimes(3);
    });
});
