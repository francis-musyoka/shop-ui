"use server";

import { redirect } from "next/navigation";
import { verifyPasswordOtp } from "@/lib/api/customers";
import { ApiError } from "@/lib/api/errors";
import { VerifyOtpRequestSchema } from "@/lib/schemas/customer";
import type { ActionState } from "@/lib/types/action-state";

export async function verifyOtpAction(
    _prev: ActionState,
    formData: FormData,
): Promise<ActionState> {
    const raw = Object.fromEntries(formData);
    const parsed = VerifyOtpRequestSchema.safeParse(raw);

    if (!parsed.success) {
        return { fieldErrors: parsed.error.flatten().fieldErrors };
    }

    try {
        await verifyPasswordOtp(parsed.data);
    } catch (err) {
        if (err instanceof ApiError) {
            return { formError: err.messages[0] ?? "Something went wrong" };
        }
        throw err;
    }

    redirect("/reset-password");
}
