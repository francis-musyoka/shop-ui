import { describe, it, expect } from "vitest";
import {
    parseListingParams,
    toMyOffersParams,
    STATUS_TABS,
    SELLER_SORT_OPTIONS,
    PAGE_SIZE,
} from "./seller-listings-params";

describe("parseListingParams", () => {
    it("returns defaults for empty input", () => {
        const f = parseListingParams({});
        expect(f).toEqual({
            status: [],
            condition: [],
            category: [],
            search: undefined,
            sort: "newest",
            page: 1,
        });
    });

    it('maps the Active tab\'s raw status param to status:["ACTIVE"]', () => {
        const activeTab = STATUS_TABS.find((t) => t.label === "Active");
        expect(activeTab?.value).toBe("ACTIVE");
        const f = parseListingParams({ status: "ACTIVE" });
        expect(f.status).toEqual(["ACTIVE"]);
    });

    it("drops an invalid status value", () => {
        expect(parseListingParams({ status: "BOGUS" }).status).toEqual([]);
    });

    it("splits CSV condition and category, mapping q to search", () => {
        const f = parseListingParams({
            q: "phone",
            condition: "NEW,USED",
            category: "electronics/phones,fashion",
        });
        expect(f.search).toBe("phone");
        expect(f.condition).toEqual(["NEW", "USED"]);
        expect(f.category).toEqual(["electronics/phones", "fashion"]);
    });

    it("drops an invalid condition value", () => {
        expect(parseListingParams({ condition: "NEW,BOGUS" }).condition).toEqual(["NEW"]);
    });

    it("falls back to newest for an unknown sort", () => {
        expect(parseListingParams({ sort: "nope" }).sort).toBe("newest");
        expect(SELLER_SORT_OPTIONS.some((o) => o.value === "newest")).toBe(true);
    });

    it("coerces the page, ignoring garbage and clamping below 1", () => {
        expect(parseListingParams({ page: "3" }).page).toBe(3);
        expect(parseListingParams({ page: "0" }).page).toBe(1);
        expect(parseListingParams({ page: "x" }).page).toBe(1);
    });

    it("takes the first value when a param repeats", () => {
        expect(parseListingParams({ sort: ["price_asc", "price_desc"] }).sort).toBe("price_asc");
    });
});

describe("toMyOffersParams", () => {
    it("maps filters to the G1 query with the fixed limit", () => {
        const params = toMyOffersParams({
            status: ["ACTIVE"],
            condition: ["NEW", "USED"],
            category: ["electronics/phones"],
            search: "phone",
            sort: "price_desc",
            page: 2,
        });
        expect(params).toEqual({
            status: "ACTIVE",
            condition: "NEW,USED",
            category: "electronics/phones",
            search: "phone",
            sort: "price_desc",
            page: 2,
            limit: PAGE_SIZE,
        });
    });

    it("drops empty filters and the default sort", () => {
        const params = toMyOffersParams({
            status: [],
            condition: [],
            category: [],
            search: undefined,
            sort: "newest",
            page: 1,
        });
        expect(params).toEqual({ page: 1, limit: PAGE_SIZE });
    });
});
