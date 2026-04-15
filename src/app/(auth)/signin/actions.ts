"use server";

import { redirect } from "next/navigation";
import { signin } from "@/lib/api/customers";
import { ApiError } from "@/lib/api/errors";
import { SigninRequestSchema } from "@/lib/schemas/customer";
import type { ActionState } from "@/lib/types/action-state";

export async function signinAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const raw = Object.fromEntries(formData);
    const parsed = SigninRequestSchema.safeParse(raw);

    if (!parsed.success) {
        return { fieldErrors: parsed.error.flatten().fieldErrors };
    }

    try {
        await signin(parsed.data);
    } catch (err) {
        if (err instanceof ApiError) {
            return { formError: err.messages[0] ?? "Something went wrong" };
        }
        throw err;
    }

    const next = formData.get("next")?.toString() || "/";
    redirect(next);
}
