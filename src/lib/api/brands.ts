import "server-only";
import { apiFetch } from "./client";
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
        cache: "force-cache",
        tags: ["brands"],
    });
    return res.brands;
}
