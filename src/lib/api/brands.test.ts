import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({
    env: {
        BACKEND_API_URL: "http://localhost:4000",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NODE_ENV: "test",
    },
}));
vi.mock("@/lib/auth/cookie-store", () => ({
    readCookieHeader: vi.fn().mockResolvedValue(""),
    writeCookie: vi.fn(),
    deleteCookie: vi.fn(),
}));

import brandFixtures from "../../../tests/fixtures/backend/brands.json";
import { listBrands } from "./brands";

beforeEach(() => {
    vi.restoreAllMocks();
});

function mockFetchResponse(body: unknown, status = 200) {
    const response = new Response(JSON.stringify(body), {
        status,
        headers: { "content-type": "application/json" },
    });
    vi.spyOn(globalThis, "fetch").mockResolvedValue(response);
}

describe("listBrands", () => {
    it("returns the brands array (unwrapped)", async () => {
        mockFetchResponse(brandFixtures.listSuccess);
        const brands = await listBrands();
        expect(brands).toHaveLength(3);
        expect(brands[0]!.name).toBe("Samsung");
    });
});
