// src/app/products/[slug]/loading.tsx
import { Skeleton } from "@/components/ui/skeleton";

export default function ProductLoading() {
    return (
        <div className="mx-auto max-w-7xl px-4 py-6 md:px-6">
            <Skeleton className="mb-4 h-5 w-64" />
            <div className="grid grid-cols-1 gap-6 md:grid-cols-12">
                <div className="md:col-span-5">
                    <Skeleton className="aspect-square w-full rounded-sm" />
                </div>
                <div className="space-y-3 md:col-span-4">
                    <Skeleton className="h-6 w-3/4" />
                    <Skeleton className="h-8 w-40" />
                    <Skeleton className="h-10 w-full" />
                    <Skeleton className="h-10 w-full" />
                </div>
            </div>
        </div>
    );
}
