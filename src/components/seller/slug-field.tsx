"use client";

import { useEffect, useState } from "react";
import { Check, X, Loader2 } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { isValidShopSlug } from "@/lib/shop-slug";
import { useSlugAvailability } from "@/lib/hooks/use-slug-availability";

type SlugStatus = "idle" | "invalid" | "checking" | "available" | "taken";

interface SlugFieldProps {
    value: string;
    onValueChangeAction: (v: string) => void;
    excludeSlug?: string;
    required?: boolean;
    label?: string;
}

// Slug input with format validation + debounced live availability check. Shared by the
// open-shop and shop-settings forms. `excludeSlug` (settings) treats the shop's current
// slug as unchanged so it doesn't flag itself as taken.
export function SlugField({
    value,
    onValueChangeAction,
    excludeSlug,
    required,
    label = "Slug",
}: SlugFieldProps) {
    const trimmed = value.trim();

    // Debounce the value fed to the real availability check so we don't fire a
    // request on every keystroke — 400ms local timer, no external library.
    const [debounced, setDebounced] = useState(trimmed);
    useEffect(() => {
        const t = setTimeout(() => setDebounced(trimmed), 400);
        return () => clearTimeout(t);
    }, [trimmed]);

    const validFormat = isValidShopSlug(trimmed);
    const unchanged = trimmed.length === 0 || trimmed === excludeSlug;
    const { data, isFetching } = useSlugAvailability(debounced, excludeSlug);

    let status: SlugStatus = "idle";
    if (!unchanged) {
        if (!validFormat) {
            status = "invalid";
        } else if (debounced !== trimmed || isFetching || data === undefined) {
            status = "checking";
        } else {
            status = data.available ? "available" : "taken";
        }
    }

    return (
        <div className="flex flex-col gap-1.5">
            <Label className="text-sm">
                {label}
                {required && (
                    <span className="text-destructive ml-0.5" aria-hidden>
                        *
                    </span>
                )}
            </Label>
            <Input
                name="slug"
                value={value}
                onChange={(e) => onValueChangeAction(e.target.value)}
                placeholder="river_tech"
                aria-invalid={status === "invalid" || status === "taken"}
                className="h-10"
            />
            <SlugStatusHint status={status} slug={trimmed} />
        </div>
    );
}

function SlugStatusHint({ status, slug }: { status: SlugStatus; slug: string }) {
    if (status === "invalid") {
        return (
            <span className="text-destructive text-xs">
                Use lowercase letters, numbers and underscores (at least 2 characters).
            </span>
        );
    }
    if (status === "checking") {
        return (
            <span className="text-muted-foreground flex items-center gap-1 text-xs">
                <Loader2 className="animate-spin" size={12} /> Checking availability…
            </span>
        );
    }
    if (status === "available") {
        return (
            <span className="text-success flex items-center gap-1 text-xs">
                <Check size={12} /> riverflow.co.ke/shops/{slug} is available
            </span>
        );
    }
    if (status === "taken") {
        return (
            <span className="text-destructive flex items-center gap-1 text-xs">
                <X size={12} /> That slug is already taken — try another.
            </span>
        );
    }
    return (
        <span className="text-muted-foreground text-xs">
            Your storefront: riverflow.co.ke/shops/{slug || "your_slug"} — lowercase letters,
            numbers and underscores only.
        </span>
    );
}
