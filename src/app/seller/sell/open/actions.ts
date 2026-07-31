"use server";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { openShop } from "@/lib/api/shops";
import { ApiError } from "@/lib/api/errors";
import { ShopFormSchema } from "@/lib/schemas/seller-shop";
import type { ActionState } from "@/lib/types/action-state";

export async function openShopAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
    await requireAuth();
    const parsed = ShopFormSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
    try {
        await openShop(parsed.data);
    } catch (err) {
        if (err instanceof ApiError)
            return { formError: err.messages[0] ?? "Something went wrong" };
        throw err;
    }
    redirect("/seller/dashboard");
}
