"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CONDITIONS } from "@/lib/browse-params";
import { FacetCheckboxGroup } from "./facet-checkbox-group";
import { PriceFacet } from "./price-facet";

const CONDITION_OPTIONS = CONDITIONS.map((c) => ({
    value: c,
    label: c.charAt(0) + c.slice(1).toLowerCase(),
}));

const FILTER_KEYS = ["categoryId", "brandId", "condition", "minPrice", "maxPrice"];

export function FilterPanel({
    categories,
    brands,
}: {
    categories: { id: string; name: string }[];
    brands: { id: string; name: string }[];
}) {
    const searchParams = useSearchParams();
    const hasActiveFilters = FILTER_KEYS.some((k) => searchParams.has(k));

    return (
        <div className="space-y-5">
            {hasActiveFilters && (
                <div className="flex items-center justify-between">
                    <p className="text-sm font-semibold">Filters</p>
                    <Link
                        href="/browse"
                        className="text-brand-600 dark:text-brand-400 text-sm hover:underline"
                    >
                        Clear all
                    </Link>
                </div>
            )}

            <FacetCheckboxGroup
                title="Category"
                paramKey="categoryId"
                options={categories.map((c) => ({ value: c.id, label: c.name }))}
                wrap
            />
            <FacetCheckboxGroup
                title="Brand"
                paramKey="brandId"
                options={brands.map((b) => ({ value: b.id, label: b.name }))}
                wrap
            />
            <PriceFacet />
            <FacetCheckboxGroup
                title="Condition"
                paramKey="condition"
                options={CONDITION_OPTIONS}
            />
        </div>
    );
}
