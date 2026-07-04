"use client";

import { useVariantOffers } from "@/lib/hooks/use-variant-offers";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { OfferList } from "./offer-list";

type OffersPanelProps = {
    slug: string;
    variantId: string | undefined;
    open: boolean;
};

export function OffersPanel({ slug, variantId, open }: OffersPanelProps) {
    const query = useVariantOffers(slug, variantId, open);
    const { data, isPending, isError, refetch, fetchNextPage, hasNextPage, isFetchingNextPage } =
        query;

    // isPending is true before the first fetch resolves (and while disabled),
    // so only show skeletons once the query is actually enabled.
    if (open && variantId && isPending) {
        return (
            <ul className="divide-border divide-y">
                {[0, 1, 2].map((i) => (
                    <li key={i} className="flex items-center justify-between gap-3 py-3">
                        <div className="w-full space-y-2">
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-3 w-24" />
                        </div>
                        <Skeleton className="h-8 w-24" />
                    </li>
                ))}
            </ul>
        );
    }

    if (isError) {
        return (
            <div className="py-6 text-center">
                <p className="text-muted-foreground text-sm">Couldn&rsquo;t load offers.</p>
                <Button variant="outline" size="sm" className="mt-3" onClick={() => refetch()}>
                    Try again
                </Button>
            </div>
        );
    }

    const offers = data?.pages.flatMap((page) => page.data) ?? [];

    return (
        <>
            <OfferList offers={offers} />
            {hasNextPage && (
                <Button
                    variant="outline"
                    size="sm"
                    className="mt-3 w-full"
                    disabled={isFetchingNextPage}
                    onClick={() => fetchNextPage()}
                >
                    {isFetchingNextPage ? "Loading…" : "Load more offers"}
                </Button>
            )}
        </>
    );
}
