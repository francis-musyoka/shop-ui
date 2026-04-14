import { z } from "zod";

/**
 * Prisma cuid validator. Loose by design — Prisma's cuid format is
 * lowercase alphanumeric, ~25 chars. We accept any non-empty string
 * matching that shape. Don't tighten without checking actual production IDs.
 */
export const CuidSchema = z.string().regex(/^[a-z0-9]{20,30}$/, {
    message: "Expected a Prisma cuid",
});

/**
 * Backend's standard pagination envelope.
 * Mirrors src/services/product.service.ts -> searchProductsHandler response.
 */
export const PaginationSchema = z.object({
    total: z.number().int().nonnegative(),
    page: z.number().int().positive(),
    limit: z.number().int().positive(),
    totalPages: z.number().int().nonnegative(),
    hasNextPage: z.boolean(),
});

/**
 * Factory for paginated responses: { data: T[], pagination: Pagination }.
 *
 * Usage:
 *   const ProductsPage = PageSchema(ProductCardSchema);
 *   const parsed = ProductsPage.parse(jsonFromBackend);
 */
export function PageSchema<T extends z.ZodTypeAny>(item: T) {
    return z.object({
        data: z.array(item),
        pagination: PaginationSchema,
    });
}

/**
 * Some backend endpoints return only { success: true } on success.
 * Use this when there's no body to validate.
 */
export const SuccessFlagSchema = z.object({
    success: z.literal(true),
});

export type Page<T> = {
    data: T[];
    pagination: z.infer<typeof PaginationSchema>;
};
