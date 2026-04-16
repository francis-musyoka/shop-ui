import "server-only";
import { apiFetch } from "./client";
import type {
    Category,
    CategoryTreeNode,
    BreadcrumbItem,
    CategoryBySlug,
} from "@/lib/schemas/category";
import {
    CategoryTreeResponseSchema,
    TopLevelCategoriesResponseSchema,
    CategoryBySlugResponseSchema,
    CategoryBreadcrumbResponseSchema,
} from "@/lib/schemas/category";

/**
 * Full category tree (recursive). Cached with "categories" tag.
 */
export async function getCategoryTree(): Promise<CategoryTreeNode[]> {
    const res = await apiFetch({
        path: "/api/categories/tree",
        schema: CategoryTreeResponseSchema,
        forwardCookies: false,
        cache: "force-cache",
        tags: ["categories"],
    });
    return res.categories;
}

/**
 * Flat list of top-level categories. Cached with "categories" tag.
 */
export async function getTopLevelCategories(): Promise<Category[]> {
    const res = await apiFetch({
        path: "/api/categories",
        schema: TopLevelCategoriesResponseSchema,
        forwardCookies: false,
        cache: "force-cache",
        tags: ["categories"],
    });
    return res.categories;
}

/**
 * Single category by slug with parent + children.
 */
export async function getCategoryBySlug(slug: string): Promise<CategoryBySlug> {
    const res = await apiFetch({
        path: `/api/categories/${slug}`,
        schema: CategoryBySlugResponseSchema,
        forwardCookies: false,
        cache: "no-store",
    });
    return res.category;
}

/**
 * Ordered breadcrumb for a category (root → ... → current).
 */
export async function getCategoryBreadcrumb(slug: string): Promise<BreadcrumbItem[]> {
    const res = await apiFetch({
        path: `/api/categories/${slug}/breadcrumb`,
        schema: CategoryBreadcrumbResponseSchema,
        forwardCookies: false,
        cache: "no-store",
    });
    return res.breadcrumb;
}
