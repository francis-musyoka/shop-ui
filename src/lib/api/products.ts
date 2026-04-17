import "server-only";
import { apiFetch } from "./client";
import {
    type SearchProductsParams,
    type SearchProductsResponse,
    SearchProductsResponseSchema,
    type NewestListingsParams,
    type ProductDetail,
    ProductDetailResponseSchema,
} from "@/lib/schemas/product";

/**
 * Search products with optional filters and pagination.
 * Returns { data: ProductCard[], pagination }.
 */
export async function searchProducts(
    params: SearchProductsParams = {},
): Promise<SearchProductsResponse> {
    return apiFetch({
        path: "/api/products",
        schema: SearchProductsResponseSchema,
        query: params as Record<string, string | number | boolean | undefined>,
        forwardCookies: false,
        cache: "no-store",
    });
}

/**
 * Newest listings with category diversification.
 * Returns { data: ProductCard[], pagination } — same envelope as search.
 */
export async function getNewestListings(
    params: NewestListingsParams = {},
): Promise<SearchProductsResponse> {
    return apiFetch({
        path: "/api/products/newest",
        schema: SearchProductsResponseSchema,
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
