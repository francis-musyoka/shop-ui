"use client";

import { cn } from "@/lib/utils";
import { BUSINESS_TYPES } from "@/lib/schemas/seller-shop";

export type BusinessType = (typeof BUSINESS_TYPES)[number];

const OPTIONS: { value: BusinessType; label: string }[] = [
    { value: "INDIVIDUAL", label: "Individual" },
    { value: "REGISTERED", label: "Registered" },
];

interface BusinessTypeToggleProps {
    value: BusinessType;
    onValueChangeAction: (v: BusinessType) => void;
    disabled?: boolean;
}

// Two-way toggle between the shop's business type options. Shared by the open-shop
// and shop-settings forms — the caller owns the value + a hidden input so it round-trips
// through a plain <form> like every other field in these forms.
export function BusinessTypeToggle({
    value,
    onValueChangeAction,
    disabled,
}: BusinessTypeToggleProps) {
    return (
        <div className="flex gap-1.5">
            {OPTIONS.map((o) => {
                const active = value === o.value;
                return (
                    <button
                        key={o.value}
                        type="button"
                        aria-pressed={active}
                        disabled={disabled}
                        onClick={() => onValueChangeAction(o.value)}
                        className={cn(
                            "h-10 flex-1 rounded-sm border text-sm font-medium disabled:opacity-50",
                            active
                                ? "border-brand-600 bg-brand-50 text-brand-700 dark:bg-brand-400/10 dark:text-brand-400"
                                : "border-input text-muted-foreground hover:bg-muted",
                        )}
                    >
                        {o.label}
                    </button>
                );
            })}
        </div>
    );
}
