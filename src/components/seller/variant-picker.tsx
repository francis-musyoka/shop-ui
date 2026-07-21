"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { ChevronDown, Search, Store } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useVariantSearch } from "@/lib/hooks/use-variant-search";
import { composeVariantLabel } from "@/lib/shop-slug";
import type { VariantSearchResult } from "@/lib/schemas/offer";

const ALL_CATEGORIES = "__all__";
const ALL_BRANDS = "__all__";

interface VariantPickerProps {
    shopCategoryId: string;
    categories: { id: string; name: string }[];
    brands: { id: string; name: string }[];
    onSelectAction: (result: VariantSearchResult) => void;
}

// Catalog search for the product/variant to list (G2). Text-first: the results panel
// stays hidden until the trimmed query reaches 4 characters — useVariantSearch already
// gates its query on that same minimum (the backend's real floor), so this just keeps
// the UI from flashing an empty "no results" state while the user is still typing.
// Category defaults to the shop's own category (nothing on the backend restricts a shop
// to it, but it keeps the fast path narrow); the seller can widen to any category, or
// narrow further by brand.
export function VariantPicker({
    shopCategoryId,
    categories,
    brands,
    onSelectAction,
}: VariantPickerProps) {
    const [search, setSearch] = useState("");
    const [debounced, setDebounced] = useState("");
    const [categoryId, setCategoryId] = useState<string>(shopCategoryId);
    const [brandId, setBrandId] = useState<string>(ALL_BRANDS);

    // 400ms debounce, same local-timer pattern as SlugField / FilterBar — no external
    // library needed for this.
    useEffect(() => {
        const timer = setTimeout(() => setDebounced(search.trim()), 400);
        return () => clearTimeout(timer);
    }, [search]);

    const showPanel = debounced.length >= 4;
    const { data, isFetching } = useVariantSearch({
        search: debounced,
        categoryId: categoryId === ALL_CATEGORIES ? undefined : categoryId,
        brandId: brandId === ALL_BRANDS ? undefined : brandId,
    });
    const results = data?.data ?? [];

    const categoryLabel =
        categoryId === ALL_CATEGORIES
            ? "All categories"
            : (categories.find((c) => c.id === categoryId)?.name ?? "Category");
    const brandLabel =
        brandId === ALL_BRANDS
            ? "All brands"
            : (brands.find((b) => b.id === brandId)?.name ?? "Brand");

    return (
        <div className="flex flex-col gap-2">
            <div className="flex flex-wrap items-center gap-2">
                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={<Button variant="outline" size="sm" className="shrink-0" />}
                    >
                        {categoryLabel} <ChevronDown size={14} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="max-h-64 w-56 overflow-y-auto">
                        <DropdownMenuRadioGroup value={categoryId} onValueChange={setCategoryId}>
                            <DropdownMenuRadioItem value={ALL_CATEGORIES}>
                                All categories
                            </DropdownMenuRadioItem>
                            {categories.map((c) => (
                                <DropdownMenuRadioItem key={c.id} value={c.id}>
                                    {c.name}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>

                <DropdownMenu>
                    <DropdownMenuTrigger
                        render={<Button variant="outline" size="sm" className="shrink-0" />}
                    >
                        {brandLabel} <ChevronDown size={14} />
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="max-h-64 w-56 overflow-y-auto">
                        <DropdownMenuRadioGroup value={brandId} onValueChange={setBrandId}>
                            <DropdownMenuRadioItem value={ALL_BRANDS}>
                                All brands
                            </DropdownMenuRadioItem>
                            {brands.map((b) => (
                                <DropdownMenuRadioItem key={b.id} value={b.id}>
                                    {b.name}
                                </DropdownMenuRadioItem>
                            ))}
                        </DropdownMenuRadioGroup>
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>

            <div className="relative">
                <Search
                    className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
                    size={14}
                />
                <Input
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Search products by name (at least 4 characters)"
                    className="h-10 pl-8"
                />
            </div>

            {showPanel && (
                <div className="border-border bg-card max-h-80 overflow-y-auto rounded-sm border">
                    {isFetching ? (
                        <p className="text-muted-foreground p-3 text-sm">Searching…</p>
                    ) : results.length === 0 ? (
                        <p className="text-muted-foreground p-3 text-sm">
                            No matching products. If something&apos;s missing from the catalog,
                            contact support.
                        </p>
                    ) : (
                        results.map((r) => (
                            <button
                                key={r.variantId}
                                type="button"
                                onClick={() => onSelectAction(r)}
                                className="hover:bg-muted border-border flex w-full items-center justify-between gap-3 border-b px-3 py-2 text-left last:border-b-0"
                            >
                                <div className="flex min-w-0 items-center gap-2.5">
                                    <div className="bg-muted relative flex size-9 shrink-0 items-center justify-center overflow-hidden rounded-sm">
                                        {r.mainImageUrl ? (
                                            <Image
                                                src={r.mainImageUrl}
                                                alt=""
                                                fill
                                                unoptimized
                                                sizes="36px"
                                                className="object-cover"
                                            />
                                        ) : (
                                            <Store className="text-muted-foreground" size={14} />
                                        )}
                                    </div>
                                    <div className="min-w-0">
                                        <p className="truncate text-sm font-medium">
                                            {r.productTitle} — {composeVariantLabel(r.attributes)}
                                        </p>
                                        <p className="text-muted-foreground truncate text-xs">
                                            {r.category.name}
                                            {r.brand ? ` · ${r.brand.name}` : ""}
                                        </p>
                                    </div>
                                </div>
                                {r.alreadyListed && (
                                    <span className="bg-muted text-muted-foreground shrink-0 rounded-full px-2 py-0.5 text-[11px] font-medium">
                                        Already listed
                                    </span>
                                )}
                            </button>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
