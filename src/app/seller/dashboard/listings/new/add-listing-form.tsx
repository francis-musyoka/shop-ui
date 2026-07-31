"use client";

import { useActionState, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Store } from "lucide-react";
import { buttonVariants } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { FormError } from "@/components/auth/form-error";
import { SubmitButton } from "@/components/auth/submit-button";
import { SectionCard } from "@/components/seller/section-card";
import { OfferFields } from "@/components/seller/offer-fields";
import { VariantPicker } from "@/components/seller/variant-picker";
import { composeVariantLabel } from "@/lib/shop-slug";
import { CONDITIONS, type VariantSearchResult } from "@/lib/schemas/offer";
import { cn } from "@/lib/utils";
import { createOfferAction } from "./actions";

type Condition = (typeof CONDITIONS)[number];

const CONDITION_LABELS: Record<Condition, string> = {
    NEW: "New",
    USED: "Used",
    REFURBISHED: "Refurbished",
};

interface AddListingFormProps {
    shopCategoryId: string;
    categories: { id: string; name: string }[];
    brands: { id: string; name: string }[];
    canManage: boolean;
}

// Add-listing form: variant picker -> condition select -> OfferFields -> submit. Gated
// on `canManage` (shop must be ACTIVE, see canManageListings) before any of that renders.
export function AddListingForm({
    shopCategoryId,
    categories,
    brands,
    canManage,
}: AddListingFormProps) {
    const [state, formAction, pending] = useActionState(createOfferAction, null);
    const [selected, setSelected] = useState<VariantSearchResult | null>(null);
    const [condition, setCondition] = useState<Condition>("NEW");
    // OfferFields' conditionNotes textarea is uncontrolled (defaultValue only) — mirror
    // its value here via the form's onChange so the submit button can gate on "notes
    // present" client-side without a round-trip, without having to touch the shared
    // OfferFields component that the edit/set-price dialogs also use.
    const [conditionNotes, setConditionNotes] = useState("");

    if (!canManage) {
        return (
            <div className="border-border bg-card text-muted-foreground rounded-sm border px-4 py-12 text-center text-sm">
                Listing creation is unavailable until your shop is active. See the notice above for
                details.
            </div>
        );
    }

    function selectCondition(c: Condition) {
        if (c === condition) return;
        setCondition(c);
        // OfferFields remounts the notes field blank whenever condition changes into/out
        // of USED, so any previously-typed notes no longer exist on the page — keep the
        // gating state in sync with that.
        setConditionNotes("");
    }

    // When a variant is picked, default to its first non-listed condition rather than
    // always "NEW" — a variant that's already listed as NEW should land on e.g. USED
    // instead of opening on a disabled, already-taken condition button.
    function selectVariant(r: VariantSearchResult) {
        setSelected(r);
        setCondition(CONDITIONS.find((c) => !r.listedConditions.includes(c)) ?? "NEW");
        setConditionNotes("");
    }

    const notesMissing = condition === "USED" && conditionNotes.trim().length === 0;

    return (
        <form
            action={formAction}
            onChange={(e) => {
                const target = e.target;
                if (target instanceof HTMLTextAreaElement && target.name === "conditionNotes") {
                    setConditionNotes(target.value);
                }
            }}
            className="flex flex-col gap-6"
        >
            <input type="hidden" name="variantId" value={selected?.variantId ?? ""} />
            <input type="hidden" name="condition" value={condition} />

            <FormError message={state?.formError} />

            <SectionCard
                title="Product"
                description="Search the catalog for the product you want to list."
            >
                {selected ? (
                    <div className="border-border flex items-center justify-between gap-3 rounded-sm border px-3 py-2.5">
                        <div className="flex items-center gap-3">
                            <div className="bg-muted relative flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-sm">
                                {selected.mainImageUrl ? (
                                    <Image
                                        src={selected.mainImageUrl}
                                        alt=""
                                        fill
                                        unoptimized
                                        sizes="40px"
                                        className="object-cover"
                                    />
                                ) : (
                                    <Store className="text-muted-foreground" size={16} />
                                )}
                            </div>
                            <div>
                                <p className="text-sm font-medium">{selected.productTitle}</p>
                                <p className="text-muted-foreground text-xs">
                                    {composeVariantLabel(selected.attributes)}
                                </p>
                            </div>
                        </div>
                        <button
                            type="button"
                            onClick={() => setSelected(null)}
                            className="text-brand-600 dark:text-brand-400 shrink-0 text-sm font-medium hover:underline"
                        >
                            Change
                        </button>
                    </div>
                ) : (
                    <VariantPicker
                        shopCategoryId={shopCategoryId}
                        categories={categories}
                        brands={brands}
                        onSelectAction={selectVariant}
                    />
                )}
            </SectionCard>

            <SectionCard title="Listing details">
                <div className="flex flex-col gap-4">
                    <div className="flex flex-col gap-1.5">
                        <Label className="text-sm">Condition</Label>
                        <div className="flex gap-1.5">
                            {CONDITIONS.map((c) => {
                                const alreadyTaken =
                                    selected?.listedConditions.includes(c) ?? false;
                                return (
                                    <button
                                        key={c}
                                        type="button"
                                        disabled={alreadyTaken}
                                        onClick={() => selectCondition(c)}
                                        className={cn(
                                            "h-10 flex-1 rounded-sm border text-sm font-medium disabled:cursor-not-allowed disabled:opacity-50",
                                            condition === c
                                                ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-400"
                                                : "border-input text-muted-foreground hover:bg-muted",
                                        )}
                                    >
                                        {CONDITION_LABELS[c]}
                                    </button>
                                );
                            })}
                        </div>
                        {selected && selected.listedConditions.length > 0 && (
                            <p className="text-muted-foreground text-xs">
                                Already listed in{" "}
                                {selected.listedConditions
                                    .map((c) => CONDITION_LABELS[c].toLowerCase())
                                    .join(", ")}{" "}
                                condition for this shop.
                            </p>
                        )}
                    </div>

                    <OfferFields
                        variant="create"
                        fieldErrors={state?.fieldErrors ?? {}}
                        condition={condition}
                    />
                </div>
            </SectionCard>

            <div className="flex justify-end gap-2 pb-2">
                <Link
                    href="/seller/dashboard/listings"
                    className={buttonVariants({ variant: "outline", size: "sm" })}
                >
                    Cancel
                </Link>
                <SubmitButton pending={pending} size="sm" disabled={!selected || notesMissing}>
                    Publish listing
                </SubmitButton>
            </div>
        </form>
    );
}
