"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { updateProfile, updatePassword, logout } from "@/lib/api/customers";
import { ApiError } from "@/lib/api/errors";
import { UpdateProfileRequestSchema, UpdatePasswordRequestSchema } from "@/lib/schemas/customer";
import type { ActionState } from "@/lib/types/action-state";
import { requireAuth } from "@/lib/auth/require-auth";

export async function updateProfileAction(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    await requireAuth();
    const raw = Object.fromEntries(formData);
    const parsed = UpdateProfileRequestSchema.safeParse(raw);

    if (!parsed.success) {
        return { fieldErrors: parsed.error.flatten().fieldErrors };
    }

    try {
        await updateProfile(parsed.data);
    } catch (err) {
        if (err instanceof ApiError) {
            return { formError: err.messages[0] ?? "Something went wrong" };
        }
        throw err;
    }

    revalidatePath("/account");
    return { success: true };
}

export async function updatePasswordAction(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    await requireAuth();
    const raw = Object.fromEntries(formData);
    const parsed = UpdatePasswordRequestSchema.safeParse(raw);

    if (!parsed.success) {
        return { fieldErrors: parsed.error.flatten().fieldErrors };
    }

    try {
        await updatePassword(parsed.data);
    } catch (err) {
        if (err instanceof ApiError) {
            return { formError: err.messages[0] ?? "Something went wrong" };
        }
        throw err;
    }

    return { success: true };
}

export async function logoutAction(): Promise<void> {
    await requireAuth();
    try {
        await logout();
    } catch {
        // Logout failure should not block the user — clear local state and redirect anyway.
    }
    redirect("/signin");
}
