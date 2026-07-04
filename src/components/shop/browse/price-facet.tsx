"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PRICE_RANGES, setPrice } from "@/lib/browse-params";

function activeRangeId(min: string | null, max: string | null): string | null {
    const match = PRICE_RANGES.find(
        (r) =>
            String(r.min) === min && (r.max === undefined ? max === null : String(r.max) === max),
    );
    return match?.id ?? null;
}

export function PriceFacet() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const active = activeRangeId(searchParams.get("minPrice"), searchParams.get("maxPrice"));

    function select(rangeId: string, min: number, max: number | undefined) {
        const next = active === rangeId ? setPrice(searchParams) : setPrice(searchParams, min, max);
        const qs = next.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
    }

    return (
        <div>
            <p className="text-foreground mb-1.5 text-sm font-semibold">Price</p>
            <div className="space-y-0.5">
                {PRICE_RANGES.map((r) => (
                    <label
                        key={r.id}
                        className="text-foreground/90 flex cursor-pointer items-center gap-2 py-1 text-sm"
                    >
                        <input
                            type="radio"
                            name="price-range"
                            checked={active === r.id}
                            onChange={() => select(r.id, r.min, r.max)}
                            onClick={() => {
                                if (active === r.id) select(r.id, r.min, r.max);
                            }}
                            className="accent-primary size-4"
                        />
                        <span className="truncate">{r.label}</span>
                    </label>
                ))}
            </div>
        </div>
    );
}
