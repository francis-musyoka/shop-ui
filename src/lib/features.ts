/**
 * Feature flags for functionality that is UI-complete but depends on
 * unshipped backend work. Flip to `true` when both halves are ready.
 *
 * Source of truth for the gap register in the spec (§11) and the backend
 * TODO file at `online-shop-backend/TODO.md`.
 */
export const FEATURES = {
  /** Product reviews + star ratings. Backend: Review model commented out. */
  reviews: false,
  /** Customer wishlist. Backend: WishlistItem model commented out. */
  wishlist: false,
  /** Customer ↔ seller messaging. Backend: Conversation/Message commented out. */
  messaging: false,
  /** Personalized recommendations. Backend: no endpoints. */
  recommendations: false,
  /** "Recently viewed" strip (client-side history). Backend: N/A; design pending. */
  recentlyViewed: false,
  /** Product Q&A. Backend: no model. */
  questionsAnswers: false,
  /** Aggregate rating on Product (distinct from Shop.rating). Backend: no field. */
  productRating: false,
  /** Sort control on product search. Backend: no `sort` param. */
  productSort: false,
} as const;

export type FeatureFlag = keyof typeof FEATURES;
