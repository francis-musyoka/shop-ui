"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { updateProfileAction } from "./actions";
import { FormField } from "@/components/auth/form-field";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";
import type { Customer } from "@/lib/schemas/customer";

interface ProfileFormProps {
    user: Customer;
}

export function ProfileForm({ user }: ProfileFormProps) {
    const [state, formAction, pending] = useActionState(updateProfileAction, null);

    useEffect(() => {
        if (state?.success) {
            toast.success("Profile updated");
        }
    }, [state]);

    return (
        <form action={formAction} className="space-y-4">
            <h2 className="text-lg font-semibold">Profile</h2>

            <FormError message={state?.formError} />

            <div className="grid grid-cols-2 gap-4">
                <FormField
                    name="firstName"
                    label="First name"
                    defaultValue={user.firstName}
                    autoComplete="given-name"
                    error={state?.fieldErrors?.firstName?.[0]}
                />

                <FormField
                    name="lastName"
                    label="Last name"
                    defaultValue={user.lastName}
                    autoComplete="family-name"
                    error={state?.fieldErrors?.lastName?.[0]}
                />
            </div>

            <div className="space-y-2">
                <label className="text-sm font-medium">Email</label>
                <p className="text-muted-foreground text-sm">{user.email}</p>
            </div>

            <SubmitButton pending={pending}>Save changes</SubmitButton>
        </form>
    );
}
