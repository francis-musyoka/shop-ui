import Link from "next/link";
import { ExternalLink, ArrowLeft } from "lucide-react";
import type { MyShop } from "@/lib/schemas/seller-shop";
import { shopInitials } from "@/lib/seller/shop-initials";
import { DashboardNav } from "./dashboard-nav";
import { ShopStatusBadge, VerifiedBadge } from "./shop-status-badge";

// Shared between the desktop <aside> and the mobile Sheet drawer so the two never
// drift out of sync. onNavigateAction closes the mobile drawer after a link is tapped.
export function SidebarContent({
    shop,
    onNavigateAction,
}: {
    shop: MyShop;
    onNavigateAction?: () => void;
}) {
    return (
        <>
            <div className="border-border bg-card rounded-sm border p-3">
                <div className="flex items-center gap-2.5">
                    <div className="bg-brand-700 flex size-10 shrink-0 items-center justify-center rounded-sm font-semibold text-white">
                        {shopInitials(shop.name)}
                    </div>
                    <div className="min-w-0">
                        <p className="truncate text-sm font-semibold">{shop.name}</p>
                        <p className="text-muted-foreground truncate text-xs">
                            {shop.category.name}
                        </p>
                    </div>
                </div>
                <div className="mt-2.5 flex flex-wrap items-center gap-1.5">
                    <ShopStatusBadge status={shop.status} />
                    {shop.isVerified && <VerifiedBadge />}
                </div>
            </div>

            <div className="mt-4">
                <DashboardNav onNavigateAction={onNavigateAction} />
            </div>

            <div className="border-border mt-4 flex flex-col gap-2 border-t pt-4">
                <Link
                    href={`/shops/${shop.slug}`}
                    onClick={onNavigateAction}
                    className="text-brand-600 dark:text-brand-400 flex items-center gap-1.5 text-sm font-medium hover:underline"
                >
                    <ExternalLink size={14} />
                    View storefront
                </Link>
                <Link
                    href="/"
                    onClick={onNavigateAction}
                    className="text-muted-foreground hover:text-foreground flex items-center gap-1.5 text-sm"
                >
                    <ArrowLeft size={14} />
                    Back to marketplace
                </Link>
            </div>
        </>
    );
}
