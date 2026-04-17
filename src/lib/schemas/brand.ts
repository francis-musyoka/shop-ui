import { z } from "zod";
import { CUID } from "./common";

export const BrandSchema = z.object({
    id: CUID,
    name: z.string(),
    slug: z.string(),
});

export type Brand = z.infer<typeof BrandSchema>;

export const BrandListResponseSchema = z.object({
    success: z.literal(true),
    brands: z.array(BrandSchema),
});

export type BrandListResponse = z.infer<typeof BrandListResponseSchema>;
