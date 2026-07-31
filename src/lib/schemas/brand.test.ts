import { describe, it, expect } from "vitest";
import { BrandSchema, BrandListResponseSchema } from "./brand";
import brandFixtures from "../../../tests/fixtures/backend/brands.json";

describe("BrandSchema", () => {
    it("parses a single brand", () => {
        const parsed = BrandSchema.parse(brandFixtures.listSuccess.brands[0]);
        expect(parsed.name).toBe("Samsung");
    });

    it("parses productCount when present", () => {
        const parsed = BrandSchema.parse({
            id: "cl9ebqhxk00040cat00000030",
            name: "Samsung",
            slug: "samsung",
            productCount: 12,
        });
        expect(parsed.productCount).toBe(12);
    });

    it("leaves productCount undefined when absent", () => {
        const parsed = BrandSchema.parse({
            id: "cl9ebqhxk00040cat00000030",
            name: "Samsung",
            slug: "samsung",
        });
        expect(parsed.productCount).toBeUndefined();
    });
});

describe("BrandListResponseSchema", () => {
    it("parses the list response", () => {
        const parsed = BrandListResponseSchema.parse(brandFixtures.listSuccess);
        expect(parsed.brands).toHaveLength(3);
    });
});
