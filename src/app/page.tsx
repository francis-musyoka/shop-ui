import Link from "next/link";
import { getTopLevelCategories } from "@/lib/api/categories";
import { getNewestListings } from "@/lib/api/products";
import { getSession } from "@/lib/auth/session";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";
import { PageContainer } from "@/components/layout/page-container";
import { ListingCard } from "@/components/shop/listing-card";

export default async function LandingPage() {
    const [categoriesResult, productsResult, session] = await Promise.allSettled([
        getTopLevelCategories(),
        getNewestListings({ limit: 12, perCategory: 3 }),
        getSession(),
    ]);

    const categories = categoriesResult.status === "fulfilled" ? categoriesResult.value : [];
    const products = productsResult.status === "fulfilled" ? productsResult.value.data : [];
    const user = session.status === "fulfilled" ? (session.value?.user ?? null) : null;

    return (
        <>
            <SiteHeader user={user} categories={categories} />

            {/* Newest listings */}
            {products.length > 0 && (
                <section className="px-4 py-5 md:px-6">
                    <div className="mb-3 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-base font-semibold">Newest Listings</h2>
                            <p className="text-muted-foreground text-base">
                                Tap a product to compare offers from other sellers.
                            </p>
                        </div>
                        <Link
                            href="/browse"
                            className="text-brand-600 hover:text-brand-700 dark:text-brand-400 shrink-0 text-sm font-medium transition-colors duration-100"
                        >
                            View all &rsaquo;
                        </Link>
                    </div>
                    <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4 md:gap-3 lg:grid-cols-5 xl:grid-cols-6">
                        {products.map((product) => (
                            <ListingCard key={product.id} product={product} />
                        ))}
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
