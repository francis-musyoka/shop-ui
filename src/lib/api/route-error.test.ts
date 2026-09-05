import { describe, it, expect } from "vitest";
import { ApiError } from "./errors";
import { apiErrorResponse } from "./route-error";

describe("apiErrorResponse", () => {
    it("passes a real HTTP status straight through", async () => {
        const res = apiErrorResponse(
            new ApiError({ statusCode: 429, code: "RATE_LIMITED", messages: ["Slow down"] }),
        );
        expect(res.status).toBe(429);
        await expect(res.json()).resolves.toEqual({ success: false, error: ["Slow down"] });
    });

    it("clamps a network failure (statusCode 0) to 502", () => {
        const res = apiErrorResponse(
            new ApiError({ statusCode: 0, code: "INTERNAL_SERVER_ERROR", messages: ["Network"] }),
        );
        expect(res.status).toBe(502);
    });

    it("clamps an out-of-range status to 502", () => {
        const res = apiErrorResponse(
            new ApiError({ statusCode: 999, code: "INTERNAL_SERVER_ERROR", messages: ["Weird"] }),
        );
        expect(res.status).toBe(502);
    });

    it("preserves every message in the envelope", async () => {
        const res = apiErrorResponse(
            new ApiError({ statusCode: 400, code: "VALIDATION_ERROR", messages: ["a", "b"] }),
        );
        await expect(res.json()).resolves.toEqual({ success: false, error: ["a", "b"] });
    });
});
