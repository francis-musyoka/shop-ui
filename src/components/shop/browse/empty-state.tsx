import Link from "next/link";
import { buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function EmptyState() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-foreground text-base font-semibold">
                No products match your filters
            </p>
            <p className="text-muted-foreground mt-1 text-sm">
                Try removing a filter or widening your price range.
            </p>
            <Link
                href="/browse"
                className={cn(buttonVariants({ variant: "outline", size: "sm" }), "mt-4")}
            >
                Clear filters
            </Link>
        </div>
    );
}
