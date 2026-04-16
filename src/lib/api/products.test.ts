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

import productFixtures from "../../../tests/fixtures/backend/products.json";
import { searchProducts, getProductBySlug } from "./products";

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

describe("searchProducts", () => {
    it("returns parsed search response", async () => {
        mockFetchResponse(productFixtures.searchSuccess);
        const result = await searchProducts();
        expect(result.data).toHaveLength(2);
        expect(result.pagination.total).toBe(120);
    });

    it("passes query params to fetch URL", async () => {
        mockFetchResponse(productFixtures.searchSuccess);
        await searchProducts({ search: "samsung", page: 2, limit: 10 });
        const fetchCall = (globalThis.fetch as Mock).mock.calls[0]!;
        const url = fetchCall[0] as string;
        expect(url).toContain("search=samsung");
        expect(url).toContain("page=2");
        expect(url).toContain("limit=10");
    });

    it("returns empty data for no results", async () => {
        mockFetchResponse(productFixtures.searchEmpty);
        const result = await searchProducts({ search: "nonexistent" });
        expect(result.data).toHaveLength(0);
    });
});

describe("getProductBySlug", () => {
    it("returns the product object (unwrapped)", async () => {
        mockFetchResponse(productFixtures.detailSuccess);
        const product = await getProductBySlug("samsung-galaxy-s24-ultra");
        expect(product.title).toBe("Samsung Galaxy S24 Ultra");
        expect(product.variants).toHaveLength(1);
    });

    it("calls the correct URL path", async () => {
        mockFetchResponse(productFixtures.detailSuccess);
        await getProductBySlug("samsung-galaxy-s24-ultra");
        const fetchCall = (globalThis.fetch as Mock).mock.calls[0]!;
        const url = fetchCall[0] as string;
        expect(url).toContain("/api/products/samsung-galaxy-s24-ultra");
    });
});
