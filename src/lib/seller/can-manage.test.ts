import { describe, it, expect } from "vitest";
import { canManageListings } from "./can-manage";
describe("canManageListings", () => {
    it("true only for ACTIVE", () => {
        expect(canManageListings("ACTIVE")).toBe(true);
        for (const s of ["DRAFT", "PENDING", "SUSPENDED", "CLOSED"] as const)
            expect(canManageListings(s)).toBe(false);
    });
});
