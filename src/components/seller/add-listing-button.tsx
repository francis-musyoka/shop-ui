import Link from "next/link";
import { Plus } from "lucide-react";
import { Button, buttonVariants } from "@/components/ui/button";
import { cn } from "@/lib/utils";

// "Add a listing" CTA, gated on whether the shop can manage listings. When it can't
// (non-ACTIVE shop) it renders as a disabled button instead of a live link, so the
// action reads as unavailable rather than missing.
export function AddListingButton({
    canManage,
    label = "Add a listing",
    size = "sm",
    className,
}: {
    canManage: boolean;
    label?: string;
    size?: "sm" | "default";
    className?: string;
}) {
    const iconSize = size === "sm" ? 14 : 16;
    if (!canManage) {
        return (
            <Button variant="accent" size={size} disabled className={className}>
                <Plus size={iconSize} />
                {label}
            </Button>
        );
    }
    return (
        <Link
            href="/seller/dashboard/listings/new"
            className={cn(buttonVariants({ variant: "accent", size }), className)}
        >
            <Plus size={iconSize} />
            {label}
        </Link>
    );
}
