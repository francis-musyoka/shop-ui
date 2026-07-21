"use client";

import { ChevronDown } from "lucide-react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuRadioGroup,
    DropdownMenuRadioItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { setSingle } from "@/lib/browse-params";
import {
    SELLER_SORT_OPTIONS,
    DEFAULT_SELLER_SORT,
    type SellerSortValue,
} from "@/lib/seller-listings-params";

export function SortControl() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const current = (searchParams.get("sort") as SellerSortValue) ?? DEFAULT_SELLER_SORT;
    const label = SELLER_SORT_OPTIONS.find((o) => o.value === current)?.label ?? "Newest first";

    function choose(value: string) {
        const next = setSingle(searchParams, "sort", value === DEFAULT_SELLER_SORT ? null : value);
        const qs = next.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={<Button variant="outline" size="sm" className="shrink-0" />}
            >
                Sort: {label} <ChevronDown size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuRadioGroup value={current} onValueChange={choose}>
                    {SELLER_SORT_OPTIONS.map((o) => (
                        <DropdownMenuRadioItem key={o.value} value={o.value}>
                            {o.label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
