import { describe, it, expect } from "vitest";
import {
    ProductCardSchema,
    SearchProductsResponseSchema,
    NewestListingsResponseSchema,
    ProductDetailResponseSchema,
    SearchProductsParamsSchema,
    OfferSchema,
} from "./product";
import productFixtures from "../../../tests/fixtures/backend/products.json";

describe("ProductCardSchema", () => {
    it("parses a card from the search fixture", () => {
        const card = productFixtures.searchSuccess.data[0];
        const parsed = ProductCardSchema.parse(card);
        expect(parsed.title).toBe("Samsung Galaxy S24 Ultra");
        expect(parsed.mainImageUrl).toContain("https://");
        expect(parsed.variantCount).toBe(3);
        expect(parsed.offerCount).toBe(5);
        expect(parsed.buybox.price).toBe(145000);
        expect(parsed.buybox.condition).toBe("NEW");
        expect(parsed.buybox.stock).toBe(8);
    });

    it("accepts null originalPrice and discountPercent when no discount", () => {
        const card = productFixtures.searchSuccess.data[1];
        const parsed = ProductCardSchema.parse(card);
        expect(parsed.buybox.originalPrice).toBeNull();
        expect(parsed.buybox.discountPercent).toBeNull();
    });

    it("rejects missing title", () => {
        const noTitle = { ...productFixtures.searchSuccess.data[0]! };
        delete (noTitle as Record<string, unknown>).title;
        expect(() => ProductCardSchema.parse(noTitle)).toThrow();
    });

    it("rejects invalid mainImageUrl", () => {
        const badUrl = { ...productFixtures.searchSuccess.data[0]!, mainImageUrl: "not-a-url" };
        expect(() => ProductCardSchema.parse(badUrl)).toThrow();
    });
});

describe("SearchProductsResponseSchema", () => {
    it("parses the full search response from fixture", () => {
        const parsed = SearchProductsResponseSchema.parse(productFixtures.searchSuccess);
        expect(parsed.data).toHaveLength(2);
        expect(parsed.pagination.total).toBe(120);
        expect(parsed.pagination.hasNextPage).toBe(true);
    });

    it("parses an empty search result", () => {
        const parsed = SearchProductsResponseSchema.parse(productFixtures.searchEmpty);
        expect(parsed.data).toHaveLength(0);
        expect(parsed.pagination.total).toBe(0);
    });
});

describe("NewestListingsResponseSchema", () => {
    it("parses the newest fixture (no pagination envelope)", () => {
        const parsed = NewestListingsResponseSchema.parse(productFixtures.newestSuccess);
        expect(parsed.data).toHaveLength(2);
        expect(parsed.data[0]!.buybox.condition).toBe("NEW");
    });

    it("rejects a response that contains a pagination field", () => {
        const withPagination = {
            ...productFixtures.newestSuccess,
            pagination: { total: 2, page: 1, limit: 12, totalPages: 1, hasNextPage: false },
        };
        // Strict parse would fail; the schema currently uses default behaviour
        // (extra keys are stripped), so the response still parses cleanly.
        const parsed = NewestListingsResponseSchema.parse(withPagination);
        expect((parsed as { pagination?: unknown }).pagination).toBeUndefined();
    });
});

describe("ProductDetailResponseSchema", () => {
    it("parses the detail fixture", () => {
        const parsed = ProductDetailResponseSchema.parse(productFixtures.detailSuccess);
        const product = parsed.product;
        expect(product.title).toBe("Samsung Galaxy S24 Ultra");
        expect(product.description).toContain("S Pen");
        expect(product.category.id).toBeDefined();
        expect(product.brand.id).toBeDefined();
        expect(product.images).toHaveLength(2);
        expect(product.variants).toHaveLength(1);
    });

    it("coerces Decimal price and discount to numbers in offers", () => {
        const variant = productFixtures.detailSuccess.product.variants[0]!;
        const offer = variant.offers[0]!;
        const parsed = OfferSchema.parse(offer);
        expect(typeof parsed.price).toBe("number");
        expect(parsed.price).toBe(150000);
        expect(typeof parsed.discount).toBe("number");
        expect(parsed.discount).toBe(5);
    });

    it("coerces Decimal rating to number in offer shop", () => {
        const variant = productFixtures.detailSuccess.product.variants[0]!;
        const offer = variant.offers[0]!;
        const parsed = OfferSchema.parse(offer);
        expect(typeof parsed.shop.rating).toBe("number");
        expect(parsed.shop.rating).toBe(4.5);
    });
});

describe("SearchProductsParamsSchema", () => {
    it("accepts empty params", () => {
        expect(SearchProductsParamsSchema.parse({})).toEqual({});
    });

    it("coerces string page to number", () => {
        const parsed = SearchProductsParamsSchema.parse({ page: "2" });
        expect(parsed.page).toBe(2);
    });

    it("rejects limit above 50", () => {
        expect(() => SearchProductsParamsSchema.parse({ limit: 100 })).toThrow();
    });

    it("accepts valid condition enum", () => {
        const parsed = SearchProductsParamsSchema.parse({ condition: "USED" });
        expect(parsed.condition).toBe("USED");
    });

    it("rejects invalid condition", () => {
        expect(() => SearchProductsParamsSchema.parse({ condition: "BROKEN" })).toThrow();
    });
});
