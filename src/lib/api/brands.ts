import "server-only";
import { apiFetch, STATIC_DATA_REVALIDATE } from "./client";
import type { Brand } from "@/lib/schemas/brand";
import { BrandListResponseSchema } from "@/lib/schemas/brand";

/**
 * List all brands. Cached with "brands" tag.
 */
export async function listBrands(): Promise<Brand[]> {
    const res = await apiFetch({
        path: "/api/brands",
        schema: BrandListResponseSchema,
        forwardCookies: false,
        revalidate: STATIC_DATA_REVALIDATE,
        tags: ["brands"],
    });
    return res.brands;
}
