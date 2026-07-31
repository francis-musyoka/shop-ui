import { StatusBadge, type StatusConfig } from "./shop-status-badge";
import type { SellerListing } from "@/lib/schemas/offer";

type OfferStatus = SellerListing["status"];

// Colors mirror the backend's OfferStatus enum — a seller's own listing state, not
// the Product's moderation status. SUSPENDED gets the destructive color (a moderation
// action against the seller) and OUT_OF_STOCK gets gold (a normal, self-resolvable
// inventory state) — this also matches the "needs attention" banner, which uses
// destructive styling specifically for suspended listings.
export const OFFER_STATUS_CONFIG: StatusConfig<OfferStatus> = {
    ACTIVE: { label: "Active", className: "bg-success/15 text-success" },
    INACTIVE: { label: "Inactive", className: "bg-muted text-muted-foreground" },
    OUT_OF_STOCK: {
        label: "Out of stock",
        className: "bg-gold-100 text-gold-500 dark:bg-gold-200/15",
    },
    SUSPENDED: { label: "Suspended", className: "bg-destructive/10 text-destructive" },
};

export function OfferStatusBadge({ status }: { status: OfferStatus }) {
    return (
        <StatusBadge
            status={status}
            config={OFFER_STATUS_CONFIG}
            className="h-5 rounded-sm px-1.5 text-[11px]"
        />
    );
}
