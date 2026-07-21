import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api/errors";

vi.mock("@/lib/auth/require-auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/api/shops", () => ({ openShop: vi.fn() }));
vi.mock("next/navigation", () => ({
    redirect: vi.fn(() => {
        throw new Error("REDIRECT");
    }),
}));

import { openShopAction } from "./actions";
import { openShop } from "@/lib/api/shops";

function fd(obj: Record<string, string>) {
    const f = new FormData();
    for (const [k, v] of Object.entries(obj)) f.set(k, v);
    return f;
}
const good = {
    name: "River Tech",
    slug: "river_tech",
    description: "Genuine electronics.",
    categoryId: "clxreal000cuidvalue00",
    businessType: "REGISTERED",
    email: "s@r.co",
    phone: "+254712345678",
    street: "Moi Ave",
    city: "Nairobi",
};

beforeEach(() => vi.clearAllMocks());

describe("openShopAction", () => {
    it("returns fieldErrors on invalid input", async () => {
        const s = await openShopAction(null, fd({ ...good, slug: "river-tech" }));
        expect(s?.fieldErrors?.slug).toBeTruthy();
        expect(openShop).not.toHaveBeenCalled();
    });
    it("maps ApiError to formError", async () => {
        vi.mocked(openShop).mockRejectedValue(
            new ApiError({ statusCode: 409, code: "CONFLICT", messages: ["Slug taken"] }),
        );
        const s = await openShopAction(null, fd(good));
        expect(s?.formError).toBe("Slug taken");
    });
    it("redirects on success", async () => {
        vi.mocked(openShop).mockResolvedValue({
            success: true,
            shop: { id: "x", name: "R", slug: "river_tech" },
        } as never);
        await expect(openShopAction(null, fd(good))).rejects.toThrow("REDIRECT");
    });
});
