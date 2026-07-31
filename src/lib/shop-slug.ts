export const SHOP_SLUG_REGEX = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

export function slugify(name: string): string {
    return name
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, "_")
        .replace(/^_+|_+$/g, "");
}
export function isValidShopSlug(slug: string): boolean {
    return slug.length >= 2 && SHOP_SLUG_REGEX.test(slug);
}
// Compose a one-line variant label from raw attributes (+ colorHex ignored for text).
// Deterministic order: sort keys so jsonb reordering can't scramble the label.
export function composeVariantLabel(attributes: Record<string, string>): string {
    return Object.keys(attributes)
        .sort()
        .map((k) => attributes[k])
        .join(" · ");
}
