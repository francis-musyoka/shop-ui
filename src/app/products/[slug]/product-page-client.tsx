"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { MessageCircle, Heart, Share2, ChevronRight, X } from "lucide-react";
import type { ProductDetail } from "@/lib/schemas/product";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ProductGallery } from "@/components/shop/product-gallery";
import { VariantSelector } from "@/components/shop/variant-selector";
import { ConditionBadge } from "@/components/shop/condition-badge";
import { OfferList } from "@/components/shop/offer-list";
import { deriveBuybox, findVariant, galleryImageUrls } from "@/lib/product-detail";
import { useModalA11y } from "@/lib/use-modal-a11y";
import { FEATURES } from "@/lib/features";

function formatPrice(amount: number): string {
    return `KSh ${amount.toLocaleString("en-KE")}`;
}

export function ProductPageClient({ product }: { product: ProductDetail }) {
    const [selectedAttrs, setSelectedAttrs] = useState<Record<string, string>>(
        () => product.variants[0]?.attributes ?? {},
    );

    const variant = useMemo(
        () => findVariant(product.variants, selectedAttrs) ?? product.variants[0],
        [product.variants, selectedAttrs],
    );
    const buybox = useMemo(() => deriveBuybox(variant), [variant]);
    const images = useMemo(() => galleryImageUrls(product, variant), [product, variant]);
    const offers = variant?.offers ?? [];

    const [offersOpen, setOffersOpen] = useState(false);
    const offersRef = useModalA11y(offersOpen);
    useEffect(() => {
        if (!offersOpen) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setOffersOpen(false);
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [offersOpen]);

    return (
        <>
            <section className="grid grid-cols-1 gap-6 pb-6 md:grid-cols-12">
                <div className="md:col-span-5">
                    <ProductGallery images={images} title={product.title} />
                </div>

                <div className="md:col-span-4">
                    <div className="flex items-center justify-between">
                        <Link
                            href={`/brands/${product.brand.slug}`}
                            className="text-brand-600 dark:text-brand-400 text-sm font-medium hover:underline"
                        >
                            {product.brand.name} &rsaquo;
                        </Link>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon-sm"
                                aria-label="Save for later"
                                disabled={!FEATURES.wishlist}
                                title={FEATURES.wishlist ? undefined : "Wishlist coming soon"}
                            >
                                <Heart size={14} />
                            </Button>
                            <Button variant="ghost" size="icon-sm" aria-label="Share">
                                <Share2 size={14} />
                            </Button>
                        </div>
                    </div>

                    <h1 className="mt-1 text-base leading-snug font-semibold md:text-[1.0625rem]">
                        {product.title}
                    </h1>

                    <Separator className="my-3" />

                    {buybox ? (
                        <>
                            <div className="flex items-baseline gap-2">
                                <span className="text-brand-800 dark:text-gold-300 font-mono text-2xl font-semibold">
                                    {formatPrice(buybox.price)}
                                </span>
                                {buybox.originalPrice != null && (
                                    <span className="text-muted-foreground font-mono text-sm line-through">
                                        {formatPrice(buybox.originalPrice)}
                                    </span>
                                )}
                                {buybox.discountPercent != null && (
                                    <Badge className="bg-accent text-accent-foreground border-0">
                                        Save {buybox.discountPercent}%
                                    </Badge>
                                )}
                            </div>
                            {buybox.stock === 0 && (
                                <p className="text-destructive mt-1 text-sm font-semibold">
                                    Out of stock
                                </p>
                            )}
                            {buybox.stock > 0 && buybox.stock <= 10 && (
                                <p className="text-gold-500 dark:text-gold-300 mt-1 text-sm font-semibold">
                                    Only {buybox.stock} left in stock — order soon
                                </p>
                            )}
                            <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                                <span className="text-muted-foreground">
                                    Sold by: {"  "}
                                    <Link
                                        href={`/shops/${buybox.offer.shop.slug}`}
                                        className="text-brand-600 dark:text-brand-400 font-medium hover:underline"
                                    >
                                        {buybox.offer.shop.name}
                                    </Link>
                                </span>
                                <ConditionBadge condition={buybox.condition} />
                            </div>
                        </>
                    ) : (
                        <p className="text-muted-foreground text-sm">Currently unavailable</p>
                    )}

                    <Separator className="my-3" />

                    <VariantSelector
                        variants={product.variants}
                        selected={selectedAttrs}
                        onChange={setSelectedAttrs}
                    />

                    <div className="mt-4 flex flex-col gap-2">
                        <Button
                            variant="accent"
                            size="lg"
                            className="w-full"
                            disabled={!FEATURES.messaging}
                            title={FEATURES.messaging ? undefined : "Messaging coming soon"}
                        >
                            <MessageCircle /> Message Seller
                        </Button>
                        <Button
                            variant="outline"
                            size="lg"
                            className="w-full"
                            disabled
                            title="Offers coming soon"
                        >
                            Make an offer
                        </Button>
                    </div>

                    {/* About this item — placeholder until backend exposes Product.features */}
                    <div className="mt-5">
                        <h2 className="text-sm font-semibold">About this item</h2>
                        <ul className="text-muted-foreground mt-2 space-y-1 text-sm">
                            <li className="flex gap-2">
                                <span className="text-brand-600 dark:text-brand-400 shrink-0">
                                    •
                                </span>
                                <span>Coming soon</span>
                            </li>
                        </ul>
                    </div>
                </div>

                {/* Available offers */}
                <aside className="md:col-span-3">
                    {offers.length > 0 && (
                        <div className="border-border bg-card rounded-sm border">
                            <h2 className="border-border border-b px-4 py-3 text-sm font-semibold">
                                Available offers
                            </h2>
                            <button
                                type="button"
                                onClick={() => setOffersOpen(true)}
                                className="text-foreground hover:bg-muted flex w-full items-center justify-between gap-2 px-4 py-3 text-left text-sm transition-colors duration-100"
                            >
                                <span>
                                    {offers.length} {offers.length === 1 ? "seller" : "sellers"}{" "}
                                    offering this product
                                </span>
                                <ChevronRight
                                    size={16}
                                    className="text-muted-foreground shrink-0"
                                />
                            </button>
                        </div>
                    )}
                </aside>
            </section>

            {/* Available offers drawer — slides in from the right */}
            {offersOpen && (
                <div
                    ref={offersRef}
                    className="fixed inset-0 z-50 flex outline-none"
                    role="dialog"
                    aria-modal="true"
                    aria-label="Available offers"
                    tabIndex={-1}
                >
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={() => setOffersOpen(false)}
                        aria-hidden="true"
                    />
                    <div className="bg-card relative z-10 ml-auto flex h-full w-full max-w-md flex-col shadow-lg">
                        <div className="border-border flex items-center justify-between border-b px-4 py-3">
                            <span className="text-base font-semibold">Available offers</span>
                            <button
                                type="button"
                                onClick={() => setOffersOpen(false)}
                                className="text-muted-foreground hover:text-foreground rounded-sm p-1"
                                aria-label="Close offers"
                            >
                                <X className="size-5" />
                            </button>
                        </div>
                        <div className="flex-1 overflow-y-auto px-4 py-2">
                            <OfferList offers={offers} />
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
