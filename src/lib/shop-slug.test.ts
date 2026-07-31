import { describe, it, expect } from "vitest";
import { slugify, isValidShopSlug, composeVariantLabel } from "./shop-slug";

describe("slugify", () => {
    it("lowercases and underscores non-alphanumerics", () => {
        expect(slugify("River Tech")).toBe("river_tech");
    });
    it("collapses runs and trims edge underscores", () => {
        expect(slugify("  Coastal   Gadgets!! ")).toBe("coastal_gadgets");
    });
});

describe("isValidShopSlug", () => {
    it("accepts underscore slugs", () => expect(isValidShopSlug("river_tech")).toBe(true));
    it("rejects hyphens, caps, and <2 chars", () => {
        expect(isValidShopSlug("river-tech")).toBe(false);
        expect(isValidShopSlug("River")).toBe(false);
        expect(isValidShopSlug("a")).toBe(false);
    });
});

describe("composeVariantLabel", () => {
    it("joins attribute VALUES in sorted-key order", () => {
        expect(composeVariantLabel({ Storage: "256GB", Color: "Black" })).toBe("Black · 256GB");
    });
    it("handles empty", () => expect(composeVariantLabel({})).toBe(""));
});
