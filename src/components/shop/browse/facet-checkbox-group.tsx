"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Expandable } from "@/components/ui/expandable";
import { getCsv, toggleCsv } from "@/lib/browse-params";

interface FacetOption {
    value: string;
    label: string;
}

export function FacetCheckboxGroup({
    title,
    paramKey,
    options,
    wrap = false,
}: {
    title: string;
    paramKey: string;
    options: FacetOption[];
    wrap?: boolean;
}) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const selected = new Set(getCsv(searchParams, paramKey));

    function toggle(value: string) {
        const next = toggleCsv(searchParams, paramKey, value);
        const qs = next.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
    }

    const list = (
        <div className="space-y-0.5">
            {options.map((opt) => (
                <label
                    key={opt.value}
                    className="text-foreground/90 flex cursor-pointer items-center gap-2 py-1 text-sm"
                >
                    <Checkbox
                        checked={selected.has(opt.value)}
                        onCheckedChange={() => toggle(opt.value)}
                    />
                    <span className="truncate">{opt.label}</span>
                </label>
            ))}
        </div>
    );

    return (
        <div>
            <p className="text-foreground mb-1.5 text-sm font-semibold">{title}</p>
            {wrap ? <Expandable collapsedHeight={176}>{list}</Expandable> : list}
        </div>
    );
}
