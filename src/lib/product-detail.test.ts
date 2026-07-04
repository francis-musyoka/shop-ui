import { describe, it, expect } from "vitest";
import { deriveBuybox, findVariant, galleryImageUrls } from "./product-detail";
import type { ProductDetail } from "@/lib/schemas/product";

type Variant = ProductDetail["variants"][number];

const baseWinner = {
    id: "off1aaaaaaaaaaaaaaaaaaaaa",
    condition: "NEW" as const,
    finalPrice: 10200,
    originalPrice: 12000,
    discountPercent: 15,
    quantityTotal: 7,
    quantityReserved: 0,
    quantityAvailable: 7,
    deliveryDays: 2,
    warrantyMonths: 12,
    isFeatured: true,
    location: "Nairobi",
    createdAt: "2026-06-01T10:00:00.000Z",
    shop: { id: "shop1aaaaaaaaaaaaaaaaaaaa", name: "Shop", slug: "shop", rating: 4.6 },
};

function variant(overrides: Partial<Variant> = {}): Variant {
    return {
        id: "var1aaaaaaaaaaaaaaaaaaaaa",
        attributes: { Storage: "128GB" },
        colorHex: null,
        images: [],
        offerCount: 1,
        buyBox: baseWinner,
        ...overrides,
    } as Variant;
}

describe("deriveBuybox", () => {
    it("returns null when the variant has no buyBox", () => {
        expect(deriveBuybox(variant({ buyBox: null, offerCount: 0 }))).toBeNull();
    });

    it("returns null when the variant is undefined", () => {
        expect(deriveBuybox(undefined)).toBeNull();
    });

    it("maps the winner straight through", () => {
        const box = deriveBuybox(variant());
        expect(box).not.toBeNull();
        expect(box!.price).toBe(10200);
        expect(box!.originalPrice).toBe(12000);
        expect(box!.discountPercent).toBe(15);
        expect(box!.stock).toBe(7);
        expect(box!.condition).toBe("NEW");
    });

    it("passes through null discount fields (no strikethrough)", () => {
        const box = deriveBuybox(
            variant({ buyBox: { ...baseWinner, originalPrice: null, discountPercent: null } }),
        );
        expect(box!.originalPrice).toBeNull();
        expect(box!.discountPercent).toBeNull();
    });
});

describe("findVariant", () => {
    it("matches the variant whose attributes contain every selected pair", () => {
        const a = variant({ id: "aaaaaaaaaaaaaaaaaaaaaaaaa", attributes: { Storage: "128GB" } });
        const b = variant({ id: "bbbbbbbbbbbbbbbbbbbbbbbbb", attributes: { Storage: "256GB" } });
        expect(findVariant([a, b], { Storage: "256GB" })?.id).toBe("bbbbbbbbbbbbbbbbbbbbbbbbb");
    });
});

describe("galleryImageUrls", () => {
    it("prefers variant images, sorted by order", () => {
        const product = {
            images: [{ id: "p1", url: "https://x/p.jpg", order: 0 }],
        } as unknown as ProductDetail;
        const v = variant({
            images: [
                { id: "i2", url: "https://x/2.jpg", order: 1 },
                { id: "i1", url: "https://x/1.jpg", order: 0 },
            ],
        });
        expect(galleryImageUrls(product, v)).toEqual(["https://x/1.jpg", "https://x/2.jpg"]);
    });
});
