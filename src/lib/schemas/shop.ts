import { z } from "zod";
import { CUID } from "./common";

export const ShopAddressSchema = z.object({
    id: CUID,
    street: z.string(),
    city: z.string(),
    state: z.string().nullish(),
    country: z.string(),
    postalCode: z.string().nullish(),
});

export const ShopOwnerSchema = z.object({
    id: CUID,
    firstName: z.string(),
    lastName: z.string(),
});

export const ShopCategorySchema = z.object({
    id: CUID,
    name: z.string(),
    slug: z.string(),
});

export const ShopProductSchema = z.object({
    id: CUID,
    title: z.string(),
    slug: z.string(),
    status: z.string(),
    images: z.array(
        z.object({
            url: z.string().url(),
            order: z.number().int().nonnegative(),
        }),
    ),
});

export const ShopPublicSchema = z.object({
    id: CUID,
    name: z.string(),
    slug: z.string(),
    description: z.string(),
    email: z.string().email(),
    phone: z.string(),
    logoUrl: z.string().nullish(),
    bannerUrl: z.string().nullish(),
    businessType: z.enum(["INDIVIDUAL", "REGISTERED"]),
    websiteLink: z.string().nullish(),
    facebook: z.string().nullish(),
    instagram: z.string().nullish(),
    tiktok: z.string().nullish(),
    rating: z.coerce.number(),
    isVerified: z.boolean(),
    status: z.string(),
    shopAddress: ShopAddressSchema,
    owner: ShopOwnerSchema,
    category: ShopCategorySchema,
    contributedProducts: z.array(ShopProductSchema),
});

export type ShopPublic = z.infer<typeof ShopPublicSchema>;

export const ShopDetailResponseSchema = z.object({
    success: z.literal(true),
    shop: ShopPublicSchema,
});

export type ShopDetailResponse = z.infer<typeof ShopDetailResponseSchema>;
