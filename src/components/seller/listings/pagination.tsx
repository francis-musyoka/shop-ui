"use client";

import { usePathname, useSearchParams } from "next/navigation";
import {
    Pagination,
    PaginationContent,
    PaginationEllipsis,
    PaginationItem,
    PaginationLink,
    PaginationNext,
    PaginationPrevious,
} from "@/components/ui/pagination";
import { setPage } from "@/lib/browse-params";

/** First, last, current and its neighbours; -1 marks an ellipsis gap. */
function pageWindow(page: number, totalPages: number): number[] {
    const pages = new Set<number>([1, totalPages, page, page - 1, page + 1]);
    const sorted = [...pages].filter((p) => p >= 1 && p <= totalPages).sort((a, b) => a - b);
    const out: number[] = [];
    let prev = 0;
    for (const p of sorted) {
        if (prev && p - prev > 1) out.push(-1);
        out.push(p);
        prev = p;
    }
    return out;
}

export function ListingsPagination({ page, totalPages }: { page: number; totalPages: number }) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    if (totalPages <= 1) return null;

    function href(p: number): string {
        const qs = setPage(searchParams, p).toString();
        return qs ? `${pathname}?${qs}` : pathname;
    }

    const items = pageWindow(page, totalPages);
    const hasPrev = page > 1;
    const hasNext = page < totalPages;

    return (
        <Pagination className="mt-2">
            <PaginationContent>
                <PaginationItem>
                    <PaginationPrevious
                        href={hasPrev ? href(page - 1) : "#"}
                        aria-disabled={!hasPrev}
                        className={!hasPrev ? "pointer-events-none opacity-50" : undefined}
                    />
                </PaginationItem>
                {items.map((p, i) =>
                    p === -1 ? (
                        <PaginationItem key={`gap-${i}`}>
                            <PaginationEllipsis />
                        </PaginationItem>
                    ) : (
                        <PaginationItem key={p}>
                            <PaginationLink href={href(p)} isActive={p === page}>
                                {p}
                            </PaginationLink>
                        </PaginationItem>
                    ),
                )}
                <PaginationItem>
                    <PaginationNext
                        href={hasNext ? href(page + 1) : "#"}
                        aria-disabled={!hasNext}
                        className={!hasNext ? "pointer-events-none opacity-50" : undefined}
                    />
                </PaginationItem>
            </PaginationContent>
        </Pagination>
    );
}
