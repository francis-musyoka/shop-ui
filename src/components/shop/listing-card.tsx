import Image from "next/image";
import Link from "next/link";
import type { ProductCard } from "@/lib/schemas/product";

interface ListingCardProps {
    product: ProductCard;
}

function formatPrice(amount: number): string {
    return `KSh ${amount.toLocaleString("en-KE")}`;
}

export function ListingCard({ product }: ListingCardProps) {
    const { buybox, variantCount, mainImageUrl } = product;
    const hasMultipleVariants = variantCount > 1;
    const discountPct =
        buybox.discountPercent != null && buybox.discountPercent > 0
            ? Math.round(buybox.discountPercent)
            : null;
    const isLowStock = buybox.stock > 0 && buybox.stock <= 10;

    return (
        <Link
            href={`/products/${product.slug}`}
            className="border-border bg-card hover:border-foreground/30 flex flex-col overflow-hidden rounded-sm border transition-[border-color] duration-150 ease-out"
        >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-white">
                <Image
                    src={mainImageUrl}
                    alt={product.title}
                    fill
                    unoptimized
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                    className="object-contain p-3"
                />

                {/* Discount badge */}
                {discountPct != null && (
                    <span className="bg-accent text-accent-foreground absolute top-2 left-2 rounded-sm px-1.5 py-0.5 text-[11px] font-semibold">
                        -{discountPct}%
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="bg-background border-border flex flex-1 flex-col gap-1 border-t px-2.5 py-2.5">
                {/* Title */}
                <h3 className="text-foreground line-clamp-4 text-base leading-snug font-medium">
                    {product.title}
                </h3>

                {/* Price row */}
                <div className="mt-0.5 flex items-baseline gap-1.5">
                    {hasMultipleVariants && (
                        <span className="text-muted-foreground text-xs">From</span>
                    )}
                    <span className="text-brand-800 dark:text-gold-300 font-mono text-lg font-semibold">
                        {formatPrice(buybox.price)}
                    </span>
                    {buybox.originalPrice != null && buybox.originalPrice > buybox.price && (
                        <span className="text-muted-foreground font-mono text-sm line-through">
                            {formatPrice(buybox.originalPrice)}
                        </span>
                    )}
                </div>

                {/* Low-stock nudge */}
                {isLowStock && (
                    <p className="text-gold-500 dark:text-gold-300 text-sm font-semibold">
                        Only {buybox.stock} left in stock — order soon
                    </p>
                )}
            </div>
        </Link>
    );
}
