"use client";

import { useQuery } from "@tanstack/react-query";
import { VariantSearchResponseSchema } from "@/lib/schemas/offer";

interface VariantSearchParams {
    search: string;
    categoryId?: string;
    brandId?: string;
    page?: number;
}

async function fetchVariantSearch({ search, categoryId, brandId, page }: VariantSearchParams) {
    const params = new URLSearchParams({ search });
    if (categoryId) params.set("categoryId", categoryId);
    if (brandId) params.set("brandId", brandId);
    if (page) params.set("page", String(page));

    const res = await fetch(`/api/products/variant-search?${params.toString()}`);
    if (!res.ok) throw new Error("Failed to search variants");
    return VariantSearchResponseSchema.parse(await res.json());
}

/**
 * Debounced catalog search for the add-listing variant picker (G2). The
 * backend requires a minimum 4-character `search` term, so the query stays
 * disabled until the trimmed input reaches that length.
 */
export function useVariantSearch({ search, categoryId, brandId, page }: VariantSearchParams) {
    return useQuery({
        queryKey: ["variant-search", search, categoryId, brandId, page],
        enabled: search.trim().length >= 4,
        queryFn: () => fetchVariantSearch({ search, categoryId, brandId, page }),
    });
}
