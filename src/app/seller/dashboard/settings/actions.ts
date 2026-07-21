"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireAuth } from "@/lib/auth/require-auth";
import { getMyShop, updateShop, closeShop } from "@/lib/api/shops";
import { ApiError } from "@/lib/api/errors";
import { ShopUpdateSchema } from "@/lib/schemas/seller-shop";
import type { ActionState } from "@/lib/types/action-state";

export async function updateShopAction(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    await requireAuth();
    const parsed = ShopUpdateSchema.safeParse(Object.fromEntries(formData));
    if (!parsed.success) return { fieldErrors: parsed.error.flatten().fieldErrors };
    try {
        const shop = await getMyShop();
        await updateShop(shop.id, parsed.data);
    } catch (err) {
        if (err instanceof ApiError)
            return { formError: err.messages[0] ?? "Something went wrong" };
        throw err;
    }
    revalidatePath("/seller/dashboard/settings");
    return { success: true };
}

export async function closeShopAction(): Promise<void> {
    await requireAuth();
    try {
        await closeShop();
    } catch {
        /* ignore — reflect on next load */
    }
    redirect("/");
}
