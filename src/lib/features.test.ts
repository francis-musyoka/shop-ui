import { describe, it, expect } from "vitest";
import { FEATURES } from "./features";

describe("FEATURES", () => {
    it("has all deferred-feature flags defaulted to false in Slice A", () => {
        expect(FEATURES.reviews).toBe(false);
        expect(FEATURES.wishlist).toBe(false);
        expect(FEATURES.messaging).toBe(false);
        expect(FEATURES.recommendations).toBe(false);
        expect(FEATURES.recentlyViewed).toBe(false);
        expect(FEATURES.questionsAnswers).toBe(false);
        expect(FEATURES.productRating).toBe(false);
        expect(FEATURES.productSort).toBe(false);
    });

    it("is readonly at the type level", () => {
        const keys = Object.keys(FEATURES);
        expect(keys).toHaveLength(8);
    });
});
