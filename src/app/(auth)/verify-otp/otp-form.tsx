"use client";

import { useActionState } from "react";
import Link from "next/link";
import { verifyOtpAction } from "./actions";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";

interface OtpFormProps {
    email: string;
}

export function OtpForm({ email }: OtpFormProps) {
    const [state, formAction, pending] = useActionState(verifyOtpAction, null);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-1 text-center">
                <h1 className="text-xl font-semibold">Verify code</h1>
                <p className="text-muted-foreground text-sm">
                    Enter the 6-digit code sent to <span className="font-medium">{email}</span>
                </p>
            </div>

            <FormError message={state?.formError} />

            <input type="hidden" name="email" value={email} />

            <FormField
                name="code"
                label="Verification code"
                placeholder="000000"
                autoComplete="one-time-code"
                error={state?.fieldErrors?.code?.[0]}
            />

            <SubmitButton pending={pending} className="w-full">
                Verify
            </SubmitButton>

            <div className="text-center text-sm">
                <Link
                    href="/forgot-password"
                    className="text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                    Resend code
                </Link>
            </div>
        </form>
    );
}
