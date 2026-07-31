import type { RawSearchParams } from "@/lib/browse-params";
import { CONDITIONS, OFFER_STATUSES, type SellerListing } from "@/lib/schemas/offer";

export type ConditionValue = SellerListing["condition"];
export type OfferStatusValue = SellerListing["status"];

export const SELLER_SORT_OPTIONS = [
    { value: "newest", label: "Newest first" },
    { value: "price_asc", label: "Price: low to high" },
    { value: "price_desc", label: "Price: high to low" },
    { value: "stock_asc", label: "Stock: low to high" },
] as const;
export type SellerSortValue = (typeof SELLER_SORT_OPTIONS)[number]["value"];
export const DEFAULT_SELLER_SORT: SellerSortValue = "newest";

export const STATUS_TABS: { label: string; value: OfferStatusValue | undefined }[] = [
    { label: "All", value: undefined },
    { label: "Active", value: "ACTIVE" },
    { label: "Inactive", value: "INACTIVE" },
    { label: "Out of stock", value: "OUT_OF_STOCK" },
    { label: "Suspended", value: "SUSPENDED" },
];

export const PAGE_SIZE = 10;

export interface ListingFilters {
    status: OfferStatusValue[];
    condition: ConditionValue[];
    category: string[];
    search: string | undefined;
    sort: SellerSortValue;
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

export function parseListingParams(raw: RawSearchParams): ListingFilters {
    const statusRaw = first(raw.status);
    const status: OfferStatusValue[] =
        statusRaw && (OFFER_STATUSES as readonly string[]).includes(statusRaw)
            ? [statusRaw as OfferStatusValue]
            : [];

    const condition = csv(raw.condition).filter((c): c is ConditionValue =>
        (CONDITIONS as readonly string[]).includes(c),
    );

    const category = csv(raw.category);

    const search = first(raw.q)?.trim() || undefined;

    const sortRaw = first(raw.sort);
    const sort = SELLER_SORT_OPTIONS.some((o) => o.value === sortRaw)
        ? (sortRaw as SellerSortValue)
        : DEFAULT_SELLER_SORT;

    const pageNum = toNumber(raw.page);
    const page = pageNum && pageNum >= 1 ? Math.floor(pageNum) : 1;

    return { status, condition, category, search, sort, page };
}

// Loosely-typed query shape `getMyOffers` (src/lib/api/shops.ts, Task 0) accepts —
// intersected with `Record<...>` so it stays directly assignable to that Record
// parameter without touching Task 0's file (see the note above `getMyOffers`).
export type MyOffersQuery = Record<string, string | number | boolean | undefined | null> & {
    status?: OfferStatusValue;
    condition?: string;
    category?: string;
    search?: string;
    sort?: SellerSortValue;
    page?: number;
    limit?: number;
};

export function toMyOffersParams(f: ListingFilters): MyOffersQuery {
    const params: MyOffersQuery = { page: f.page, limit: PAGE_SIZE };
    if (f.status.length) params.status = f.status[0];
    if (f.condition.length) params.condition = f.condition.join(",");
    if (f.category.length) params.category = f.category.join(",");
    if (f.search) params.search = f.search;
    if (f.sort !== DEFAULT_SELLER_SORT) params.sort = f.sort;
    return params;
}
