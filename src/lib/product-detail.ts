import type { ProductDetail, BuyBoxOffer } from "@/lib/schemas/product";

export type DetailVariant = ProductDetail["variants"][number];

export type DerivedBuybox = {
    price: number;
    originalPrice: number | null;
    discountPercent: number | null;
    condition: BuyBoxOffer["condition"];
    stock: number;
    offer: BuyBoxOffer;
} | null;

/**
 * The backend now picks the buy-box winner per variant and returns it as
 * `variant.buyBox` (null when the variant has no eligible offer). No more
 * client-side ranking — we just map the winner to the display block.
 */
export function deriveBuybox(variant: DetailVariant | undefined): DerivedBuybox {
    const box = variant?.buyBox;
    if (!box) return null;
    return {
        price: box.finalPrice,
        originalPrice: box.originalPrice,
        discountPercent: box.discountPercent,
        condition: box.condition,
        stock: box.quantityAvailable,
        offer: box,
    };
}

export function galleryImageUrls(
    product: ProductDetail,
    variant: DetailVariant | undefined,
): string[] {
    const source = variant?.images?.length ? variant.images : product.images;
    return [...source].sort((a, b) => a.order - b.order).map((img) => img.url);
}

/** First variant whose attributes contain every selected key/value pair. */
export function findVariant(
    variants: DetailVariant[],
    attrs: Record<string, string>,
): DetailVariant | undefined {
    return variants.find((v) => Object.entries(attrs).every(([k, val]) => v.attributes[k] === val));
}
