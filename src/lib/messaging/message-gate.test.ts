import { describe, it, expect, vi } from "vitest";
import type { Customer } from "@/lib/schemas/customer";
import { Permission } from "@/lib/auth/permissions";
import { messageSellerGate } from "./message-gate";

const features = vi.hoisted(() => ({ messaging: true }));
vi.mock("@/lib/features", () => ({ FEATURES: features }));

const ALL = [Permission.CONVERSATION_CREATE, Permission.CONVERSATION_SEND_MESSAGE];

function user(permissions: string[] = ALL): Customer {
    return {
        id: "usr1aaaaaaaaaaaaaaaaaaaa",
        email: "buyer@example.com",
        firstName: "Eric",
        lastName: "Musyoka",
        userRole: { id: "rol1aaaaaaaaaaaaaaaaaaaa", name: "CUSTOMER", permissions },
    };
}

const SHOP = "shp1aaaaaaaaaaaaaaaaaaaa";
const OTHER = "shp2bbbbbbbbbbbbbbbbbbbb";

describe("messageSellerGate", () => {
    it("blocks everyone while the messaging feature is off", () => {
        features.messaging = false;
        try {
            const gate = messageSellerGate({ user: user(), shopId: SHOP, viewerShopId: null });
            expect(gate).toEqual({ allowed: false, reason: "feature-off" });
        } finally {
            features.messaging = true;
        }
    });

    it("allows a signed-in buyer with permission", () => {
        const gate = messageSellerGate({ user: user(), shopId: SHOP, viewerShopId: null });
        expect(gate).toEqual({ allowed: true });
    });

    it("blocks a signed-out viewer", () => {
        const gate = messageSellerGate({ user: null, shopId: SHOP, viewerShopId: null });
        expect(gate).toEqual({ allowed: false, reason: "signed-out" });
    });

    it("blocks a seller messaging their own shop", () => {
        const gate = messageSellerGate({ user: user(), shopId: SHOP, viewerShopId: SHOP });
        expect(gate).toEqual({ allowed: false, reason: "own-shop" });
    });

    it("allows a seller to message a different shop", () => {
        const gate = messageSellerGate({ user: user(), shopId: OTHER, viewerShopId: SHOP });
        expect(gate).toEqual({ allowed: true });
    });

    it("blocks a role without conversation:create", () => {
        const gate = messageSellerGate({
            user: user([Permission.CONVERSATION_SEND_MESSAGE]),
            shopId: SHOP,
            viewerShopId: null,
        });
        expect(gate).toEqual({ allowed: false, reason: "no-permission" });
    });

    it("reports own-shop before permission, so the clearer reason wins", () => {
        const gate = messageSellerGate({ user: user([]), shopId: SHOP, viewerShopId: SHOP });
        expect(gate).toEqual({ allowed: false, reason: "own-shop" });
    });
});
