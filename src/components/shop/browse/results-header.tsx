import { PAGE_SIZE } from "@/lib/browse-params";

export function ResultsHeader({
    total,
    count,
    page,
}: {
    total: number;
    count: number;
    page: number;
}) {
    const start = count === 0 ? 0 : (page - 1) * PAGE_SIZE + 1;
    const end = (page - 1) * PAGE_SIZE + count;
    return (
        <div>
            <p className="text-foreground hidden text-sm md:block">
                {start}–{end} of over {total.toLocaleString("en-KE")} results
            </p>
            <p className="text-muted-foreground mt-0.5 text-sm">
                Tap a product to compare offers from other sellers.
            </p>
        </div>
    );
}
