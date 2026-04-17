import { z } from "zod";
import { CUID, PaginationSchema } from "./common";

/* ── Shared sub-schemas ─────────────────────────────────── */

export const ImageSchema = z.object({
    id: CUID,
    url: z.url(),
});

export const OrderedImageSchema = ImageSchema.extend({
    order: z.number().int().nonnegative(),
});

export const VariantSummarySchema = z.object({
    id: CUID,
    attributes: z.record(z.string(), z.string()),
    colorHex: z.string().nullish(),
});

export const BrandRefSchema = z.object({
    name: z.string(),
    slug: z.string(),
});

export const CategoryRefSchema = z.object({
    name: z.string(),
    slug: z.string(),
});

/* ── Product card (search results, landing grid) ─────── */

export const BuyboxSchema = z.object({
    price: z.number().nonnegative(),
    originalPrice: z.number().nonnegative().nullable(),
    discountPercent: z.number().min(0).max(100).nullable(),
    condition: z.enum(["NEW", "USED", "REFURBISHED"]),
    stock: z.number().int().nonnegative(),
});

export type Buybox = z.infer<typeof BuyboxSchema>;

export const ProductCardSchema = z.object({
    id: CUID,
    slug: z.string(),
    title: z.string(),
    mainImageUrl: z.url(),
    variantCount: z.number().int().nonnegative(),
    offerCount: z.number().int().nonnegative(),
    buybox: BuyboxSchema,
});

export type ProductCard = z.infer<typeof ProductCardSchema>;

/* ── Search products response ────────────────────────── */

export const SearchProductsResponseSchema = z.object({
    success: z.literal(true),
    data: z.array(ProductCardSchema),
    pagination: PaginationSchema,
});

export type SearchProductsResponse = z.infer<typeof SearchProductsResponseSchema>;

/* ── Search query params (for building query strings) ── */

export const SearchProductsParamsSchema = z.object({
    search: z.string().optional(),
    page: z.coerce.number().int().positive().optional(),
    limit: z.coerce.number().int().min(1).max(50).optional(),
    categoryId: z.string().optional(),
    brandId: z.string().optional(),
    minPrice: z.coerce.number().nonnegative().optional(),
    maxPrice: z.coerce.number().nonnegative().optional(),
    condition: z.enum(["NEW", "USED", "REFURBISHED"]).optional(),
});

export type SearchProductsParams = z.infer<typeof SearchProductsParamsSchema>;

/* ── Newest listings query params ────────────────────── */

export const NewestListingsParamsSchema = z.object({
    limit: z.coerce.number().int().min(1).max(50).optional(),
    perCategory: z.coerce.number().int().min(1).max(10).optional(),
});

export type NewestListingsParams = z.infer<typeof NewestListingsParamsSchema>;

/* ── Newest listings response ────────────────────────── */

// Backend powers a fixed-size carousel, not a paginated list, so no
// pagination envelope is returned — see online-shop-backend improvements.md §21.
export const NewestListingsResponseSchema = z.object({
    success: z.literal(true),
    data: z.array(ProductCardSchema),
});

export type NewestListingsResponse = z.infer<typeof NewestListingsResponseSchema>;

/* ── Offer (nested inside variant on detail page) ────── */

export const OfferShopRefSchema = z.object({
    id: CUID,
    name: z.string(),
    slug: z.string(),
    rating: z.coerce.number(),
});

export const OfferSchema = z.object({
    id: CUID,
    price: z.coerce.number(),
    discount: z.coerce.number(),
    quantityTotal: z.number().int().nonnegative(),
    quantityAvailable: z.number().int().nonnegative(),
    condition: z.enum(["NEW", "USED", "REFURBISHED"]),
    status: z.string(),
    deliveryDays: z.number().int().nonnegative().nullish(),
    warrantyMonths: z.number().int().nonnegative().nullish(),
    isFeatured: z.boolean(),
    location: z.string().nullish(),
    finalPrice: z.number(),
    shop: OfferShopRefSchema,
});

export type Offer = z.infer<typeof OfferSchema>;

/* ── Detail variant (with offers and images) ─────────── */

export const DetailVariantSchema = VariantSummarySchema.extend({
    images: z.array(OrderedImageSchema).optional(),
    offers: z.array(OfferSchema).optional(),
});

/* ── Category/Brand refs with ID (detail page) ───────── */

export const BrandRefWithIdSchema = BrandRefSchema.extend({ id: CUID });
export const CategoryRefWithIdSchema = CategoryRefSchema.extend({ id: CUID });

/* ── Product detail ──────────────────────────────────── */

export const ProductDetailSchema = z.object({
    id: CUID,
    title: z.string(),
    slug: z.string(),
    description: z.string().nullish(),
    specs: z.record(z.string(), z.string()).optional(),
    status: z.string(),
    createdAt: z.string(),
    category: CategoryRefWithIdSchema,
    brand: BrandRefWithIdSchema,
    images: z.array(OrderedImageSchema),
    variants: z.array(DetailVariantSchema),
});

export type ProductDetail = z.infer<typeof ProductDetailSchema>;

/* ── Detail response ─────────────────────────────────── */

export const ProductDetailResponseSchema = z.object({
    success: z.literal(true),
    product: ProductDetailSchema,
});

export type ProductDetailResponse = z.infer<typeof ProductDetailResponseSchema>;
