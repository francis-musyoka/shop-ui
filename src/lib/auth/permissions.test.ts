import { describe, it, expect } from "vitest";
import type { Customer } from "@/lib/schemas/customer";
import { Permission, hasPermission } from "./permissions";

function user(permissions: string[]): Customer {
    return {
        id: "usr1aaaaaaaaaaaaaaaaaaaa",
        email: "buyer@example.com",
        firstName: "Eric",
        lastName: "Musyoka",
        userRole: { id: "rol1aaaaaaaaaaaaaaaaaaaa", name: "CUSTOMER", permissions },
    };
}

describe("hasPermission", () => {
    it("is true when the role carries the permission", () => {
        expect(
            hasPermission(user([Permission.CONVERSATION_VIEW]), Permission.CONVERSATION_VIEW),
        ).toBe(true);
    });

    it("is false for a signed-out viewer", () => {
        expect(hasPermission(null, Permission.CONVERSATION_VIEW)).toBe(false);
    });

    it("checks view and send independently", () => {
        const viewOnly = user([Permission.CONVERSATION_VIEW]);
        expect(hasPermission(viewOnly, Permission.CONVERSATION_VIEW)).toBe(true);
        expect(hasPermission(viewOnly, Permission.CONVERSATION_SEND_MESSAGE)).toBe(false);
    });

    it("is false when the role has an empty permission list", () => {
        expect(hasPermission(user([]), Permission.CONVERSATION_CREATE)).toBe(false);
    });
});
