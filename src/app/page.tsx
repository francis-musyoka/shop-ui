import Link from "next/link";
import { getTopLevelCategories } from "@/lib/api/categories";
import { searchProducts } from "@/lib/api/products";
import { getSession } from "@/lib/auth/session";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { PageContainer } from "@/components/layout/page-container";
import { SearchBar } from "@/components/layout/search-bar";
import { CategoryBar } from "@/components/layout/category-bar";
import { ListingCard } from "@/components/shop/listing-card";

/**
 * Mock enrichment data for card visualization.
 * TODO: Remove once backend returns discount/condition/location in search response.
 */
const MOCK_ENRICHMENTS = [
    { condition: "NEW" as const, discount: 15, location: "Nairobi", shopName: "TechHub" },
    { condition: "NEW" as const, discount: 0, location: "Mombasa", shopName: "GadgetWorld" },
    { condition: "USED" as const, discount: 30, location: "Nairobi", shopName: "PhoneStore" },
    { condition: "NEW" as const, discount: 5, location: "Kisumu", shopName: "ElectroMart" },
    { condition: "REFURBISHED" as const, discount: 20, location: "Nairobi", shopName: "RenewTech" },
    { condition: "NEW" as const, discount: 0, location: "Nakuru", shopName: "SmartDeals" },
    { condition: "USED" as const, discount: 10, location: "Mombasa", shopName: "ValueShop" },
    { condition: "NEW" as const, discount: 0, location: "Nairobi", shopName: "TechHub" },
    { condition: "NEW" as const, discount: 25, location: "Eldoret", shopName: "MegaElectro" },
    { condition: "REFURBISHED" as const, discount: 35, location: "Nairobi", shopName: "RenewTech" },
    { condition: "NEW" as const, discount: 0, location: "Thika", shopName: "QuickBuy" },
    { condition: "USED" as const, discount: 15, location: "Nairobi", shopName: "PhoneStore" },
];

export default async function LandingPage() {
    const [categoriesResult, productsResult, session] = await Promise.allSettled([
        getTopLevelCategories(),
        searchProducts({ limit: 12 }),
        getSession(),
    ]);

    const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
    const products = productsResult.status === "fulfilled" ? productsResult.value.data : [];
    const user = session.status === "fulfilled" ? (session.value?.user ?? null) : null;

    return (
        <>
            {/* Header */}
            <header className="bg-brand-800 dark:bg-brand-900">
                <div className="flex h-[60px] items-center gap-4 px-4 md:gap-6 md:px-6">
                    <Link
                        href="/"
                        className="shrink-0 font-[family-name:var(--font-brand)] text-xl font-bold text-white"
                    >
                        Riverflow
                    </Link>
                    <div className="hidden flex-1 sm:flex">
                        <SearchBar
                            placeholder="Search products, brands, and categories"
                            className="w-full"
                            categories={categories}
                        />
                    </div>
                    <Navbar user={user} />
                </div>
            </header>

            {/* Mobile search */}
            <div className="bg-brand-700 px-4 py-2 sm:hidden">
                <SearchBar placeholder="Search products..." className="w-full" />
            </div>

            {/* Category bar */}
            {categories.length > 0 && <CategoryBar categories={categories} />}

            {/* Newest listings */}
            {products.length > 0 && (
                <section className="px-4 py-5 md:px-6">
                    <div className="mb-3 flex items-center justify-between">
                        <h2 className="text-base font-semibold">Newest Listings</h2>
                        <Link
                            href="/browse"
                            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 text-sm font-medium transition-colors duration-100"
                        >
                            View all &rsaquo;
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3 lg:grid-cols-5 xl:grid-cols-6">
                        {products.map((product, i) => {
                            // Mock enrichment data for visualization — will come from backend later
                            const mockEnrichment = MOCK_ENRICHMENTS[i % MOCK_ENRICHMENTS.length]!;
                            return (
                                <ListingCard
                                    key={product.id}
                                    product={product}
                                    condition={mockEnrichment.condition}
                                    discount={mockEnrichment.discount}
                                    originalPrice={
                                        mockEnrichment.discount && product.lowestPrice
                                            ? Math.round(
                                                  product.lowestPrice /
                                                      (1 - mockEnrichment.discount / 100),
                                              )
                                            : undefined
                                    }
                                    location={mockEnrichment.location}
                                    shopName={mockEnrichment.shopName}
                                />
                            );
                        })}
                    </div>
                </section>
            )}

            {/* Empty state when both fail */}
            {categories.length === 0 && products.length === 0 && (
                <section className="py-16">
                    <PageContainer className="text-center">
                        <p className="text-muted-foreground/30 text-[2rem]">🏪</p>
                        <h2 className="mt-2 font-[family-name:var(--font-brand)] text-base font-semibold">
                            Nothing here yet
                        </h2>
                        <p className="text-muted-foreground mt-1 text-[0.8125rem]">
                            Check back soon — listings are on the way.
                        </p>
                    </PageContainer>
                </section>
            )}

            <Footer />
        </>
    );
}
