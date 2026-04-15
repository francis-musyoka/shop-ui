"use client";

import { useActionState } from "react";
import Link from "next/link";
import { forgotPasswordAction } from "./actions";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";

export function ForgotForm() {
    const [state, formAction, pending] = useActionState(forgotPasswordAction, null);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-1 text-center">
                <h1 className="text-xl font-semibold">Forgot password</h1>
                <p className="text-muted-foreground text-sm">
                    Enter your email and we&apos;ll send you a verification code
                </p>
            </div>

            <FormError message={state?.formError} />

            <FormField
                name="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                error={state?.fieldErrors?.email?.[0]}
            />

            <SubmitButton pending={pending} className="w-full">
                Send code
            </SubmitButton>

            <div className="text-center text-sm">
                <Link
                    href="/signin"
                    className="text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                    Back to sign in
                </Link>
            </div>
        </form>
    );
}
