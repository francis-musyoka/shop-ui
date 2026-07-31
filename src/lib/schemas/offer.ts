import { z } from "zod";
import { CUID } from "./common";

export const CONDITIONS = ["NEW", "USED", "REFURBISHED"] as const;
export const OFFER_STATUSES = ["ACTIVE", "INACTIVE", "OUT_OF_STOCK", "SUSPENDED"] as const;

// FormData always sends "" for an untouched optional field (never omits the key), and
// z.coerce.number() turns "" into 0 rather than NaN — which would trip deliveryDays'
// `.min(1)` even though the field was never meant to carry a value. Preprocessing blank
// strings to undefined first makes "untouched" read as "omitted", not "zero".
const emptyToUndefined = (val: unknown) => (val === "" ? undefined : val);
const optionalDeliveryDays = z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(1).optional(),
);
const optionalWarrantyMonths = z.preprocess(
    emptyToUndefined,
    z.coerce.number().int().min(0).optional(),
);

const MoneySchema = z.object({
    finalPrice: z.number().nonnegative(),
    originalPrice: z.number().nonnegative().nullable(),
    discountPercent: z.number().min(0).max(100).nullable(),
});

// One row from GET /api/shops/my-shop/offers (G1). variantLabel is composed CLIENT-SIDE
// from attributes + colorHex (see composeVariantLabel), never sent by the backend.
export const SellerListingSchema = z.object({
    id: CUID,
    product: z.object({ id: CUID, title: z.string(), slug: z.string() }),
    variant: z.object({
        id: CUID,
        attributes: z.record(z.string(), z.string()),
        colorHex: z.string().nullish(),
        mainImageUrl: z.string().nullish(),
    }),
    category: z.object({ id: CUID, name: z.string() }),
    price: MoneySchema,
    quantityTotal: z.number().int().nonnegative(),
    quantityReserved: z.number().int().nonnegative(),
    quantityAvailable: z.number().int().nonnegative(),
    condition: z.enum(CONDITIONS),
    status: z.enum(OFFER_STATUSES),
    conditionNotes: z.string().nullish(),
    deliveryDays: z.number().int().nullish(),
    warrantyMonths: z.number().int().nullish(),
    createdAt: z.string(),
});
export type SellerListing = z.infer<typeof SellerListingSchema>;

export const OfferSummarySchema = z.object({
    activeListings: z.number().int(),
    totalListings: z.number().int(),
    lowStock: z.number().int(),
    outOfStock: z.number().int(),
    suspended: z.number().int(),
});

export const MyOffersResponseSchema = z.object({
    success: z.literal(true),
    data: z.array(SellerListingSchema),
    pagination: z.object({
        page: z.number().int(),
        limit: z.number().int(),
        total: z.number().int(),
        totalPages: z.number().int(),
    }),
    summary: OfferSummarySchema,
});

// Add-listing submit (POST /api/products/offers). conditionNotes required when USED.
export const OfferCreateSchema = z
    .object({
        variantId: CUID,
        condition: z.enum(CONDITIONS),
        price: z.coerce.number().positive("Price must be positive"),
        quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
        discount: z.coerce.number().min(0).max(100).default(0),
        deliveryDays: optionalDeliveryDays,
        warrantyMonths: optionalWarrantyMonths,
        conditionNotes: z.string().trim().max(1000).optional(),
    })
    .refine((d) => d.condition !== "USED" || (d.conditionNotes?.trim().length ?? 0) > 0, {
        message: "Condition notes are required for used items",
        path: ["conditionNotes"],
    });

// Edit dialog (PATCH /api/products/offers/:id) — no variantId/condition (identity).
export const OfferEditSchema = z.object({
    quantity: z.coerce.number().int().positive("Quantity must be at least 1"),
    deliveryDays: optionalDeliveryDays,
    warrantyMonths: optionalWarrantyMonths,
    conditionNotes: z.string().trim().max(1000).optional(),
});

export const SetPriceSchema = z.object({
    price: z.coerce.number().positive("Price must be positive"),
    discount: z.coerce.number().min(0).max(100).default(0),
});

export const OfferStatusSchema = z.object({ status: z.enum(["ACTIVE", "INACTIVE"]) });

// Variant search (G2).
export const VariantSearchResultSchema = z.object({
    variantId: CUID,
    productId: CUID,
    productSlug: z.string(),
    productTitle: z.string(),
    attributes: z.record(z.string(), z.string()),
    colorHex: z.string().nullish(),
    mainImageUrl: z.string().nullish(),
    category: z.object({ id: CUID, name: z.string() }),
    brand: z.object({ id: CUID, name: z.string() }).nullable(),
    alreadyListed: z.boolean(),
    listedConditions: z.array(z.enum(CONDITIONS)),
});
export type VariantSearchResult = z.infer<typeof VariantSearchResultSchema>;

export const VariantSearchResponseSchema = z.object({
    success: z.literal(true),
    data: z.array(VariantSearchResultSchema),
    pagination: z.object({
        page: z.number().int(),
        limit: z.number().int(),
        total: z.number().int(),
        totalPages: z.number().int(),
    }),
});
