import { z } from "zod";
import { CUID } from "./common";

/* ── Base category (flat) ────────────────────────────── */

export const CategorySchema = z.object({
    id: CUID,
    name: z.string(),
    slug: z.string(),
});

export type Category = z.infer<typeof CategorySchema>;

/* ── Category tree node (recursive) ──────────────────── */

export interface CategoryTreeNode {
    id: string;
    name: string;
    slug: string;
    children: CategoryTreeNode[];
}

export const CategoryTreeNodeSchema: z.ZodType<CategoryTreeNode> = z.lazy(() =>
    z.object({
        id: CUID,
        name: z.string(),
        slug: z.string(),
        children: z.array(CategoryTreeNodeSchema),
    }),
);

/* ── Breadcrumb item ─────────────────────────────────── */

export const BreadcrumbItemSchema = z.object({
    id: CUID,
    name: z.string(),
    slug: z.string(),
});

export type BreadcrumbItem = z.infer<typeof BreadcrumbItemSchema>;

/* ── Response schemas ────────────────────────────────── */

export const CategoryTreeResponseSchema = z.object({
    success: z.literal(true),
    categories: z.array(CategoryTreeNodeSchema),
});

export const TopLevelCategoriesResponseSchema = z.object({
    success: z.literal(true),
    categories: z.array(CategorySchema),
});

export const CategoryBySlugResponseSchema = z.object({
    success: z.literal(true),
    category: z.object({
        id: CUID,
        name: z.string(),
        slug: z.string(),
        parent: CategorySchema.nullish(),
        children: z.array(CategorySchema),
    }),
});

export type CategoryBySlug = z.infer<typeof CategoryBySlugResponseSchema>["category"];

export const CategoryBreadcrumbResponseSchema = z.object({
    success: z.literal(true),
    breadcrumb: z.array(BreadcrumbItemSchema),
});
