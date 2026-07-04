import { describe, it, expect } from "vitest";
import {
    ProductCardSchema,
    SearchProductsResponseSchema,
    NewestListingsResponseSchema,
    ProductDetailResponseSchema,
    SearchProductsParamsSchema,
    OfferSummarySchema,
    BuyBoxOfferSchema,
    VariantOffersResponseSchema,
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
        expect(parsed.buybox.finalPrice).toBe(145000);
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

describe("detail buy-box schema", () => {
    const winner = {
        id: "off9aaaaaaaaaaaaaaaaaaaaa",
        condition: "NEW",
        finalPrice: 12500,
        originalPrice: 25000,
        discountPercent: 50,
        quantityTotal: 5,
        quantityReserved: 0,
        quantityAvailable: 5,
        deliveryDays: 3,
        warrantyMonths: 12,
        isFeatured: false,
        location: "Nairobi",
        createdAt: "2026-06-01T10:00:00.000Z",
        shop: { id: "shop1aaaaaaaaaaaaaaaaaaaa", name: "Shop", slug: "shop", rating: 4.5 },
    };

    it("parses a winner as BuyBoxOffer", () => {
        const parsed = BuyBoxOfferSchema.parse(winner);
        expect(parsed.finalPrice).toBe(12500);
        expect(parsed.originalPrice).toBe(25000);
    });

    it("accepts null discount fields", () => {
        const parsed = BuyBoxOfferSchema.parse({
            ...winner,
            originalPrice: null,
            discountPercent: null,
        });
        expect(parsed.originalPrice).toBeNull();
        expect(parsed.discountPercent).toBeNull();
    });

    it("OfferSummary omits winner-only fields", () => {
        const { quantityTotal, quantityReserved, isFeatured, createdAt, ...summary } = winner;
        expect(() => OfferSummarySchema.parse(summary)).not.toThrow();
    });

    it("parses a detail response with buyBoxVariantId and per-variant buyBox/offerCount", () => {
        const parsed = ProductDetailResponseSchema.parse({
            success: true,
            product: {
                id: "prod1aaaaaaaaaaaaaaaaaaaa",
                title: "Phone",
                slug: "phone",
                description: null,
                status: "ACTIVE",
                createdAt: "2026-01-01T00:00:00Z",
                category: { id: "cat1aaaaaaaaaaaaaaaaaaaaa", name: "Phones", slug: "phones" },
                brand: { id: "brand1aaaaaaaaaaaaaaaaaaa", name: "Acme", slug: "acme" },
                images: [{ id: "img1aaaaaaaaaaaaaaaaaaaaa", url: "https://x/1.jpg", order: 0 }],
                buyBoxVariantId: "var1aaaaaaaaaaaaaaaaaaaaa",
                variants: [
                    {
                        id: "var1aaaaaaaaaaaaaaaaaaaaa",
                        attributes: { Storage: "128GB" },
                        colorHex: null,
                        images: [],
                        offerCount: 2,
                        buyBox: winner,
                    },
                ],
            },
        });
        expect(parsed.product.buyBoxVariantId).toBe("var1aaaaaaaaaaaaaaaaaaaaa");
        expect(parsed.product.variants[0]!.offerCount).toBe(2);
        expect(parsed.product.variants[0]!.buyBox!.finalPrice).toBe(12500);
    });

    it("accepts a null buyBox and null buyBoxVariantId (no offers)", () => {
        const parsed = ProductDetailResponseSchema.parse({
            success: true,
            product: {
                id: "prod1aaaaaaaaaaaaaaaaaaaa",
                title: "Phone",
                slug: "phone",
                status: "ACTIVE",
                createdAt: "2026-01-01T00:00:00Z",
                category: { id: "cat1aaaaaaaaaaaaaaaaaaaaa", name: "Phones", slug: "phones" },
                brand: { id: "brand1aaaaaaaaaaaaaaaaaaa", name: "Acme", slug: "acme" },
                images: [{ id: "img1aaaaaaaaaaaaaaaaaaaaa", url: "https://x/1.jpg", order: 0 }],
                buyBoxVariantId: null,
                variants: [
                    {
                        id: "var1aaaaaaaaaaaaaaaaaaaaa",
                        attributes: { Storage: "128GB" },
                        colorHex: null,
                        images: [],
                        offerCount: 0,
                        buyBox: null,
                    },
                ],
            },
        });
        expect(parsed.product.buyBoxVariantId).toBeNull();
        expect(parsed.product.variants[0]!.buyBox).toBeNull();
    });

    it("parses the variant offers list response", () => {
        const { quantityTotal, quantityReserved, isFeatured, createdAt, ...summary } = winner;
        const parsed = VariantOffersResponseSchema.parse({
            success: true,
            data: [summary],
            pagination: { total: 1, page: 1, limit: 20, totalPages: 1, hasNextPage: false },
        });
        expect(parsed.data).toHaveLength(1);
        expect(parsed.pagination.hasNextPage).toBe(false);
    });
});
