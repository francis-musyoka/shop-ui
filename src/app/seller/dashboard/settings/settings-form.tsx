"use client";

import { useActionState, useEffect } from "react";
import { toast } from "sonner";
import { ShieldCheck, CalendarDays } from "lucide-react";
import { updateShopAction, closeShopAction } from "./actions";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";
import { Button } from "@/components/ui/button";
import { ShopFormFields } from "@/components/seller/shop-form-fields";
import { SectionCard } from "@/components/seller/section-card";
import { ShopStatusBadge, VerifiedBadge } from "@/components/seller/shop-status-badge";
import type { MyShop } from "@/lib/schemas/seller-shop";
import type { CategoryTreeNode } from "@/lib/schemas/category";
import { shopInitials } from "@/lib/seller/shop-initials";

interface SettingsFormProps {
    shop: MyShop;
    categories: CategoryTreeNode[];
}

export function SettingsForm({ shop, categories }: SettingsFormProps) {
    const [state, formAction, pending] = useActionState(updateShopAction, null);

    useEffect(() => {
        if (state?.success) {
            toast.success("Shop updated");
        }
    }, [state]);

    const joined = new Date(shop.createdAt).toLocaleDateString("en-KE", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <div className="flex flex-col gap-6">
            {/* Status / verification — read only */}
            <div className="border-border bg-card flex flex-wrap items-center justify-between gap-3 rounded-sm border p-4">
                <div className="flex items-center gap-3">
                    <div className="bg-brand-700 flex size-12 shrink-0 items-center justify-center rounded-sm text-lg font-semibold text-white">
                        {shopInitials(shop.name)}
                    </div>
                    <div>
                        <p className="font-semibold">{shop.name}</p>
                        <div className="mt-1 flex items-center gap-1.5">
                            <ShopStatusBadge status={shop.status} />
                            {shop.isVerified && <VerifiedBadge />}
                        </div>
                    </div>
                </div>
                <div className="text-muted-foreground flex flex-col gap-1 text-xs">
                    <span className="flex items-center gap-1.5">
                        <ShieldCheck size={13} />
                        {shop.businessType === "REGISTERED"
                            ? "Registered business"
                            : "Individual seller"}
                    </span>
                    <span className="flex items-center gap-1.5">
                        <CalendarDays size={13} /> Selling since {joined}
                    </span>
                </div>
            </div>

            <form action={formAction} className="flex flex-col gap-6">
                <FormError message={state?.formError} />

                <ShopFormFields
                    mode="edit"
                    disableCategory
                    defaults={{
                        name: shop.name,
                        slug: shop.slug,
                        description: shop.description,
                        categoryId: shop.category.id,
                        categoryName: shop.category.name,
                        businessType: shop.businessType,
                        email: shop.email,
                        phone: shop.phone,
                        street: shop.shopAddress.street,
                        city: shop.shopAddress.city,
                        state: shop.shopAddress.state ?? undefined,
                        postalCode: shop.shopAddress.postalCode ?? undefined,
                        logoUrl: shop.logoUrl ?? undefined,
                        bannerUrl: shop.bannerUrl ?? undefined,
                        websiteLink: shop.websiteLink ?? undefined,
                        facebook: shop.facebook ?? undefined,
                        instagram: shop.instagram ?? undefined,
                        tiktok: shop.tiktok ?? undefined,
                    }}
                    fieldErrors={state?.fieldErrors ?? {}}
                    categories={categories}
                />

                <div className="flex justify-end gap-2 pb-2">
                    <SubmitButton pending={pending}>Save changes</SubmitButton>
                </div>
            </form>

            <SectionCard
                title="Close shop"
                description="Your listings will be removed from the marketplace."
            >
                <form action={closeShopAction}>
                    <Button type="submit" variant="destructive" size="sm">
                        Close my shop
                    </Button>
                </form>
            </SectionCard>
        </div>
    );
}
