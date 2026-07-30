import { searchProducts } from "@/lib/api/products";
import { getCategoryTree } from "@/lib/api/categories";
import { listBrands } from "@/lib/api/brands";
import { pruneCategoryTree, filterAvailable } from "@/lib/category-filters";
import {
    parseBrowseParams,
    toSearchProductsParams,
    type RawSearchParams,
} from "@/lib/browse-params";
import { ListingCard } from "@/components/shop/listing-card";
import { FilterPanel } from "@/components/shop/browse/filter-panel";
import { MobileFilters } from "@/components/shop/browse/mobile-filters";
import { ResultsHeader } from "@/components/shop/browse/results-header";
import { SortControl } from "@/components/shop/browse/sort-control";
import { BrowsePagination } from "@/components/shop/browse/browse-pagination";
import { EmptyState } from "@/components/shop/browse/empty-state";

export default async function BrowsePage({
    searchParams,
}: {
    searchParams: Promise<RawSearchParams>;
}) {
    const filters = parseBrowseParams(await searchParams);
    const params = toSearchProductsParams(filters);

    const [res, rawTree, rawBrands] = await Promise.all([
        searchProducts(params),
        // Facets are non-critical — degrade to an empty facet list on failure, but
        // log it (incl. schema drift) instead of swallowing silently.
        getCategoryTree().catch((error) => {
            console.error("BrowsePage: failed to load category tree", error);
            return [];
        }),
        listBrands().catch((error) => {
            console.error("BrowsePage: failed to load brands", error);
            return [];
        }),
    ]);

    const tree = pruneCategoryTree(rawTree);
    const brands = filterAvailable(rawBrands);

    // Filter panel keeps a flat top-level list; derive it from the tree roots so
    // its category IDs match the (freshly-fetched) tree the header uses, instead
    // of the separately-cached flat endpoint that can go stale after a reseed.
    const categories = tree.map(({ id, name }) => ({ id, name }));

    const products = res.data;
    const total = res.pagination.total;
    const totalPages = res.pagination.totalPages;
    const page = res.pagination.page;

    return (
        <div className="bg-background w-full px-4 py-6 md:px-6">
            <div className="flex gap-6">
                <aside className="hidden w-60 shrink-0 md:block">
                    <FilterPanel categories={categories} brands={brands} />
                </aside>

                <div className="min-w-0 flex-1">
                    <div className="mb-3 md:hidden">
                        <MobileFilters>
                            <FilterPanel categories={categories} brands={brands} />
                        </MobileFilters>
                    </div>

                    <div className="border-border flex items-start justify-between gap-3 border-b pb-3">
                        <ResultsHeader total={total} count={products.length} page={page} />
                        <SortControl />
                    </div>

                    {products.length === 0 ? (
                        <EmptyState />
                    ) : (
                        <div className="mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3 lg:grid-cols-5 xl:grid-cols-6">
                            {products.map((p) => (
                                <ListingCard key={p.id} product={p} />
                            ))}
                        </div>
                    )}

                    <BrowsePagination page={page} totalPages={totalPages} />
                </div>
            </div>
        </div>
    );
}
