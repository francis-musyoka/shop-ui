import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api/errors";

vi.mock("@/lib/auth/require-auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/api/offers", () => ({ createOffer: vi.fn() }));
vi.mock("next/navigation", () => ({
    redirect: vi.fn(() => {
        throw new Error("REDIRECT");
    }),
}));

import { createOfferAction } from "./actions";
import { createOffer } from "@/lib/api/offers";
import { redirect } from "next/navigation";

function fd(obj: Record<string, string>) {
    const f = new FormData();
    for (const [k, v] of Object.entries(obj)) f.set(k, v);
    return f;
}

const good = {
    variantId: "clxreal000cuidvalue00",
    condition: "NEW",
    price: "1500",
    quantity: "3",
};

beforeEach(() => vi.clearAllMocks());

describe("createOfferAction", () => {
    it("returns fieldErrors when USED condition is submitted without conditionNotes", async () => {
        const state = await createOfferAction(null, fd({ ...good, condition: "USED" }));

        expect(state?.fieldErrors?.conditionNotes).toBeTruthy();
        expect(createOffer).not.toHaveBeenCalled();
    });

    it("calls createOffer and redirects to the listings page on valid input", async () => {
        vi.mocked(createOffer).mockResolvedValue({ success: true } as never);

        await expect(createOfferAction(null, fd(good))).rejects.toThrow("REDIRECT");

        expect(createOffer).toHaveBeenCalledWith(
            expect.objectContaining({
                variantId: good.variantId,
                condition: "NEW",
                price: 1500,
                quantity: 3,
            }),
        );
        expect(redirect).toHaveBeenCalledWith("/seller/dashboard/listings");
    });

    it("treats blank optional fields as omitted, not zero", async () => {
        vi.mocked(createOffer).mockResolvedValue({ success: true } as never);

        await expect(
            createOfferAction(
                null,
                fd({ ...good, discount: "0", deliveryDays: "", warrantyMonths: "" }),
            ),
        ).rejects.toThrow("REDIRECT");

        expect(createOffer).toHaveBeenCalledWith(
            expect.not.objectContaining({ deliveryDays: expect.anything() }),
        );
    });

    it("maps a 409 ApiError (duplicate condition) to formError", async () => {
        vi.mocked(createOffer).mockRejectedValue(
            new ApiError({
                statusCode: 409,
                code: "CONFLICT",
                messages: ["This variant is already listed in that condition"],
            }),
        );

        const state = await createOfferAction(null, fd(good));

        expect(state?.formError).toBe("This variant is already listed in that condition");
    });
});
