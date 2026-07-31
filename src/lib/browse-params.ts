import type { SearchProductsParams } from "@/lib/schemas/product";

export const CONDITIONS = ["NEW", "USED", "REFURBISHED"] as const;
export type ConditionValue = (typeof CONDITIONS)[number];

export const SORT_OPTIONS = [
    { value: "newest", label: "Featured" },
    { value: "price_asc", label: "Price: Low to High" },
    { value: "price_desc", label: "Price: High to Low" },
] as const;
export type SortValue = (typeof SORT_OPTIONS)[number]["value"];
export const DEFAULT_SORT: SortValue = "newest";

export const PRICE_RANGES = [
    { id: "0-10000", label: "Under KSh 10,000", min: 0, max: 10000 },
    { id: "10000-30000", label: "KSh 10,000 – 30,000", min: 10000, max: 30000 },
    { id: "30000-60000", label: "KSh 30,000 – 60,000", min: 30000, max: 60000 },
    { id: "60000-100000", label: "KSh 60,000 – 100,000", min: 60000, max: 100000 },
    { id: "100000+", label: "Over KSh 100,000", min: 100000, max: undefined },
] as const;

export const PAGE_SIZE = 24;

export type RawSearchParams = Record<string, string | string[] | undefined>;

export interface BrowseFilters {
    search: string | undefined;
    category: string[];
    brand: string[];
    condition: ConditionValue[];
    minPrice: number | undefined;
    maxPrice: number | undefined;
    sort: SortValue;
    page: number;
}

/** Read the first value of a possibly-repeated search param. */
function first(value: string | string[] | undefined): string | undefined {
    return Array.isArray(value) ? value[0] : value;
}

/** Split a CSV param into a clean list. */
function csv(value: string | string[] | undefined): string[] {
    const raw = first(value);
    return raw ? raw.split(",").filter(Boolean) : [];
}

/** Coerce to a positive number, else undefined. */
function toNumber(value: string | string[] | undefined): number | undefined {
    const raw = first(value);
    if (raw === undefined || raw === "") return undefined;
    const n = Number(raw);
    return Number.isFinite(n) && n >= 0 ? n : undefined;
}

export function parseBrowseParams(raw: RawSearchParams): BrowseFilters {
    const sortRaw = first(raw.sort);
    const sort = SORT_OPTIONS.some((o) => o.value === sortRaw)
        ? (sortRaw as SortValue)
        : DEFAULT_SORT;

    const condition = csv(raw.condition).filter((c): c is ConditionValue =>
        (CONDITIONS as readonly string[]).includes(c),
    );

    const pageNum = toNumber(raw.page);
    const page = pageNum && pageNum >= 1 ? Math.floor(pageNum) : 1;

    const search = first(raw.q)?.trim() || undefined;

    return {
        search,
        category: csv(raw.category),
        brand: csv(raw.brand),
        condition,
        minPrice: toNumber(raw.minPrice),
        maxPrice: toNumber(raw.maxPrice),
        sort,
        page,
    };
}

export function toSearchProductsParams(f: BrowseFilters): SearchProductsParams {
    const params: SearchProductsParams = { limit: PAGE_SIZE, page: f.page };
    if (f.search) params.search = f.search;
    if (f.category.length) params.category = f.category;
    if (f.brand.length) params.brand = f.brand;
    if (f.condition.length) params.condition = f.condition;
    if (f.minPrice !== undefined) params.minPrice = f.minPrice;
    if (f.maxPrice !== undefined) params.maxPrice = f.maxPrice;
    if (f.sort !== DEFAULT_SORT) params.sort = f.sort;
    return params;
}

export function getCsv(p: URLSearchParams, key: string): string[] {
    const raw = p.get(key);
    return raw ? raw.split(",").filter(Boolean) : [];
}

export function toggleCsv(p: URLSearchParams, key: string, value: string): URLSearchParams {
    const next = new URLSearchParams(p);
    const list = getCsv(next, key);
    const idx = list.indexOf(value);
    if (idx >= 0) list.splice(idx, 1);
    else list.push(value);
    if (list.length) next.set(key, list.join(","));
    else next.delete(key);
    next.delete("page");
    return next;
}

export function setSingle(p: URLSearchParams, key: string, value: string | null): URLSearchParams {
    const next = new URLSearchParams(p);
    if (value == null || value === "") next.delete(key);
    else next.set(key, value);
    next.delete("page");
    return next;
}

export function setPrice(p: URLSearchParams, min?: number, max?: number): URLSearchParams {
    const next = new URLSearchParams(p);
    if (min === undefined) next.delete("minPrice");
    else next.set("minPrice", String(min));
    if (max === undefined) next.delete("maxPrice");
    else next.set("maxPrice", String(max));
    next.delete("page");
    return next;
}

export function setPage(p: URLSearchParams, page: number): URLSearchParams {
    const next = new URLSearchParams(p);
    if (page <= 1) next.delete("page");
    else next.set("page", String(page));
    return next;
}
