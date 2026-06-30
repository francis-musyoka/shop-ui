// src/app/products/[slug]/page.tsx
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getProductBySlug } from "@/lib/api/products";
import { ApiError } from "@/lib/api/errors";
import { SiteHeader } from "@/components/layout/site-header";
import { Footer } from "@/components/layout/footer";
import { SpecsTable } from "@/components/shop/specs-table";
import { Expandable } from "@/components/ui/expandable";
import { ProductPageClient } from "./product-page-client";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    let product;
    try {
        product = await getProductBySlug(slug);
    } catch (error) {
        if (error instanceof ApiError && error.statusCode === 404) notFound();
        throw error;
    }

    return (
        <>
            <SiteHeader user={null} categories={[]} />

            <div className="mx-auto max-w-7xl px-4 md:px-6">
                <nav className="text-muted-foreground flex items-center gap-1 py-3 text-sm">
                    <Link href="/" className="hover:text-foreground">
                        Home
                    </Link>
                    <ChevronRight size={14} />
                    <Link
                        href={`/categories/${product.category.slug}`}
                        className="hover:text-foreground"
                    >
                        {product.category.name}
                    </Link>
                </nav>

                <ProductPageClient product={product} />

                {product.description && (
                    <section className="border-border border-t py-6">
                        <h2 className="text-base font-semibold">Description</h2>
                        <Expandable collapsedHeight={150}>
                            <div className="text-foreground/90 mt-3 space-y-3 text-sm leading-relaxed">
                                {product.description.split("\n\n").map((para, i) => (
                                    <p key={i}>{para}</p>
                                ))}
                            </div>
                        </Expandable>
                    </section>
                )}

                <section className="grid grid-cols-1 gap-6 py-6 md:grid-cols-3">
                    <div className="md:col-span-2">
                        <h2 className="text-base font-semibold">Specifications</h2>
                        {product.specs ? (
                            <Expandable collapsedHeight={260}>
                                <SpecsTable specs={product.specs} />
                            </Expandable>
                        ) : (
                            <p className="text-muted-foreground mt-3 text-sm">Coming soon</p>
                        )}
                    </div>
                    <aside>
                        <h2 className="text-base font-semibold">What&rsquo;s in the box</h2>
                        {/* Placeholder — no "what's in the box" column in the schema */}
                        <p className="border-border bg-card text-muted-foreground mt-3 rounded-sm border p-3 text-sm">
                            Coming soon
                        </p>
                    </aside>
                </section>

                <section className="py-6">
                    <h2 className="text-base font-semibold">Similar products</h2>
                    {/* Placeholder — no similar-products endpoint yet */}
                    <p className="text-muted-foreground mt-3 text-sm">Coming soon</p>
                </section>
            </div>

            <Footer />
        </>
    );
}
