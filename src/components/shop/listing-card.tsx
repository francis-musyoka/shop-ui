import Image from "next/image";
import Link from "next/link";
import type { ProductCard } from "@/lib/schemas/product";

interface ListingCardProps {
    product: ProductCard;
    /** Condition badge — will come from backend in the future. */
    condition?: "NEW" | "USED" | "REFURBISHED";
    /** Discount percentage (0-100). Shows gold badge on image when > 0. */
    discount?: number;
    /** Original price before discount. Shows strikethrough next to current price. */
    originalPrice?: number;
    /** Seller location, e.g. "Nairobi" */
    location?: string;
    /** Shop name, e.g. "TechHub" */
    shopName?: string;
}

/**
 * Format a number as KSh price string.
 * e.g. 145000 -> "KSh 145,000"
 */
function formatPrice(amount: number): string {
    return `KSh ${amount.toLocaleString("en-KE")}`;
}

const conditionStyles = {
    NEW: "bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-900/40 dark:text-brand-300 dark:border-brand-700",
    USED: "bg-gold-100 text-gold-500 border-gold-200 dark:bg-gold-300/10 dark:text-gold-300 dark:border-gold-300/30",
    REFURBISHED: "bg-muted text-muted-foreground border-border",
} as const;

const conditionLabels = {
    NEW: "New",
    USED: "Used",
    REFURBISHED: "Refurbished",
} as const;

export function ListingCard({
    product,
    condition,
    discount,
    originalPrice,
    location,
    shopName,
}: ListingCardProps) {
    const firstImage = product.images[0];
    const hasMultipleVariants = product.variants.length > 1;

    return (
        <Link
            href={`/products/${product.slug}`}
            className="border-border bg-card hover:border-foreground/30 flex flex-col overflow-hidden rounded-sm border transition-[border-color] duration-150 ease-out"
        >
            {/* Image */}
            <div className="relative aspect-square overflow-hidden bg-white">
                {firstImage ? (
                    <Image
                        src={firstImage.url}
                        alt={product.title}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 20vw"
                        className="object-contain p-3"
                    />
                ) : (
                    <div className="flex h-full items-center justify-center">
                        <span className="text-muted-foreground text-sm">No image</span>
                    </div>
                )}

                {/* Discount badge */}
                {discount != null && discount > 0 && (
                    <span className="bg-accent text-accent-foreground absolute top-2 left-2 rounded-sm px-1.5 py-0.5 text-[11px] font-semibold">
                        -{discount}%
                    </span>
                )}

                {/* Condition badge */}
                {condition && (
                    <span
                        className={`absolute bottom-2 left-2 rounded-sm border px-1.5 py-0.5 text-[11px] font-semibold ${conditionStyles[condition]}`}
                    >
                        {conditionLabels[condition]}
                    </span>
                )}
            </div>

            {/* Content */}
            <div className="bg-background border-border flex flex-1 flex-col gap-1 border-t px-2.5 py-2.5">
                {/* Title */}
                <h3 className="text-foreground line-clamp-2 text-base leading-snug font-medium">
                    {product.title}
                </h3>

                {/* Price row */}
                {product.lowestPrice !== null && (
                    <div className="mt-0.5 flex items-baseline gap-1.5">
                        {hasMultipleVariants && (
                            <span className="text-muted-foreground text-xs">From</span>
                        )}
                        <span className="text-brand-800 dark:text-gold-300 font-mono text-lg font-semibold">
                            {formatPrice(product.lowestPrice)}
                        </span>
                        {originalPrice != null && originalPrice > product.lowestPrice && (
                            <span className="text-muted-foreground font-mono text-xs line-through">
                                {formatPrice(originalPrice)}
                            </span>
                        )}
                    </div>
                )}

                {/* Location · Shop */}
                {(location || shopName) && (
                    <p className="text-brand-500 dark:text-brand-400 text-[0.8125rem]">
                        {[location, shopName].filter(Boolean).join(" · ")}
                    </p>
                )}

                {/* Brand · Category */}
                <div className="mt-auto flex items-center gap-1.5 pt-0.5">
                    <span className="text-brand-600 dark:text-brand-400 text-[0.8125rem] font-medium">
                        {product.brand.name}
                    </span>
                    <span className="text-muted-foreground text-[0.8125rem]">·</span>
                    <span className="text-muted-foreground text-[0.8125rem]">
                        {product.category.name}
                    </span>
                </div>
            </div>
        </Link>
    );
}
