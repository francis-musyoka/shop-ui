import "server-only";
import { apiFetch } from "./client";
import { VariantSearchResponseSchema } from "@/lib/schemas/offer";
import { SuccessFlagSchema } from "@/lib/schemas/common";

export function createOffer(body: Record<string, unknown>) {
    return apiFetch({
        path: "/api/products/offers",
        method: "POST",
        body,
        schema: SuccessFlagSchema,
    });
}
export function updateOffer(id: string, body: Record<string, unknown>) {
    return apiFetch({
        path: `/api/products/offers/${id}`,
        method: "PATCH",
        body,
        schema: SuccessFlagSchema,
    });
}
export function setOfferPrice(id: string, body: { newPrice: number; reason?: string }) {
    return apiFetch({
        path: `/api/products/offers/${id}/price`,
        method: "PATCH",
        body,
        schema: SuccessFlagSchema,
    });
}
export function searchVariants(query: {
    search: string;
    categoryId?: string;
    brandId?: string;
    page?: number;
    limit?: number;
}) {
    return apiFetch({
        path: "/api/products/variant-search",
        query,
        schema: VariantSearchResponseSchema,
    });
}
