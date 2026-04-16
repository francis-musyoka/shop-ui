"use client";

import { useActionState, useEffect, useState } from "react";
import Link from "next/link";
import { verifyOtpAction } from "./actions";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";

interface OtpFormProps {
    email: string;
}

const RESEND_COOLDOWN_SECONDS = 60;

export function OtpForm({ email }: OtpFormProps) {
    const [state, formAction, pending] = useActionState(verifyOtpAction, null);
    const [secondsLeft, setSecondsLeft] = useState(RESEND_COOLDOWN_SECONDS);

    useEffect(() => {
        const id = setInterval(() => {
            setSecondsLeft((s) => (s > 0 ? s - 1 : 0));
        }, 1000);
        return () => clearInterval(id);
    }, []);

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

            <div className="text-muted-foreground text-center text-sm">
                {secondsLeft > 0 ? (
                    <span aria-live="polite">Resend code in {formatCountdown(secondsLeft)}</span>
                ) : (
                    <Link
                        href="/forgot-password"
                        className="hover:text-foreground underline underline-offset-4"
                    >
                        Resend code
                    </Link>
                )}
            </div>
        </form>
    );
}

function formatCountdown(seconds: number): string {
    const mm = Math.floor(seconds / 60);
    const ss = seconds % 60;
    return `${mm}:${ss.toString().padStart(2, "0")}`;
}
