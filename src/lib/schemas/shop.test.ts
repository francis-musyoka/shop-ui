import { describe, it, expect } from "vitest";
import { ShopPublicSchema, ShopDetailResponseSchema } from "./shop";
import shopFixtures from "../../../tests/fixtures/backend/shops.json";

describe("ShopPublicSchema", () => {
    it("parses the shop from fixture", () => {
        const parsed = ShopPublicSchema.parse(shopFixtures.detailSuccess.shop);
        expect(parsed.name).toBe("TechHub Kenya");
        expect(parsed.isVerified).toBe(true);
        expect(parsed.businessType).toBe("REGISTERED");
    });

    it("coerces Decimal rating to number", () => {
        const parsed = ShopPublicSchema.parse(shopFixtures.detailSuccess.shop);
        expect(typeof parsed.rating).toBe("number");
        expect(parsed.rating).toBe(4.5);
    });

    it("accepts null optional fields", () => {
        const parsed = ShopPublicSchema.parse(shopFixtures.detailSuccess.shop);
        expect(parsed.bannerUrl).toBeNull();
    });
});

describe("ShopDetailResponseSchema", () => {
    it("parses the full detail response", () => {
        const parsed = ShopDetailResponseSchema.parse(shopFixtures.detailSuccess);
        expect(parsed.shop.contributedProducts).toHaveLength(1);
        expect(parsed.shop.shopAddress.city).toBe("Nairobi");
    });
});
