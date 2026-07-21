import { describe, it, expect } from "vitest";
import { ShopFormSchema, ShopUpdateSchema } from "./seller-shop";

const valid = {
    name: "River Tech",
    slug: "river_tech",
    description: "Genuine electronics seller.",
    categoryId: "clxreal000cuidvalue00",
    businessType: "REGISTERED",
    email: "s@r.co",
    phone: "+254712345678",
    street: "Moi Ave",
    city: "Nairobi",
};

describe("ShopFormSchema", () => {
    it("rejects hyphen slug", () => {
        expect(ShopFormSchema.safeParse({ ...valid, slug: "river-tech" }).success).toBe(false);
    });
    it("rejects short description", () => {
        expect(ShopFormSchema.safeParse({ ...valid, description: "short" }).success).toBe(false);
    });
    it("accepts blank optional URL fields (FormData sends '' for untouched fields, not undefined)", () => {
        const r = ShopFormSchema.safeParse({
            ...valid,
            logoUrl: "",
            bannerUrl: "",
            websiteLink: "",
            facebook: "",
            instagram: "",
            tiktok: "",
        });
        expect(r.success).toBe(true);
        expect(r.success && r.data.logoUrl).toBeUndefined();
    });
    it("still rejects a genuinely malformed URL", () => {
        expect(ShopFormSchema.safeParse({ ...valid, websiteLink: "not-a-url" }).success).toBe(
            false,
        );
    });
});

describe("ShopUpdateSchema", () => {
    it("omits categoryId (not editable in settings)", () => {
        expect("categoryId" in ShopUpdateSchema.shape).toBe(false);
    });
    it("is fully partial", () => expect(ShopUpdateSchema.safeParse({}).success).toBe(true));
});
