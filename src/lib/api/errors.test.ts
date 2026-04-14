import { describe, it, expect } from "vitest";
import { ApiError, parseBackendError } from "./errors";

describe("ApiError", () => {
    it("captures status, code, and messages", () => {
        const err = new ApiError({
            statusCode: 400,
            code: "VALIDATION_ERROR",
            messages: ["Email is required"],
        });
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe("VALIDATION_ERROR");
        expect(err.messages).toEqual(["Email is required"]);
        expect(err.message).toBe("Email is required");
        expect(err).toBeInstanceOf(Error);
    });

    it("joins multiple messages into the .message string", () => {
        const err = new ApiError({
            statusCode: 400,
            code: "VALIDATION_ERROR",
            messages: ["a", "b", "c"],
        });
        expect(err.message).toBe("a; b; c");
    });

    it("isFieldLevel reflects whether messages came from validation", () => {
        expect(
            new ApiError({ statusCode: 400, code: "VALIDATION_ERROR", messages: ["x"] })
                .isFieldLevel,
        ).toBe(true);
        expect(
            new ApiError({ statusCode: 401, code: "UNAUTHORIZED", messages: ["x"] }).isFieldLevel,
        ).toBe(false);
    });
});

describe("parseBackendError", () => {
    it("normalizes a string-error response", () => {
        const err = parseBackendError(401, { success: false, error: "Invalid credentials" });
        expect(err.statusCode).toBe(401);
        expect(err.code).toBe("UNAUTHORIZED");
        expect(err.messages).toEqual(["Invalid credentials"]);
    });

    it("normalizes an array-error response (validation)", () => {
        const err = parseBackendError(400, {
            success: false,
            error: ["Email must be valid", "Password too short"],
        });
        expect(err.statusCode).toBe(400);
        expect(err.code).toBe("VALIDATION_ERROR");
        expect(err.messages).toEqual(["Email must be valid", "Password too short"]);
        expect(err.isFieldLevel).toBe(true);
    });

    it("falls back to a generic error when body is unparseable", () => {
        const err = parseBackendError(500, { foo: "bar" });
        expect(err.statusCode).toBe(500);
        expect(err.code).toBe("INTERNAL_SERVER_ERROR");
        expect(err.messages).toEqual(["Something went wrong. Please try again."]);
    });

    it("falls back when body is null", () => {
        const err = parseBackendError(503, null);
        expect(err.statusCode).toBe(503);
        expect(err.code).toBe("INTERNAL_SERVER_ERROR");
        expect(err.messages).toHaveLength(1);
    });

    it("maps known statuses to friendly codes", () => {
        expect(parseBackendError(401, { success: false, error: "x" }).code).toBe("UNAUTHORIZED");
        expect(parseBackendError(403, { success: false, error: "x" }).code).toBe("FORBIDDEN");
        expect(parseBackendError(404, { success: false, error: "x" }).code).toBe("NOT_FOUND");
        expect(parseBackendError(409, { success: false, error: "x" }).code).toBe("CONFLICT");
        expect(parseBackendError(429, { success: false, error: "x" }).code).toBe("RATE_LIMITED");
    });
});
