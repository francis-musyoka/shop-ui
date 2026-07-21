import { describe, it, expect } from "vitest";
import { OfferCreateSchema, OfferEditSchema, SetPriceSchema } from "./offer";

const base = { variantId: "clxreal000cuidvalue00", condition: "NEW", price: 1000, quantity: 5 };

describe("OfferCreateSchema", () => {
    it("accepts NEW without notes", () =>
        expect(OfferCreateSchema.safeParse(base).success).toBe(true));
    it("requires conditionNotes when USED", () => {
        expect(OfferCreateSchema.safeParse({ ...base, condition: "USED" }).success).toBe(false);
        expect(
            OfferCreateSchema.safeParse({ ...base, condition: "USED", conditionNotes: "worn" })
                .success,
        ).toBe(true);
    });
    it("coerces string numbers (FormData)", () => {
        const r = OfferCreateSchema.safeParse({ ...base, price: "1000", quantity: "5" });
        expect(r.success && r.data.price).toBe(1000);
    });
    it("accepts a blank deliveryDays (FormData sends '' for untouched fields, not undefined)", () => {
        const r = OfferCreateSchema.safeParse({ ...base, deliveryDays: "", warrantyMonths: "" });
        expect(r.success).toBe(true);
        expect(r.success && r.data.deliveryDays).toBeUndefined();
        expect(r.success && r.data.warrantyMonths).toBeUndefined();
    });
    it("still rejects a deliveryDays below the minimum", () => {
        expect(OfferCreateSchema.safeParse({ ...base, deliveryDays: 0 }).success).toBe(false);
    });
});

describe("OfferEditSchema", () => {
    it("accepts a blank deliveryDays/warrantyMonths", () => {
        const r = OfferEditSchema.safeParse({ quantity: 5, deliveryDays: "", warrantyMonths: "" });
        expect(r.success).toBe(true);
        expect(r.success && r.data.deliveryDays).toBeUndefined();
        expect(r.success && r.data.warrantyMonths).toBeUndefined();
    });
    it("rejects a zero quantity (backend requires at least 1, same as create)", () => {
        expect(OfferEditSchema.safeParse({ quantity: 0 }).success).toBe(false);
    });
});

describe("SetPriceSchema", () => {
    it("rejects non-positive price", () =>
        expect(SetPriceSchema.safeParse({ price: 0 }).success).toBe(false));
});
