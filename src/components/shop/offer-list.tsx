import { MessageCircle } from "lucide-react";
import type { OfferSummary } from "@/lib/schemas/product";
import { Button } from "@/components/ui/button";
import { ConditionBadge } from "./condition-badge";
import { SellerCard } from "./seller-card";
import { FEATURES } from "@/lib/features";
import { formatPrice } from "@/lib/format";

export function OfferList({ offers }: { offers: OfferSummary[] }) {
    if (offers.length === 0) {
        return <p className="text-muted-foreground text-sm">No offers for this option yet.</p>;
    }

    return (
        <ul className="divide-border divide-y">
            {offers.map((offer) => (
                <li
                    key={offer.id}
                    className="flex flex-wrap items-center justify-between gap-3 py-3"
                >
                    <div className="min-w-0">
                        <SellerCard shop={offer.shop} />
                        <div className="text-muted-foreground mt-3 flex items-center gap-2 text-xs">
                            <ConditionBadge condition={offer.condition} />
                            {/* {offer.deliveryDays != null && (
                                <span>Delivery ~{offer.deliveryDays} days</span>
                            )} */}
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-brand-800 dark:text-gold-300 font-mono text-base font-semibold">
                            {formatPrice(offer.finalPrice)}
                        </span>
                        <Button
                            variant="accent"
                            size="sm"
                            disabled={!FEATURES.messaging}
                            title={FEATURES.messaging ? undefined : "Messaging coming soon"}
                        >
                            <MessageCircle size={14} /> Message seller
                        </Button>
                    </div>
                </li>
            ))}
        </ul>
    );
}
