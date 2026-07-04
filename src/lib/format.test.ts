import { describe, it, expect } from "vitest";
import { formatPrice } from "./format";

describe("formatPrice", () => {
    it("prefixes KSh and groups thousands", () => {
        expect(formatPrice(42800)).toBe("KSh 42,800");
    });

    it("formats zero without decimals", () => {
        expect(formatPrice(0)).toBe("KSh 0");
    });

    it("groups millions", () => {
        expect(formatPrice(1234567)).toBe("KSh 1,234,567");
    });
});
