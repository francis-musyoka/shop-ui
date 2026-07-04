import { describe, it, expect } from "vitest";
import {
    parseBrowseParams,
    toSearchProductsParams,
    getCsv,
    toggleCsv,
    setSingle,
    setPrice,
    setPage,
    PAGE_SIZE,
} from "./browse-params";

describe("parseBrowseParams", () => {
    it("returns defaults for empty input", () => {
        const f = parseBrowseParams({});
        expect(f).toEqual({
            search: undefined,
            categoryId: [],
            brandId: [],
            condition: [],
            minPrice: undefined,
            maxPrice: undefined,
            sort: "newest",
            page: 1,
        });
    });

    it("splits CSV lists and maps q to search", () => {
        const f = parseBrowseParams({
            q: "laptop",
            categoryId: "a,b",
            brandId: "x",
            condition: "NEW,USED",
        });
        expect(f.search).toBe("laptop");
        expect(f.categoryId).toEqual(["a", "b"]);
        expect(f.brandId).toEqual(["x"]);
        expect(f.condition).toEqual(["NEW", "USED"]);
    });

    it("drops invalid condition and sort values", () => {
        const f = parseBrowseParams({ condition: "NEW,BOGUS", sort: "nope" });
        expect(f.condition).toEqual(["NEW"]);
        expect(f.sort).toBe("newest");
    });

    it("coerces numeric price and page, ignoring garbage", () => {
        expect(parseBrowseParams({ minPrice: "10000", maxPrice: "x", page: "3" })).toMatchObject({
            minPrice: 10000,
            maxPrice: undefined,
            page: 3,
        });
        expect(parseBrowseParams({ page: "0" }).page).toBe(1);
    });

    it("takes the first value when a param repeats", () => {
        expect(parseBrowseParams({ sort: ["price_asc", "price_desc"] }).sort).toBe("price_asc");
    });
});

describe("toSearchProductsParams", () => {
    it("maps filters to API params with the fixed limit", () => {
        const params = toSearchProductsParams({
            search: "tv",
            categoryId: ["a"],
            brandId: [],
            condition: ["NEW"],
            minPrice: 5000,
            maxPrice: undefined,
            sort: "price_desc",
            page: 2,
        });
        expect(params).toEqual({
            search: "tv",
            categoryId: ["a"],
            condition: ["NEW"],
            minPrice: 5000,
            sort: "price_desc",
            page: 2,
            limit: PAGE_SIZE,
        });
    });

    it("omits empty arrays, undefined price, and default sort", () => {
        const params = toSearchProductsParams({
            search: undefined,
            categoryId: [],
            brandId: [],
            condition: [],
            minPrice: undefined,
            maxPrice: undefined,
            sort: "newest",
            page: 1,
        });
        expect(params).toEqual({ limit: PAGE_SIZE, page: 1 });
    });
});

describe("URL mutation helpers", () => {
    it("getCsv reads a CSV param as an array", () => {
        expect(getCsv(new URLSearchParams("brandId=a,b"), "brandId")).toEqual(["a", "b"]);
        expect(getCsv(new URLSearchParams(""), "brandId")).toEqual([]);
    });

    it("toggleCsv adds a value and clears page", () => {
        const next = toggleCsv(new URLSearchParams("brandId=a&page=3"), "brandId", "b");
        expect(next.get("brandId")).toBe("a,b");
        expect(next.has("page")).toBe(false);
    });

    it("toggleCsv removes a present value and deletes the key when empty", () => {
        const next = toggleCsv(new URLSearchParams("brandId=a"), "brandId", "a");
        expect(next.has("brandId")).toBe(false);
    });

    it("setSingle sets or clears a scalar and resets page", () => {
        expect(setSingle(new URLSearchParams("page=2"), "sort", "price_asc").get("sort")).toBe(
            "price_asc",
        );
        expect(setSingle(new URLSearchParams("sort=price_asc"), "sort", null).has("sort")).toBe(
            false,
        );
    });

    it("setPrice sets both bounds, omits open-ended max, and resets page", () => {
        const a = setPrice(new URLSearchParams("page=4"), 10000, 30000);
        expect(a.get("minPrice")).toBe("10000");
        expect(a.get("maxPrice")).toBe("30000");
        expect(a.has("page")).toBe(false);
        const b = setPrice(new URLSearchParams(""), 100000, undefined);
        expect(b.get("minPrice")).toBe("100000");
        expect(b.has("maxPrice")).toBe(false);
        const c = setPrice(new URLSearchParams("minPrice=1&maxPrice=2"), undefined, undefined);
        expect(c.has("minPrice")).toBe(false);
        expect(c.has("maxPrice")).toBe(false);
    });

    it("setPage sets the page but omits page=1", () => {
        expect(setPage(new URLSearchParams(""), 2).get("page")).toBe("2");
        expect(setPage(new URLSearchParams("page=5"), 1).has("page")).toBe(false);
    });
});
