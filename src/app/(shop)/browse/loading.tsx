import { Skeleton } from "@/components/ui/skeleton";

export default function BrowseLoading() {
    return (
        <div className="bg-background w-full px-4 py-6 md:px-6">
            <div className="flex gap-6">
                <aside className="hidden w-60 shrink-0 space-y-4 md:block">
                    {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-2">
                            <Skeleton className="h-4 w-24" />
                            <Skeleton className="h-24 w-full" />
                        </div>
                    ))}
                </aside>
                <div className="min-w-0 flex-1">
                    <Skeleton className="h-5 w-64" />
                    <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
                        {Array.from({ length: 24 }).map((_, i) => (
                            <Skeleton key={i} className="aspect-[3/4] w-full rounded-sm" />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}
