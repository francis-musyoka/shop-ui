"use client";

import { useActionState } from "react";
import { openShopAction } from "./actions";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";
import { ShopFormFields } from "@/components/seller/shop-form-fields";
import type { CategoryTreeNode } from "@/lib/schemas/category";

interface OpenShopFormProps {
    categories: CategoryTreeNode[];
}

export function OpenShopForm({ categories }: OpenShopFormProps) {
    const [state, formAction, pending] = useActionState(openShopAction, null);

    return (
        <form action={formAction} className="flex flex-col gap-6">
            <FormError message={state?.formError} />

            <ShopFormFields
                mode="create"
                fieldErrors={state?.fieldErrors ?? {}}
                categories={categories}
            />

            <div className="text-muted-foreground flex items-start gap-2 text-xs">
                <span>
                    New shops start in <strong className="text-foreground">Pending review</strong>{" "}
                    and go live once approved.
                </span>
            </div>
            <div className="flex justify-end gap-2 pb-2">
                <SubmitButton pending={pending}>Submit for review</SubmitButton>
            </div>
        </form>
    );
}
