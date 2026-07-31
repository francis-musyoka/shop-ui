import "server-only";
import { apiFetch } from "./client";
import type { ShopPublic } from "@/lib/schemas/shop";
import { ShopDetailResponseSchema } from "@/lib/schemas/shop";
import {
    MyShopResponseSchema,
    OpenShopResponseSchema,
    type ShopFormValues,
} from "@/lib/schemas/seller-shop";
import { MyOffersResponseSchema } from "@/lib/schemas/offer";
import { SuccessFlagSchema } from "@/lib/schemas/common";
import { ApiError } from "./errors";

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

export async function getMyShop() {
    const res = await apiFetch({ path: "/api/shops/my-shop", schema: MyShopResponseSchema });
    return res.shop;
}
export function openShop(body: ShopFormValues) {
    return apiFetch({
        path: "/api/shops/open-shop",
        method: "POST",
        body,
        schema: OpenShopResponseSchema,
    });
}
export function updateShop(id: string, body: Partial<ShopFormValues>) {
    return apiFetch({
        path: `/api/shops/${id}`,
        method: "PATCH",
        body,
        schema: OpenShopResponseSchema,
    });
}
export function closeShop() {
    return apiFetch({ path: "/api/shops/close", method: "PATCH", schema: SuccessFlagSchema });
}
// NOTE: `params` is typed structurally here rather than as the spec's `MyOffersQuery`
// (from `@/lib/seller-listings-params`, Task 4) — that module doesn't exist yet in
// this task. Once it lands, narrow this parameter to `MyOffersQuery`. The Record is
// rebuilt below (rather than passed straight through) because a nominal interface
// without an index signature isn't assignable to apiFetch's `Record<string, ...>`
// query type — same pattern as `searchProducts` in `src/lib/api/products.ts`.
export function getMyOffers(params: Record<string, string | number | boolean | undefined | null>) {
    const query: Record<string, string | number | boolean | undefined> = {};
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        query[key] = value;
    }
    return apiFetch({ path: "/api/shops/my-shop/offers", query, schema: MyOffersResponseSchema });
}
// Slug availability via public GET /api/shops/:slug — 404 means available.
export async function isSlugAvailable(slug: string): Promise<boolean> {
    try {
        await getShopBySlug(slug);
        return false;
    } catch (err) {
        if (err instanceof ApiError && err.statusCode === 404) return true;
        throw err;
    }
}
