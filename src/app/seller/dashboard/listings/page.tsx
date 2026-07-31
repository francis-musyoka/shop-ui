import { getMyOffers, getMyShop } from "@/lib/api/shops";
import { getCategoryTree } from "@/lib/api/categories";
import { canManageListings } from "@/lib/seller/can-manage";
import { parseListingParams, toMyOffersParams } from "@/lib/seller-listings-params";
import type { RawSearchParams } from "@/lib/browse-params";
import { PageHeader } from "@/components/seller/page-header";
import { StatusTabs } from "@/components/seller/listings/status-tabs";
import { FilterBar } from "@/components/seller/listings/filter-bar";
import { ListingsTable } from "@/components/seller/listings-table";
import { ListingsPagination } from "@/components/seller/listings/pagination";

export default async function ListingsPage({
    searchParams,
}: {
    searchParams: Promise<RawSearchParams>;
}) {
    const filters = parseListingParams(await searchParams);

    const [res, tree, shop] = await Promise.all([
        getMyOffers(toMyOffersParams(filters)),
        // Category facet is non-critical — degrade to an empty list on failure
        // rather than breaking the whole page.
        getCategoryTree().catch((error) => {
            console.error("ListingsPage: failed to load category tree", error);
            return [];
        }),
        getMyShop(),
    ]);

    const canManage = canManageListings(shop.status);
    // Filter bar keeps a flat top-level list, same as the browse FilterPanel.
    const categories = tree.map(({ id, name, slug }) => ({ id, name, slug }));
    const total = res.pagination.total;

    return (
        <div className="flex flex-col gap-6">
            <PageHeader
                title="Listings"
                description={`${total.toLocaleString("en-KE")} listing${total === 1 ? "" : "s"} · manage price, stock and availability`}
            />

            <StatusTabs />

            <FilterBar categories={categories} canManage={canManage} />

            <ListingsTable listings={res.data} canManage={canManage} status={filters.status[0]} />

            <ListingsPagination page={res.pagination.page} totalPages={res.pagination.totalPages} />
        </div>
    );
}
