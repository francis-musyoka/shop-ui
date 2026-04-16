"use client";

import { useActionState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { updatePasswordAction } from "./actions";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";

export function PasswordForm() {
    const [state, formAction, pending] = useActionState(updatePasswordAction, null);
    const formRef = useRef<HTMLFormElement>(null);

    useEffect(() => {
        if (state?.success) {
            toast.success("Password updated");
            formRef.current?.reset();
        }
    }, [state]);

    return (
        <form ref={formRef} action={formAction} className="space-y-4">
            <h2 className="text-lg font-semibold">Change password</h2>

            <FormError message={state?.formError} />

            <FormField
                name="currentPassword"
                label="Current password"
                type="password"
                autoComplete="current-password"
                error={state?.fieldErrors?.currentPassword?.[0]}
            />

            <FormField
                name="newPassword"
                label="New password"
                type="password"
                autoComplete="new-password"
                error={state?.fieldErrors?.newPassword?.[0]}
            />

            <FormField
                name="currentPasswordConfirm"
                label="Confirm new password"
                type="password"
                autoComplete="new-password"
                error={state?.fieldErrors?.currentPasswordConfirm?.[0]}
            />

            <SubmitButton pending={pending}>Update password</SubmitButton>
        </form>
    );
}
