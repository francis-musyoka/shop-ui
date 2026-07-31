import { cn } from "@/lib/utils";
import { Clock, Ban, Lock } from "lucide-react";
import type { MyShop } from "@/lib/schemas/seller-shop";

// Shop-status notice shown across the dashboard when the shop isn't ACTIVE. Product
// management (listing / editing / pricing) is gated to ACTIVE shops — see
// canManageListings — while shop settings stay editable in every state. Copy differs
// by status; the gate is the same.
const SHOP_NOTICE_CONFIG = {
    PENDING: {
        icon: Clock,
        tone: "border-gold-200 bg-gold-100/50 text-gold-600 dark:border-gold-200/20 dark:bg-gold-200/10",
        title: "Your shop is under review",
        body: "You'll be able to add and manage listings once your shop is approved. You can still update your shop settings.",
    },
    SUSPENDED: {
        icon: Ban,
        tone: "border-destructive/30 bg-destructive/5 text-destructive",
        title: "Your shop is suspended",
        body: "Your listings are hidden and you can't add or edit them. You can still update your shop settings — contact support to resolve this.",
    },
    CLOSED: {
        icon: Lock,
        tone: "border-border bg-muted text-muted-foreground",
        title: "Your shop is closed",
        body: "Your listings have been removed from the marketplace. You can still update your shop settings.",
    },
    DRAFT: {
        icon: Lock,
        tone: "border-border bg-muted text-muted-foreground",
        title: "Your shop isn't submitted yet",
        body: "Submit your shop for review to start adding listings. You can still update your shop settings.",
    },
} as const;

export function ShopStatusNotice({ status }: { status: MyShop["status"] }) {
    if (status === "ACTIVE") return null;
    const c = SHOP_NOTICE_CONFIG[status];
    const Icon = c.icon;
    return (
        <div className={cn("flex items-start gap-2.5 rounded-sm border px-4 py-3", c.tone)}>
            <Icon className="mt-0.5 shrink-0" size={16} />
            <div className="text-sm">
                <p className="font-medium">{c.title}</p>
                <p className="opacity-90">{c.body}</p>
            </div>
        </div>
    );
}
