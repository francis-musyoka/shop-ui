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

import categoryFixtures from "../../../tests/fixtures/backend/categories.json";
import {
    getCategoryTree,
    getTopLevelCategories,
    getCategoryBySlug,
    getCategoryBreadcrumb,
} from "./categories";

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

describe("getCategoryTree", () => {
    it("returns the categories array (unwrapped)", async () => {
        mockFetchResponse(categoryFixtures.treeSuccess);
        const tree = await getCategoryTree();
        expect(tree).toHaveLength(2);
        expect(tree[0]!.children).toHaveLength(2);
    });
});

describe("getTopLevelCategories", () => {
    it("returns flat categories", async () => {
        mockFetchResponse(categoryFixtures.topLevelSuccess);
        const cats = await getTopLevelCategories();
        expect(cats).toHaveLength(3);
        expect(cats[0]!.name).toBe("Electronics");
    });
});

describe("getCategoryBySlug", () => {
    it("returns category with parent and children", async () => {
        mockFetchResponse(categoryFixtures.bySlugSuccess);
        const cat = await getCategoryBySlug("phones");
        expect(cat.name).toBe("Phones");
        expect(cat.parent?.name).toBe("Electronics");
        expect(cat.children).toHaveLength(1);
    });

    it("calls the correct URL path", async () => {
        mockFetchResponse(categoryFixtures.bySlugSuccess);
        await getCategoryBySlug("phones");
        const url = (globalThis.fetch as Mock).mock.calls[0]![0] as string;
        expect(url).toContain("/api/categories/phones");
    });
});

describe("getCategoryBreadcrumb", () => {
    it("returns ordered breadcrumb items", async () => {
        mockFetchResponse(categoryFixtures.breadcrumbSuccess);
        const crumbs = await getCategoryBreadcrumb("phones");
        expect(crumbs).toHaveLength(2);
        expect(crumbs[0]!.name).toBe("Electronics");
        expect(crumbs[1]!.name).toBe("Phones");
    });
});
