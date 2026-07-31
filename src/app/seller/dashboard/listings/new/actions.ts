"use server";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { createOffer } from "@/lib/api/offers";
import { ApiError } from "@/lib/api/errors";
import { OfferCreateSchema } from "@/lib/schemas/offer";
import type { ActionState } from "@/lib/types/action-state";

// Add-listing submit — POST /api/products/offers. Condition and variant are picked in
// the form (VariantPicker + condition buttons) and ride along as hidden fields, so this
// action is just parse → create → redirect, same shape as openShopAction.
export async function createOfferAction(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    await requireAuth();
    const parsed = OfferCreateSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
    try {
        await createOffer(parsed.data);
    } catch (err) {
        if (err instanceof ApiError)
            return { formError: err.messages[0] ?? "Something went wrong" };
        throw err;
    }
    redirect("/seller/dashboard/listings");
}
