"use server";

import { redirect } from "next/navigation";
import { forgotPassword } from "@/lib/api/customers";
import { ApiError } from "@/lib/api/errors";
import { ForgotPasswordRequestSchema } from "@/lib/schemas/customer";
import type { ActionState } from "@/lib/types/action-state";

export async function forgotPasswordAction(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const raw = Object.fromEntries(formData);
    const parsed = ForgotPasswordRequestSchema.safeParse(raw);

    if (!parsed.success) {
        return { fieldErrors: parsed.error.flatten().fieldErrors };
    }

    try {
        await forgotPassword(parsed.data);
    } catch (err) {
        if (err instanceof ApiError) {
            return { formError: err.messages[0] ?? "Something went wrong" };
        }
        throw err;
    }

    redirect(`/verify-otp?email=${encodeURIComponent(parsed.data.email)}`);
}
