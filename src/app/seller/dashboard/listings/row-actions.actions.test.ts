import { describe, it, expect, vi, beforeEach } from "vitest";
import { ApiError } from "@/lib/api/errors";

vi.mock("@/lib/auth/require-auth", () => ({ requireAuth: vi.fn() }));
vi.mock("@/lib/api/offers", () => ({
    updateOffer: vi.fn(),
    setOfferPrice: vi.fn(),
}));
vi.mock("next/cache", () => ({ revalidatePath: vi.fn() }));

import { editOfferAction, setPriceAction, setStatusAction } from "./actions";
import { updateOffer, setOfferPrice } from "@/lib/api/offers";
import { requireAuth } from "@/lib/auth/require-auth";
import { revalidatePath } from "next/cache";

function fd(obj: Record<string, string>) {
    const f = new FormData();
    for (const [k, v] of Object.entries(obj)) f.set(k, v);
    return f;
}

const offerId = "clh1a2b3c4d5e6f7g8h9i0j1";

beforeEach(() => vi.clearAllMocks());

describe("setStatusAction", () => {
    it("rejects status SUSPENDED with fieldErrors and makes no API call", async () => {
        const s = await setStatusAction(null, fd({ offerId, status: "SUSPENDED" }));

        expect(s?.fieldErrors?.status).toBeTruthy();
        expect(updateOffer).not.toHaveBeenCalled();
    });

    it("rejects status OUT_OF_STOCK with fieldErrors and makes no API call", async () => {
        const s = await setStatusAction(null, fd({ offerId, status: "OUT_OF_STOCK" }));

        expect(s?.fieldErrors?.status).toBeTruthy();
        expect(updateOffer).not.toHaveBeenCalled();
    });

    it("calls requireAuth", async () => {
        vi.mocked(updateOffer).mockResolvedValue({ success: true } as never);
        await setStatusAction(null, fd({ offerId, status: "ACTIVE" }));
        expect(requireAuth).toHaveBeenCalled();
    });

    it("calls updateOffer with status and returns success", async () => {
        vi.mocked(updateOffer).mockResolvedValue({ success: true } as never);

        const s = await setStatusAction(null, fd({ offerId, status: "INACTIVE" }));

        expect(updateOffer).toHaveBeenCalledWith(offerId, { status: "INACTIVE" });
        expect(revalidatePath).toHaveBeenCalledWith("/seller/dashboard/listings");
        expect(s).toEqual({ success: true });
    });

    it("maps ApiError to formError", async () => {
        vi.mocked(updateOffer).mockRejectedValue(
            new ApiError({ statusCode: 409, code: "CONFLICT", messages: ["Cannot deactivate"] }),
        );

        const s = await setStatusAction(null, fd({ offerId, status: "INACTIVE" }));

        expect(s?.formError).toBe("Cannot deactivate");
    });
});

describe("editOfferAction", () => {
    it("requires conditionNotes when condition is USED and notes are empty", async () => {
        const s = await editOfferAction(
            null,
            fd({
                offerId,
                condition: "USED",
                quantity: "5",
                deliveryDays: "2",
                warrantyMonths: "12",
                conditionNotes: "",
            }),
        );

        expect(s?.fieldErrors?.conditionNotes).toBeTruthy();
        expect(updateOffer).not.toHaveBeenCalled();
    });

    it("does not require conditionNotes when condition is NEW", async () => {
        vi.mocked(updateOffer).mockResolvedValue({ success: true } as never);

        const s = await editOfferAction(
            null,
            fd({
                offerId,
                condition: "NEW",
                quantity: "5",
                deliveryDays: "2",
                warrantyMonths: "12",
                conditionNotes: "",
            }),
        );

        expect(s).toEqual({ success: true });
        expect(updateOffer).toHaveBeenCalledWith(offerId, {
            quantity: 5,
            deliveryDays: 2,
            warrantyMonths: 12,
            conditionNotes: "",
        });
    });

    it("calls updateOffer with the parsed fields and returns success", async () => {
        vi.mocked(updateOffer).mockResolvedValue({ success: true } as never);

        const s = await editOfferAction(
            null,
            fd({
                offerId,
                condition: "USED",
                quantity: "10",
                deliveryDays: "3",
                warrantyMonths: "6",
                conditionNotes: "Minor scratches on the back.",
            }),
        );

        expect(updateOffer).toHaveBeenCalledWith(offerId, {
            quantity: 10,
            deliveryDays: 3,
            warrantyMonths: 6,
            conditionNotes: "Minor scratches on the back.",
        });
        expect(revalidatePath).toHaveBeenCalledWith("/seller/dashboard/listings");
        expect(s).toEqual({ success: true });
    });

    it("maps ApiError to formError", async () => {
        vi.mocked(updateOffer).mockRejectedValue(
            new ApiError({ statusCode: 400, code: "VALIDATION_ERROR", messages: ["Bad quantity"] }),
        );

        const s = await editOfferAction(
            null,
            fd({
                offerId,
                condition: "NEW",
                quantity: "10",
                deliveryDays: "3",
                warrantyMonths: "6",
            }),
        );

        expect(s?.formError).toBe("Bad quantity");
    });
});

describe("setPriceAction", () => {
    it("calls setOfferPrice with the offer id and newPrice", async () => {
        vi.mocked(setOfferPrice).mockResolvedValue({ success: true } as never);
        vi.mocked(updateOffer).mockResolvedValue({ success: true } as never);

        const s = await setPriceAction(null, fd({ offerId, price: "5000", discount: "10" }));

        expect(setOfferPrice).toHaveBeenCalledWith(offerId, { newPrice: 5000 });
        expect(s).toEqual({ success: true });
    });

    it("also updates the discount via updateOffer", async () => {
        vi.mocked(setOfferPrice).mockResolvedValue({ success: true } as never);
        vi.mocked(updateOffer).mockResolvedValue({ success: true } as never);

        await setPriceAction(null, fd({ offerId, price: "5000", discount: "15" }));

        expect(updateOffer).toHaveBeenCalledWith(offerId, { discount: 15 });
    });

    it("rejects a non-positive price with fieldErrors and makes no API call", async () => {
        const s = await setPriceAction(null, fd({ offerId, price: "0", discount: "0" }));

        expect(s?.fieldErrors?.price).toBeTruthy();
        expect(setOfferPrice).not.toHaveBeenCalled();
        expect(updateOffer).not.toHaveBeenCalled();
    });

    it("maps ApiError to formError", async () => {
        vi.mocked(setOfferPrice).mockRejectedValue(
            new ApiError({
                statusCode: 500,
                code: "INTERNAL_SERVER_ERROR",
                messages: ["Server error"],
            }),
        );

        const s = await setPriceAction(null, fd({ offerId, price: "5000", discount: "0" }));

        expect(s?.formError).toBe("Server error");
    });

    it("revalidates the listings path on success", async () => {
        vi.mocked(setOfferPrice).mockResolvedValue({ success: true } as never);
        vi.mocked(updateOffer).mockResolvedValue({ success: true } as never);

        await setPriceAction(null, fd({ offerId, price: "5000", discount: "0" }));

        expect(revalidatePath).toHaveBeenCalledWith("/seller/dashboard/listings");
    });
});
