import { z } from "zod";
import { CUID } from "./common";

export const SHOP_STATUSES = ["DRAFT", "PENDING", "ACTIVE", "SUSPENDED", "CLOSED"] as const;
export const BUSINESS_TYPES = ["INDIVIDUAL", "REGISTERED"] as const;

const AddressSchema = z.object({
    street: z.string(),
    city: z.string(),
    state: z.string().nullish(),
    country: z.string(),
    postalCode: z.string().nullish(),
});

export const MyShopSchema = z.object({
    id: CUID,
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    email: z.email(),
    phone: z.string(),
    logoUrl: z.string().nullish(),
    bannerUrl: z.string().nullish(),
    businessType: z.enum(BUSINESS_TYPES),
    websiteLink: z.string().nullish(),
    facebook: z.string().nullish(),
    instagram: z.string().nullish(),
    tiktok: z.string().nullish(),
    rating: z.coerce.number(),
    isVerified: z.boolean(),
    status: z.enum(SHOP_STATUSES),
    createdAt: z.string(),
    shopAddress: AddressSchema,
    category: z.object({ id: CUID, name: z.string(), slug: z.string() }),
});
export type MyShop = z.infer<typeof MyShopSchema>;

export const MyShopResponseSchema = z.object({ success: z.literal(true), shop: MyShopSchema });

// FormData always sends "" for an untouched optional field (never omits the key),
// so optional URL fields must tolerate blank input, not just `undefined`.
const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);
const optionalUrl = z.preprocess(emptyToUndefined, z.url("Invalid URL").optional());

// Shared create+update request. Mirrors backend CreateShopSchema (shop.dto.ts).
// Slug = underscores. Country omitted (fixed "KE" server-side; UI shows disabled "Kenya").
export const ShopFormSchema = z.object({
    name: z.string().trim().min(2, "Shop name must be at least 2 characters"),
    slug: z
        .string()
        .trim()
        .min(2)
        .regex(/^[a-z0-9]+(?:_[a-z0-9]+)*$/, "Use lowercase letters, numbers and underscores"),
    description: z.string().trim().min(10, "Description must be at least 10 characters"),
    categoryId: CUID,
    businessType: z.enum(BUSINESS_TYPES),
    email: z.email("Invalid email address"),
    phone: z.string().trim().min(10, "Phone must be at least 10 characters"),
    street: z.string().trim().min(1, "Street is required"),
    city: z.string().trim().min(1, "City is required"),
    state: z.string().trim().optional(),
    postalCode: z.string().trim().optional(),
    logoUrl: optionalUrl,
    bannerUrl: optionalUrl,
    websiteLink: optionalUrl,
    facebook: optionalUrl,
    instagram: optionalUrl,
    tiktok: optionalUrl,
});
export type ShopFormValues = z.infer<typeof ShopFormSchema>;

// Settings PATCH is partial; category is NOT editable (contact support), so omit it.
export const ShopUpdateSchema = ShopFormSchema.partial().omit({ categoryId: true });

export const OpenShopResponseSchema = z.object({
    success: z.literal(true),
    shop: z.object({ id: CUID, name: z.string(), slug: z.string() }),
});
