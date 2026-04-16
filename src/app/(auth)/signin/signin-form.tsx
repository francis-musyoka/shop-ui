"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signinAction } from "./actions";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";

interface SigninFormProps {
    next?: string;
}

export function SigninForm({ next }: SigninFormProps) {
    const [state, formAction, pending] = useActionState(signinAction, null);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-1 text-center">
                <h1 className="text-xl font-semibold">Sign in</h1>
                <p className="text-muted-foreground text-sm">
                    Enter your credentials to access your account
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

            <FormField
                name="password"
                label="Password"
                type="password"
                autoComplete="current-password"
                error={state?.fieldErrors?.password?.[0]}
            />

            {next && <input type="hidden" name="next" value={next} />}

            <SubmitButton pending={pending} className="w-full">
                Sign in
            </SubmitButton>

            <div className="text-center text-sm">
                <Link
                    href="/forgot-password"
                    className="text-muted-foreground hover:text-foreground underline underline-offset-4"
                >
                    Forgot your password?
                </Link>
            </div>

            <div className="text-center text-sm">
                Don&apos;t have an account?{" "}
                <Link href="/signup" className="text-primary underline underline-offset-4">
                    Sign up
                </Link>
            </div>
        </form>
    );
}
