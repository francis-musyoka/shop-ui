import "server-only";
import { apiFetch } from "./client";
import {
    type SearchProductsParams,
    type SearchProductsResponse,
    SearchProductsResponseSchema,
    type NewestListingsParams,
    type NewestListingsResponse,
    NewestListingsResponseSchema,
    type ProductDetail,
    ProductDetailResponseSchema,
    type VariantOffersResponse,
    VariantOffersResponseSchema,
} from "@/lib/schemas/product";

/**
 * Search products with optional filters and pagination.
 * Returns { data: ProductCard[], pagination }.
 */
export async function searchProducts(
    params: SearchProductsParams = {},
): Promise<SearchProductsResponse> {
    const query: Record<string, string | number | boolean | undefined> = {};
    for (const [key, value] of Object.entries(params)) {
        if (value === undefined || value === null) continue;
        query[key] = Array.isArray(value) ? value.join(",") : value;
    }
    return apiFetch({
        path: "/api/products",
        schema: SearchProductsResponseSchema,
        query,
        forwardCookies: false,
        cache: "no-store",
    });
}

/**
 * Newest listings with category diversification.
 * Returns { data: ProductCard[] } — no pagination envelope (fixed-size carousel).
 */
export async function getNewestListings(
    params: NewestListingsParams = {},
): Promise<NewestListingsResponse> {
    return apiFetch({
        path: "/api/products/newest",
        schema: NewestListingsResponseSchema,
        query: params as Record<string, string | number | boolean | undefined>,
        forwardCookies: false,
        cache: "no-store",
    });
}

/**
 * Get full product detail by slug.
 * Returns the enriched product with variants, offers, and seller info.
 */
export async function getProductBySlug(slug: string): Promise<ProductDetail> {
    const res = await apiFetch({
        path: `/api/products/${slug}`,
        schema: ProductDetailResponseSchema,
        forwardCookies: false,
        cache: "no-store",
    });
    return res.product;
}

/**
 * Full offer list for one variant ("compare offers from other sellers"),
 * winner-first and paginated. Called lazily via the Route Handler when the
 * user opens the compare drawer — NOT part of the slug-only detail fetch.
 */
export async function getVariantOffers(
    slug: string,
    { variantId, page = 1, limit = 20 }: { variantId: string; page?: number; limit?: number },
): Promise<VariantOffersResponse> {
    return apiFetch({
        path: `/api/products/${slug}/offers`,
        schema: VariantOffersResponseSchema,
        query: { variantId, page, limit },
        forwardCookies: false,
        cache: "no-store",
    });
}
