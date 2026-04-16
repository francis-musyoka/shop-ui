import { describe, it, expect } from "vitest";
import { parseSetCookieHeader, parseAllSetCookies } from "./forward-cookies";

describe("parseSetCookieHeader", () => {
    it("parses a simple cookie", () => {
        const result = parseSetCookieHeader("foo=bar");
        expect(result).toEqual({ name: "foo", value: "bar" });
    });

    it("parses Path attribute", () => {
        const result = parseSetCookieHeader("foo=bar; Path=/api");
        expect(result?.path).toBe("/api");
    });

    it("parses Max-Age attribute as a number", () => {
        const result = parseSetCookieHeader("foo=bar; Max-Age=600");
        expect(result?.maxAge).toBe(600);
    });

    it("flags Max-Age=0 as a deletion", () => {
        const result = parseSetCookieHeader("foo=; Max-Age=0; Path=/");
        expect(result).toEqual({
            name: "foo",
            value: "",
            maxAge: 0,
            path: "/",
            deletion: true,
        });
    });

    it("flags Expires in the past as a deletion", () => {
        const result = parseSetCookieHeader("foo=; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/");
        expect(result?.deletion).toBe(true);
        expect(result?.path).toBe("/");
    });

    it("flags empty-value cookies as a deletion", () => {
        const result = parseSetCookieHeader("foo=; Path=/");
        expect(result?.deletion).toBe(true);
    });

    it("does not flag normal cookies as a deletion", () => {
        const result = parseSetCookieHeader("foo=bar; Max-Age=600; Path=/");
        expect(result?.deletion).toBeUndefined();
    });

    it("parses HttpOnly and Secure as boolean flags", () => {
        const result = parseSetCookieHeader("foo=bar; HttpOnly; Secure");
        expect(result?.httpOnly).toBe(true);
        expect(result?.secure).toBe(true);
    });

    it("ignores unknown attributes silently", () => {
        const result = parseSetCookieHeader("foo=bar; Something=else; Path=/");
        expect(result).toEqual({ name: "foo", value: "bar", path: "/" });
    });

    it("returns null for malformed cookie strings", () => {
        expect(parseSetCookieHeader("")).toBeNull();
        expect(parseSetCookieHeader("no-equals-sign")).toBeNull();
        expect(parseSetCookieHeader("=no-name")).toBeNull();
    });

    it("decodes URL-encoded cookie values", () => {
        const result = parseSetCookieHeader("token=abc%20def");
        expect(result?.value).toBe("abc def");
    });

    it("preserves equals signs in cookie values", () => {
        const result = parseSetCookieHeader("token=eyJhbGc=; Path=/");
        expect(result?.value).toBe("eyJhbGc=");
    });
});

describe("parseAllSetCookies", () => {
    it("parses a list of cookie strings", () => {
        const result = parseAllSetCookies([
            "customerAccessToken=abc; HttpOnly; Path=/; Max-Age=600",
            "customerRefreshToken=xyz; HttpOnly; Path=/api; Max-Age=604800",
        ]);
        expect(result).toHaveLength(2);
        expect(result[0]?.name).toBe("customerAccessToken");
        expect(result[1]?.name).toBe("customerRefreshToken");
        expect(result[1]?.path).toBe("/api");
    });

    it("filters out malformed entries", () => {
        const result = parseAllSetCookies(["valid=ok", "garbage", "another=x"]);
        expect(result).toHaveLength(2);
        expect(result.map((c) => c.name)).toEqual(["valid", "another"]);
    });

    it("returns empty array when given empty input", () => {
        expect(parseAllSetCookies([])).toEqual([]);
    });
});
