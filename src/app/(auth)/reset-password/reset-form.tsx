"use client";

import { useActionState } from "react";
import { resetPasswordAction } from "./actions";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";

export function ResetForm() {
    const [state, formAction, pending] = useActionState(resetPasswordAction, null);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-1 text-center">
                <h1 className="text-xl font-semibold">Reset password</h1>
                <p className="text-muted-foreground text-sm">
                    Choose a new password for your account
                </p>
            </div>

            <FormError message={state?.formError} />

            <FormField
                name="newPassword"
                label="New password"
                type="password"
                autoComplete="new-password"
                error={state?.fieldErrors?.newPassword?.[0]}
            />

            <FormField
                name="confirmPassword"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                error={state?.fieldErrors?.confirmPassword?.[0]}
            />

            <SubmitButton pending={pending} className="w-full">
                Reset password
            </SubmitButton>
        </form>
    );
}
