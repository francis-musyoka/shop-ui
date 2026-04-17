import "server-only";
import { apiFetch } from "./client";
import type { ShopPublic } from "@/lib/schemas/shop";
import { ShopDetailResponseSchema } from "@/lib/schemas/shop";

/**
 * Get public shop profile by slug.
 */
export async function getShopBySlug(slug: string): Promise<ShopPublic> {
    const res = await apiFetch({
        path: `/api/shops/${slug}`,
        schema: ShopDetailResponseSchema,
        forwardCookies: false,
        cache: "no-store",
    });
    return res.shop;
}
