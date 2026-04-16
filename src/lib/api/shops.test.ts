import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

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

import shopFixtures from "../../../tests/fixtures/backend/shops.json";
import { getShopBySlug } from "./shops";

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

describe("getShopBySlug", () => {
    it("returns the shop object (unwrapped)", async () => {
        mockFetchResponse(shopFixtures.detailSuccess);
        const shop = await getShopBySlug("techhub-kenya");
        expect(shop.name).toBe("TechHub Kenya");
        expect(shop.isVerified).toBe(true);
        expect(shop.shopAddress.city).toBe("Nairobi");
    });

    it("calls the correct URL path", async () => {
        mockFetchResponse(shopFixtures.detailSuccess);
        await getShopBySlug("techhub-kenya");
        const url = (globalThis.fetch as Mock).mock.calls[0]![0] as string;
        expect(url).toContain("/api/shops/techhub-kenya");
    });
});
