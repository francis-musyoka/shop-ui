import { describe, it, expect } from "vitest";
import { BrandSchema, BrandListResponseSchema } from "./brand";
import brandFixtures from "../../../tests/fixtures/backend/brands.json";

describe("BrandSchema", () => {
    it("parses a single brand", () => {
        const parsed = BrandSchema.parse(brandFixtures.listSuccess.brands[0]);
        expect(parsed.name).toBe("Samsung");
    });
});

describe("BrandListResponseSchema", () => {
    it("parses the list response", () => {
        const parsed = BrandListResponseSchema.parse(brandFixtures.listSuccess);
        expect(parsed.brands).toHaveLength(3);
    });
});
