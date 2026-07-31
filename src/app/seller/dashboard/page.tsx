import Link from "next/link";
import { Store, AlertTriangle, ChevronRight } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { getMyOffers, getMyShop } from "@/lib/api/shops";
import { canManageListings } from "@/lib/seller/can-manage";
import { PageHeader } from "@/components/seller/page-header";
import { StatTile } from "@/components/seller/stat-tile";
import { AddListingButton } from "@/components/seller/add-listing-button";
import { ListingsTable } from "@/components/seller/listings-table";

export default async function DashboardOverviewPage() {
    const [res, shop] = await Promise.all([
        getMyOffers({ sort: "newest", page: 1, limit: 4 }),
        getMyShop(),
    ]);

    const canManage = canManageListings(shop.status);
    const { activeListings, totalListings, lowStock, outOfStock, suspended } = res.summary;

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title={`Welcome back, ${shop.name}`}
                description="Here's how your shop is doing."
                actions={
                    <>
                        <Link
                            href="/seller/dashboard/settings"
                            className={buttonVariants({ variant: "outline", size: "sm" })}
                        >
                            <Store size={14} />
                            Edit shop
                        </Link>
                        <AddListingButton canManage={canManage} />
                    </>
                }
            />

            {/* Action-needed banner — suspended listings on an otherwise-active shop. Hidden
                when the shop itself isn't active (the layout-level ShopStatusNotice covers
                that case). */}
            {canManage && suspended > 0 && (
                <div className="border-destructive/30 bg-destructive/5 flex items-start gap-2.5 rounded-sm border px-4 py-3">
                    <AlertTriangle className="text-destructive mt-0.5 shrink-0" size={16} />
                    <div className="text-sm">
                        <p className="text-foreground font-medium">
                            {suspended} {suspended === 1 ? "listing needs" : "listings need"} your
                            attention
                        </p>
                        <p className="text-muted-foreground">
                            {suspended === 1 ? "A listing was" : `${suspended} listings were`}{" "}
                            suspended.{" "}
                            <Link
                                href="/seller/dashboard/listings"
                                className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
                            >
                                Review listings
                            </Link>
                        </p>
                    </div>
                </div>
            )}

            {/* Stat tiles */}
            <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
                <StatTile
                    label="Active listings"
                    value={activeListings}
                    hint={`${totalListings} total`}
                />
                <StatTile
                    label="Low / out of stock"
                    value={lowStock + outOfStock}
                    hint="Needs restock"
                    tone={outOfStock > 0 ? "critical" : lowStock > 0 ? "warning" : "default"}
                />
                <StatTile label="Storefront views" value="—" comingSoon />
                <StatTile label="Unread inquiries" value="—" comingSoon />
            </div>

            {/* Recent listings */}
            <div className="border-border bg-card flex items-center justify-between gap-3 rounded-sm border px-3 py-4">
                <h2 className="text-sm font-semibold">Recent listings</h2>
                <Link
                    href="/seller/dashboard/listings"
                    className="text-brand-600 dark:text-brand-400 flex items-center gap-0.5 text-sm font-medium hover:underline"
                >
                    View all <ChevronRight size={14} />
                </Link>
            </div>

            <ListingsTable listings={res.data} canManage={canManage} />
        </div>
    );
}
