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
import { SORT_OPTIONS, DEFAULT_SORT, setSingle, type SortValue } from "@/lib/browse-params";

export function SortControl() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const current = (searchParams.get("sort") as SortValue) ?? DEFAULT_SORT;
    const label = SORT_OPTIONS.find((o) => o.value === current)?.label ?? "Featured";

    function choose(value: string) {
        const next = setSingle(searchParams, "sort", value === DEFAULT_SORT ? null : value);
        const qs = next.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger
                render={<Button variant="outline" size="sm" className="hidden shrink-0 md:flex" />}
            >
                Sort: {label} <ChevronDown size={14} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuRadioGroup value={current} onValueChange={choose}>
                    {SORT_OPTIONS.map((o) => (
                        <DropdownMenuRadioItem key={o.value} value={o.value}>
                            {o.label}
                        </DropdownMenuRadioItem>
                    ))}
                </DropdownMenuRadioGroup>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
