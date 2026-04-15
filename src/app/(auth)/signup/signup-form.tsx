"use client";

import { useActionState } from "react";
import Link from "next/link";
import { signupAction } from "./actions";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";

export function SignupForm() {
    const [state, formAction, pending] = useActionState(signupAction, null);

    return (
        <form action={formAction} className="space-y-4">
            <div className="space-y-1 text-center">
                <h1 className="text-xl font-semibold">Create an account</h1>
                <p className="text-muted-foreground text-sm">Enter your details to get started</p>
            </div>

            <FormError message={state?.formError} />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    name="firstName"
                    label="First name"
                    autoComplete="given-name"
                    error={state?.fieldErrors?.firstName?.[0]}
                />

                <FormField
                    name="lastName"
                    label="Last name"
                    autoComplete="family-name"
                    error={state?.fieldErrors?.lastName?.[0]}
                />
            </div>

            <FormField
                name="email"
                label="Email"
                type="email"
                placeholder="you@example.com"
                autoComplete="email"
                error={state?.fieldErrors?.email?.[0]}
            />

            <FormField
                name="phone"
                label="Phone"
                type="tel"
                placeholder="+254700000000"
                autoComplete="tel"
                error={state?.fieldErrors?.phone?.[0]}
            />

            <FormField
                name="password"
                label="Password"
                type="password"
                autoComplete="new-password"
                error={state?.fieldErrors?.password?.[0]}
            />

            <FormField
                name="confirmPassword"
                label="Confirm password"
                type="password"
                autoComplete="new-password"
                error={state?.fieldErrors?.confirmPassword?.[0]}
            />

            <SubmitButton pending={pending} className="w-full">
                Sign up
            </SubmitButton>

            <div className="text-center text-sm">
                Already have an account?{" "}
                <Link href="/signin" className="text-primary underline underline-offset-4">
                    Sign in
                </Link>
            </div>
        </form>
    );
}
