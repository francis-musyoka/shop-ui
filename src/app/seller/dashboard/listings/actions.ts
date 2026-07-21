"use server";
import { revalidatePath } from "next/cache";
import { requireAuth } from "@/lib/auth/require-auth";
import { updateOffer, setOfferPrice } from "@/lib/api/offers";
import { ApiError } from "@/lib/api/errors";
import { OfferEditSchema, SetPriceSchema, OfferStatusSchema } from "@/lib/schemas/offer";
import type { ActionState } from "@/lib/types/action-state";

function getOfferId(formData: FormData): string | null {
    const offerId = formData.get("offerId");
    return typeof offerId === "string" && offerId.length > 0 ? offerId : null;
}

// Edit dialog — quantity/delivery/warranty/conditionNotes. `condition` rides along as a
// hidden field (not part of OfferEditSchema — condition is immutable once listed) so we
// can enforce the same "notes required for used items" rule the create flow has, without
// letting the seller change condition through this form.
export async function editOfferAction(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    await requireAuth();
    const offerId = getOfferId(formData);
    if (!offerId) return { formError: "Missing listing id" };

    const parsed = OfferEditSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

    const condition = formData.get("condition");
    if (condition === "USED" && !parsed.data.conditionNotes?.trim()) {
        return {
            fieldErrors: { conditionNotes: ["Condition notes are required for used items"] },
        };
    }

    try {
        await updateOffer(offerId, {
            quantity: parsed.data.quantity,
            deliveryDays: parsed.data.deliveryDays,
            warrantyMonths: parsed.data.warrantyMonths,
            conditionNotes: parsed.data.conditionNotes,
        });
    } catch (err) {
        if (err instanceof ApiError)
            return { formError: err.messages[0] ?? "Something went wrong" };
        throw err;
    }
    revalidatePath("/seller/dashboard/listings");
    return { success: true };
}

// Set-price dialog — price goes through the dedicated price endpoint; discount isn't
// part of that endpoint, so it gets its own updateOffer call when the dialog submits it.
export async function setPriceAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
    await requireAuth();
    const offerId = getOfferId(formData);
    if (!offerId) return { formError: "Missing listing id" };

    const parsed = SetPriceSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

    try {
        await setOfferPrice(offerId, { newPrice: parsed.data.price });
        await updateOffer(offerId, { discount: parsed.data.discount });
    } catch (err) {
        if (err instanceof ApiError)
            return { formError: err.messages[0] ?? "Something went wrong" };
        throw err;
    }
    revalidatePath("/seller/dashboard/listings");
    return { success: true };
}

// Activate/Deactivate dialog. OfferStatusSchema only accepts ACTIVE/INACTIVE, so
// SUSPENDED/OUT_OF_STOCK (moderation/inventory states the seller can't self-toggle)
// fail validation before any API call is made.
export async function setStatusAction(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    await requireAuth();
    const offerId = getOfferId(formData);
    if (!offerId) return { formError: "Missing listing id" };

    const parsed = OfferStatusSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };

    try {
        await updateOffer(offerId, { status: parsed.data.status });
    } catch (err) {
        if (err instanceof ApiError)
            return { formError: err.messages[0] ?? "Something went wrong" };
        throw err;
    }
    revalidatePath("/seller/dashboard/listings");
    return { success: true };
}
