// src/app/products/[slug]/not-found.tsx
import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function ProductNotFound() {
    return (
        <div className="mx-auto flex max-w-7xl flex-col items-center gap-4 px-4 py-24 text-center md:px-6">
            <h1 className="text-lg font-semibold">Product not found</h1>
            <p className="text-muted-foreground text-sm">
                This product may have been removed or is no longer available.
            </p>
            <Button render={<Link href="/" />} nativeButton={false}>
                Back to home
            </Button>
        </div>
    );
}
