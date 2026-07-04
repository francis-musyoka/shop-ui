"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { VariantOffersResponseSchema } from "@/lib/schemas/product";

const LIMIT = 20;

async function fetchVariantOffers(slug: string, variantId: string, page: number) {
    const params = new URLSearchParams({
        variantId,
        page: String(page),
        limit: String(LIMIT),
    });
    const res = await fetch(`/api/products/${slug}/offers?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to load offers");
    return VariantOffersResponseSchema.parse(await res.json());
}

/**
 * Lazily loads the selected variant's full offer list, paginated. The query
 * key includes variantId, so switching variants and reopening the drawer
 * fetches (or reuses cache for) that variant's offers — never the wrong set.
 */
export function useVariantOffers(slug: string, variantId: string | undefined, enabled: boolean) {
    return useInfiniteQuery({
        queryKey: ["variant-offers", slug, variantId],
        enabled: enabled && Boolean(variantId),
        initialPageParam: 1,
        queryFn: ({ pageParam }) => fetchVariantOffers(slug, variantId!, pageParam),
        getNextPageParam: (last) =>
            last.pagination.hasNextPage ? last.pagination.page + 1 : undefined,
    });
}
