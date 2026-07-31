import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api/errors";

vi.mock("@/lib/auth/require-auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/api/shops", () => ({
    getMyShop: vi.fn(),
    updateShop: vi.fn(),
    closeShop: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));
vi.mock("next/navigation", () => ({
    redirect: vi.fn(() => {
        throw new Error("REDIRECT");
    }),
}));

import { updateShopAction, closeShopAction } from "./actions";
import { getMyShop, updateShop, closeShop } from "@/lib/api/shops";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

function fd(obj: Record<string, string>) {
    const f = new FormData();
    for (const [k, v] of Object.entries(obj)) f.set(k, v);
    return f;
}

const good = {
    name: "River Tech",
    slug: "river_tech",
    description: "Genuine electronics.",
    businessType: "REGISTERED",
    email: "s@r.co",
    phone: "+254712345678",
    street: "Moi Ave",
    city: "Nairobi",
};

beforeEach(() => vi.clearAllMocks());

describe("updateShopAction", () => {
    it("returns fieldErrors on invalid slug", async () => {
        const s = await updateShopAction(null, fd({ ...good, slug: "river-tech" }));
        expect(s?.fieldErrors?.slug).toBeTruthy();
        expect(getMyShop).not.toHaveBeenCalled();
        expect(updateShop).not.toHaveBeenCalled();
    });

    it("calls updateShop with the shop id and returns success", async () => {
        vi.mocked(getMyShop).mockResolvedValue({ id: "shop123" } as never);
        vi.mocked(updateShop).mockResolvedValue({
            success: true,
            shop: { id: "shop123", name: "River Tech", slug: "river_tech" },
        } as never);

        const s = await updateShopAction(null, fd(good));

        expect(updateShop).toHaveBeenCalledWith(
            "shop123",
            expect.objectContaining({ name: "River Tech" }),
        );
        expect(revalidatePath).toHaveBeenCalledWith("/seller/dashboard/settings");
        expect(s).toEqual({ success: true });
    });

    it("maps ApiError to formError", async () => {
        vi.mocked(getMyShop).mockResolvedValue({ id: "shop123" } as never);
        vi.mocked(updateShop).mockRejectedValue(
            new ApiError({ statusCode: 409, code: "CONFLICT", messages: ["Slug taken"] }),
        );

        const s = await updateShopAction(null, fd(good));

        expect(s?.formError).toBe("Slug taken");
    });
});

describe("closeShopAction", () => {
    it("closes the shop and redirects home", async () => {
        vi.mocked(closeShop).mockResolvedValue({ success: true } as never);

        await expect(closeShopAction()).rejects.toThrow("REDIRECT");

        expect(closeShop).toHaveBeenCalled();
        expect(redirect).toHaveBeenCalledWith("/");
    });

    it("still redirects even if closeShop throws", async () => {
        vi.mocked(closeShop).mockRejectedValue(new Error("boom"));

        await expect(closeShopAction()).rejects.toThrow("REDIRECT");

        expect(redirect).toHaveBeenCalledWith("/");
    });
});
