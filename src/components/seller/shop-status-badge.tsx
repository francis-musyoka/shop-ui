import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { CheckCircle2 } from "lucide-react";
import type { MyShop } from "@/lib/schemas/seller-shop";

export type StatusConfig<T extends string> = Record<T, { label: string; className: string }>;

// Generic status-to-color renderer — each status domain (shop, offer, ...) supplies
// its own label/color config; shape (pill vs sharp, size) is passed via className.
export function StatusBadge<T extends string>({
    status,
    config,
    className,
}: {
    status: T;
    config: StatusConfig<T>;
    className?: string;
}) {
    const s = config[status];
    return (
        <span className={cn("inline-flex items-center font-semibold", s.className, className)}>
            {s.label}
        </span>
    );
}

const SHOP_STATUS_CONFIG: StatusConfig<MyShop["status"]> = {
    DRAFT: { label: "Draft", className: "bg-muted text-muted-foreground" },
    ACTIVE: { label: "Active", className: "bg-success/15 text-success" },
    PENDING: {
        label: "Pending review",
        className: "bg-gold-100 text-gold-500 dark:bg-gold-200/15",
    },
    SUSPENDED: { label: "Suspended", className: "bg-destructive/10 text-destructive" },
    CLOSED: { label: "Closed", className: "bg-muted text-muted-foreground" },
};

export function ShopStatusBadge({ status }: { status: MyShop["status"] }) {
    return (
        <StatusBadge
            status={status}
            config={SHOP_STATUS_CONFIG}
            className="h-5 rounded-full px-2 text-xs"
        />
    );
}

export function VerifiedBadge() {
    return (
        <Badge className="bg-brand-600 gap-1 text-white">
            <CheckCircle2 />
            Verified
        </Badge>
    );
}
