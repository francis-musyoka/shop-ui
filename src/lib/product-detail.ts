import type { ProductDetail, Offer } from "@/lib/schemas/product";

export type DetailVariant = ProductDetail["variants"][number];

export type DerivedBuybox = {
    price: number;
    originalPrice: number | null;
    discountPercent: number | null;
    condition: Offer["condition"];
    stock: number;
    offer: Offer;
} | null;

/**
 * The backend flags the buy-box winner per variant (`isBuyBoxWinner`) — trust it
 * when present. Fallback when none is flagged: in-stock offers first (the backend
 * omits `status`, so a missing status is treated as sellable), then featured,
 * then cheapest, then most stock.
 */
export function selectBestOffer(offers: Offer[]): Offer | null {
    if (offers.length === 0) return null;
    const winner = offers.find((o) => o.isBuyBoxWinner);
    if (winner) return winner;
    const sellable = offers.filter(
        (o) => o.quantityAvailable > 0 && (o.status == null || o.status === "ACTIVE"),
    );
    const pool = sellable.length > 0 ? sellable : offers;
    return [...pool].sort(
        (a, b) =>
            Number(b.isFeatured) - Number(a.isFeatured) ||
            a.finalPrice - b.finalPrice ||
            b.quantityAvailable - a.quantityAvailable,
    )[0]!;
}

export function deriveBuybox(variant: DetailVariant | undefined): DerivedBuybox {
    const offers = variant?.offers ?? [];
    const best = selectBestOffer(offers);
    if (!best) return null;
    const discounted = best.discount > 0 && best.finalPrice < best.price;
    return {
        price: best.finalPrice,
        originalPrice: discounted ? best.price : null,
        discountPercent: discounted ? Math.round((1 - best.finalPrice / best.price) * 100) : null,
        condition: best.condition,
        stock: best.quantityAvailable,
        offer: best,
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
