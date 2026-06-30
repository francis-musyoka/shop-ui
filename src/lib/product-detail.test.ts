import { describe, it, expect } from "vitest";
import {
    selectBestOffer,
    deriveBuybox,
    galleryImageUrls,
    findVariant,
    type DetailVariant,
} from "./product-detail";
import type { ProductDetail, Offer } from "@/lib/schemas/product";

function offer(over: Partial<Offer> = {}): Offer {
    return {
        id: "of_1",
        price: 1000,
        discount: 0,
        quantityTotal: 5,
        quantityAvailable: 5,
        condition: "NEW",
        status: "ACTIVE",
        deliveryDays: 2,
        warrantyMonths: 12,
        isFeatured: false,
        location: "Nairobi",
        finalPrice: 1000,
        shop: { id: "sh_1", name: "Shop One", slug: "shop-one", rating: 4.5 },
        ...over,
    };
}

function variant(over: Partial<DetailVariant> = {}): DetailVariant {
    return {
        id: "v_1",
        attributes: { Storage: "128GB", Color: "Black" },
        colorHex: "#000000",
        images: [],
        offers: [],
        ...over,
    };
}

describe("selectBestOffer", () => {
    it("returns null when there are no offers", () => {
        expect(selectBestOffer([])).toBeNull();
    });

    it("trusts the backend buy-box winner even when it is neither cheapest nor featured", () => {
        const winner = offer({
            id: "win",
            isBuyBoxWinner: true,
            isFeatured: false,
            finalPrice: 1800,
        });
        const cheaperFeatured = offer({ id: "other", isFeatured: true, finalPrice: 900 });
        expect(selectBestOffer([cheaperFeatured, winner])?.id).toBe("win");
    });

    it("prefers a featured offer over a cheaper non-featured one", () => {
        const featured = offer({ id: "feat", isFeatured: true, finalPrice: 1200 });
        const cheap = offer({ id: "cheap", finalPrice: 900 });
        expect(selectBestOffer([cheap, featured])?.id).toBe("feat");
    });

    it("falls back to lowest finalPrice among active offers", () => {
        const a = offer({ id: "a", finalPrice: 1500 });
        const b = offer({ id: "b", finalPrice: 1100 });
        expect(selectBestOffer([a, b])?.id).toBe("b");
    });

    it("ignores out-of-stock/inactive offers unless none are sellable", () => {
        const sold = offer({ id: "sold", finalPrice: 800, quantityAvailable: 0 });
        const ok = offer({ id: "ok", finalPrice: 1000 });
        expect(selectBestOffer([sold, ok])?.id).toBe("ok");
        const onlySold = offer({ id: "only", quantityAvailable: 0, status: "PAUSED" });
        expect(selectBestOffer([onlySold])?.id).toBe("only");
    });
});

describe("deriveBuybox", () => {
    it("returns null for a variant with no offers", () => {
        expect(deriveBuybox(variant({ offers: [] }))).toBeNull();
        expect(deriveBuybox(undefined)).toBeNull();
    });

    it("derives price, strike, discount, stock and condition from the best offer", () => {
        const v = variant({
            offers: [
                offer({ price: 12000, finalPrice: 10200, discount: 1800, quantityAvailable: 7 }),
            ],
        });
        const box = deriveBuybox(v);
        expect(box).not.toBeNull();
        expect(box!.price).toBe(10200);
        expect(box!.originalPrice).toBe(12000);
        expect(box!.discountPercent).toBe(15);
        expect(box!.stock).toBe(7);
        expect(box!.condition).toBe("NEW");
        expect(box!.offerCount).toBe(1);
    });

    it("has no strike/discount when finalPrice equals price", () => {
        const box = deriveBuybox(variant({ offers: [offer({ price: 9000, finalPrice: 9000 })] }));
        expect(box!.originalPrice).toBeNull();
        expect(box!.discountPercent).toBeNull();
    });
});

describe("galleryImageUrls", () => {
    const product = {
        images: [
            { id: "p2", url: "https://x/p2.jpg", order: 1 },
            { id: "p1", url: "https://x/p1.jpg", order: 0 },
        ],
    } as unknown as ProductDetail;

    it("returns product images sorted by order when the variant has none", () => {
        expect(galleryImageUrls(product, variant({ images: [] }))).toEqual([
            "https://x/p1.jpg",
            "https://x/p2.jpg",
        ]);
    });

    it("prefers variant images (sorted by order) when present", () => {
        const v = variant({ images: [{ id: "v1", url: "https://x/v1.jpg", order: 0 }] });
        expect(galleryImageUrls(product, v)).toEqual(["https://x/v1.jpg"]);
    });
});

describe("findVariant", () => {
    const variants = [
        variant({ id: "a", attributes: { Storage: "128GB", Color: "Black" } }),
        variant({ id: "b", attributes: { Storage: "256GB", Color: "Black" } }),
        variant({ id: "c", attributes: { Storage: "256GB", Color: "Blue" } }),
    ];

    it("returns the variant matching all selected attributes", () => {
        expect(findVariant(variants, { Storage: "256GB", Color: "Blue" })?.id).toBe("c");
    });

    it("falls back to the first variant matching the provided subset", () => {
        expect(findVariant(variants, { Storage: "256GB" })?.id).toBe("b");
    });

    it("returns undefined when nothing matches", () => {
        expect(findVariant(variants, { Storage: "1TB" })).toBeUndefined();
    });
});
