"use client";

import { useState, type ReactNode } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatPrice } from "@/lib/formatPrice";
import type { CONDITIONS } from "@/lib/schemas/offer";

type Condition = (typeof CONDITIONS)[number];

export interface OfferFieldsDefaults {
    price?: number;
    discount?: number;
    quantity?: number;
    deliveryDays?: number | null;
    warrantyMonths?: number | null;
    conditionNotes?: string | null;
}

interface OfferFieldsProps {
    // "create" shows every field (used by the add-listing form); "edit" composes
    // quantity/delivery/warranty/conditionNotes only (price changes go through the
    // dedicated "price" variant/dialog, not the edit form); "price" shows only
    // price/discount with the live "Buyers pay" preview.
    variant: "create" | "edit" | "price";
    defaults?: OfferFieldsDefaults;
    fieldErrors: Record<string, string[]>;
    condition: Condition;
}

// Small local field wrapper — label + control stacked.
function Field({ label, children }: { label: ReactNode; children: ReactNode }) {
    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-sm">{label}</Label>
            {children}
        </div>
    );
}

function FieldError({ messages }: { messages?: string[] }) {
    if (!messages?.[0]) return null;
    return <span className="text-destructive text-xs">{messages[0]}</span>;
}

// Shared offer field markup — used by the listing row actions dialogs (edit/set price)
// and, eventually, the add-listing form. Inputs are uncontrolled (name= + defaultValue)
// so they submit through a plain <form action={...}>; price/discount also track a bit
// of local state purely to drive the "Buyers pay" preview.
export function OfferFields({ variant, defaults, fieldErrors, condition }: OfferFieldsProps) {
    const showPrice = variant === "create" || variant === "price";
    const showInventory = variant === "create" || variant === "edit";
    const showConditionNotes = showInventory && condition === "USED";

    const [price, setPrice] = useState(String(defaults?.price ?? ""));
    const [discount, setDiscount] = useState(String(defaults?.discount ?? 0));
    const buyersPay = Math.round((Number(price) || 0) * (1 - (Number(discount) || 0) / 100));

    return (
        <>
            {showPrice && (
                <>
                    <Field
                        label={
                            <>
                                Price (KSh) <span className="text-destructive">*</span>
                            </>
                        }
                    >
                        <Input
                            name="price"
                            inputMode="numeric"
                            defaultValue={price}
                            onChange={(e) => setPrice(e.target.value)}
                            aria-invalid={!!fieldErrors.price?.[0]}
                            className="h-10 font-mono"
                        />
                        <FieldError messages={fieldErrors.price} />
                    </Field>
                    <Field label="Discount (%)">
                        <Input
                            name="discount"
                            inputMode="numeric"
                            defaultValue={discount}
                            onChange={(e) => setDiscount(e.target.value)}
                            aria-invalid={!!fieldErrors.discount?.[0]}
                            className="h-10 font-mono"
                        />
                        <FieldError messages={fieldErrors.discount} />
                    </Field>
                    <div className="border-border bg-muted/40 flex items-center justify-between rounded-sm border px-3 py-2.5">
                        <span className="text-muted-foreground text-sm">Buyers pay</span>
                        <span className="text-brand-800 dark:text-gold-300 font-mono text-sm font-semibold">
                            {formatPrice(buyersPay)}
                        </span>
                    </div>
                </>
            )}

            {showInventory && (
                <>
                    <Field
                        label={
                            <>
                                Quantity in stock <span className="text-destructive">*</span>
                            </>
                        }
                    >
                        <Input
                            name="quantity"
                            inputMode="numeric"
                            defaultValue={defaults?.quantity ?? ""}
                            aria-invalid={!!fieldErrors.quantity?.[0]}
                            className="h-10 font-mono"
                        />
                        <FieldError messages={fieldErrors.quantity} />
                    </Field>
                    <div className="grid grid-cols-2 gap-4">
                        <Field label="Delivery time (days)">
                            <Input
                                name="deliveryDays"
                                inputMode="numeric"
                                defaultValue={defaults?.deliveryDays ?? ""}
                                placeholder="e.g. 2"
                                aria-invalid={!!fieldErrors.deliveryDays?.[0]}
                                className="h-10 font-mono"
                            />
                            <FieldError messages={fieldErrors.deliveryDays} />
                        </Field>
                        <Field label="Warranty (months)">
                            <Input
                                name="warrantyMonths"
                                inputMode="numeric"
                                defaultValue={defaults?.warrantyMonths ?? ""}
                                placeholder="e.g. 12"
                                aria-invalid={!!fieldErrors.warrantyMonths?.[0]}
                                className="h-10 font-mono"
                            />
                            <FieldError messages={fieldErrors.warrantyMonths} />
                        </Field>
                    </div>
                </>
            )}

            {showConditionNotes && (
                <Field
                    label={
                        <>
                            Condition notes <span className="text-destructive">*</span>
                        </>
                    }
                >
                    <Textarea
                        name="conditionNotes"
                        rows={3}
                        defaultValue={defaults?.conditionNotes ?? ""}
                        placeholder="Describe wear, scratches, missing accessories…"
                        aria-invalid={!!fieldErrors.conditionNotes?.[0]}
                    />
                    <FieldError messages={fieldErrors.conditionNotes} />
                </Field>
            )}
        </>
    );
}
