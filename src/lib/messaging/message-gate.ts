import type { Customer } from "@/lib/schemas/customer";
import { Permission, hasPermission } from "@/lib/auth/permissions";
import { FEATURES } from "@/lib/features";

export type MessageGateReason = "feature-off" | "signed-out" | "own-shop" | "no-permission";

export type MessageGate = { allowed: true } | { allowed: false; reason: MessageGateReason };

/**
 * Decides whether to offer a "Message Seller" control, and if not, why — so the
 * call site can render the right thing (a sign-in link, a muted "your listing"
 * note, or a disabled button) instead of one generic disabled state.
 *
 * `viewerShopId` is the viewer's own shop id, or null when they don't own one.
 * The own-shop check needs no ownerId on the offer: comparing the viewer's shop
 * against the offer's shop is equivalent, and the backend 422s the same case.
 *
 * Order matters — own-shop is reported before no-permission because it is the
 * more actionable message when both are true.
 */
export function messageSellerGate(input: {
    user: Customer | null;
    shopId: string;
    viewerShopId: string | null;
}): MessageGate {
    if (!FEATURES.messaging) return { allowed: false, reason: "feature-off" };
    if (!input.user) return { allowed: false, reason: "signed-out" };
    if (input.viewerShopId !== null && input.viewerShopId === input.shopId) {
        return { allowed: false, reason: "own-shop" };
    }
    if (!hasPermission(input.user, Permission.CONVERSATION_CREATE)) {
        return { allowed: false, reason: "no-permission" };
    }
    return { allowed: true };
}
