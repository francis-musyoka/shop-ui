"use client";

import { useEffect, useState } from "react";
import { Search, SlidersHorizontal, X } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuGroup,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { AddListingButton } from "@/components/seller/add-listing-button";
import { SortControl } from "./sort-control";
import { CONDITIONS } from "@/lib/schemas/offer";
import { getCsv, toggleCsv, setSingle } from "@/lib/browse-params";

const CONDITION_OPTIONS = CONDITIONS.map((c) => ({
    value: c,
    label: c.charAt(0) + c.slice(1).toLowerCase(),
}));

export function FilterBar({
    categories,
    canManage,
}: {
    categories: { id: string; name: string; slug: string }[];
    canManage: boolean;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    const condition = getCsv(searchParams, "condition");
    const category = getCsv(searchParams, "category");
    const [search, setSearch] = useState(searchParams.get("q") ?? "");

    // Keep the input in sync when the URL changes from elsewhere (e.g. a tab switch
    // that also clears `q`, or the browser back button).
    useEffect(() => {
        setSearch(searchParams.get("q") ?? "");
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchParams.get("q")]);

    // Debounce typing so every keystroke doesn't trigger a refetch.
    useEffect(() => {
        const trimmed = search.trim();
        if (trimmed === (searchParams.get("q") ?? "")) return;
        const timer = setTimeout(() => {
            const next = setSingle(searchParams, "q", trimmed || null);
            const qs = next.toString();
            router.push(qs ? `${pathname}?${qs}` : pathname);
        }, 400);
        return () => clearTimeout(timer);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [search]);

    function toggle(key: string, value: string) {
        const next = toggleCsv(searchParams, key, value);
        const qs = next.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
    }

    const chips = [
        ...condition.map((value) => ({
            key: `condition:${value}`,
            label: CONDITION_OPTIONS.find((c) => c.value === value)?.label ?? value,
            onRemove: () => toggle("condition", value),
        })),
        ...category.map((value) => ({
            key: `category:${value}`,
            label: categories.find((c) => c.slug === value)?.name ?? value,
            onRemove: () => toggle("category", value),
        })),
    ];

    return (
        <div className="border-border bg-card flex flex-col gap-3 rounded-sm border p-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
                <div className="relative w-full sm:w-64">
                    <Search
                        className="text-muted-foreground pointer-events-none absolute top-1/2 left-2.5 -translate-y-1/2"
                        size={14}
                    />
                    <Input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search your listings"
                        className="pl-8"
                    />
                </div>

                <div className="flex items-center gap-2">
                    <SortControl />

                    <DropdownMenu>
                        <DropdownMenuTrigger render={<Button variant="outline" size="sm" />}>
                            <SlidersHorizontal size={14} />
                            Filter
                            {chips.length > 0 && (
                                <span className="bg-primary text-primary-foreground ml-0.5 flex size-4 items-center justify-center rounded-full text-[10px]">
                                    {chips.length}
                                </span>
                            )}
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56">
                            <DropdownMenuGroup>
                                <DropdownMenuLabel>Condition</DropdownMenuLabel>
                                <div className="flex flex-col gap-0.5 px-1.5 pb-1">
                                    {CONDITION_OPTIONS.map((c) => (
                                        <label
                                            key={c.value}
                                            className="text-foreground/90 flex cursor-pointer items-center gap-2 py-1 text-sm"
                                        >
                                            <Checkbox
                                                checked={condition.includes(c.value)}
                                                onCheckedChange={() => toggle("condition", c.value)}
                                            />
                                            {c.label}
                                        </label>
                                    ))}
                                </div>
                            </DropdownMenuGroup>
                            {categories.length > 0 && (
                                <>
                                    <DropdownMenuSeparator />
                                    <DropdownMenuGroup>
                                        <DropdownMenuLabel>Category</DropdownMenuLabel>
                                        <div className="flex max-h-48 flex-col gap-0.5 overflow-y-auto px-1.5 pb-1">
                                            {categories.map((cat) => (
                                                <label
                                                    key={cat.id}
                                                    className="text-foreground/90 flex cursor-pointer items-center gap-2 py-1 text-sm"
                                                >
                                                    <Checkbox
                                                        checked={category.includes(cat.slug)}
                                                        onCheckedChange={() =>
                                                            toggle("category", cat.slug)
                                                        }
                                                    />
                                                    <span className="truncate">{cat.name}</span>
                                                </label>
                                            ))}
                                        </div>
                                    </DropdownMenuGroup>
                                </>
                            )}
                        </DropdownMenuContent>
                    </DropdownMenu>

                    <AddListingButton canManage={canManage} />
                </div>
            </div>

            {chips.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5">
                    {chips.map((chip) => (
                        <button
                            key={chip.key}
                            onClick={chip.onRemove}
                            className="bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-xs font-medium"
                        >
                            {chip.label}
                            <X size={12} />
                        </button>
                    ))}
                </div>
            )}
        </div>
    );
}
