"use server";

import { redirect } from "next/navigation";
import { signup } from "@/lib/api/customers";
import { ApiError } from "@/lib/api/errors";
import { SignupRequestSchema } from "@/lib/schemas/customer";
import type { ActionState } from "@/lib/types/action-state";

export async function signupAction(_prev: ActionState, formData: FormData): Promise<ActionState> {
    const raw = Object.fromEntries(formData);
    const parsed = SignupRequestSchema.safeParse(raw);

    if (!parsed.success) {
        return { fieldErrors: parsed.error.flatten().fieldErrors };
    }

    try {
        await signup(parsed.data);
    } catch (err) {
        if (err instanceof ApiError) {
            return { formError: err.messages[0] ?? "Something went wrong" };
        }
        throw err;
    }

    redirect("/signin?registered=true");
}
