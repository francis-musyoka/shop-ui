import Link from "next/link";
import type { Offer } from "@/lib/schemas/product";

export function SellerCard({ shop }: { shop: Offer["shop"] }) {
    return (
        <div className="flex items-center gap-2">
            <div className="bg-brand-100 text-brand-800 flex size-6 shrink-0 items-center justify-center rounded-full text-sm font-semibold">
                {shop.name.charAt(0)}
            </div>
            <div className="min-w-0">
                <Link
                    href={`/shops/${shop.slug}`}
                    className="truncate text-sm font-medium hover:underline"
                >
                    {shop.name}
                </Link>
            </div>
        </div>
    );
}
