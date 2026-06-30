"use client";

import type { DetailVariant } from "@/lib/product-detail";

type VariantSelectorProps = {
    variants: DetailVariant[];
    selected: Record<string, string>;
    onChange: (next: Record<string, string>) => void;
};

/** Distinct attribute keys across all variants, preserving first-seen order. */
function attributeGroups(variants: DetailVariant[]): { key: string; values: string[] }[] {
    const groups = new Map<string, string[]>();
    for (const v of variants) {
        for (const [key, value] of Object.entries(v.attributes)) {
            const values = groups.get(key) ?? [];
            if (!values.includes(value)) values.push(value);
            groups.set(key, values);
        }
    }
    return [...groups.entries()].map(([key, values]) => ({ key, values }));
}

function colorHexFor(variants: DetailVariant[], key: string, value: string): string | undefined {
    if (key.toLowerCase() !== "color") return undefined;
    return variants.find((v) => v.attributes[key] === value)?.colorHex ?? undefined;
}

export function VariantSelector({ variants, selected, onChange }: VariantSelectorProps) {
    const groups = attributeGroups(variants);

    return (
        <div className="space-y-3">
            {groups.map(({ key, values }) => (
                <div key={key}>
                    <p className="text-sm font-medium">{key}</p>
                    <div className="mt-1.5 flex flex-wrap gap-1.5">
                        {values.map((value) => {
                            const isSelected = selected[key] === value;
                            const hex = colorHexFor(variants, key, value);
                            if (hex) {
                                return (
                                    <button
                                        key={value}
                                        type="button"
                                        aria-label={value}
                                        aria-pressed={isSelected}
                                        onClick={() => onChange({ ...selected, [key]: value })}
                                        style={{ backgroundColor: hex }}
                                        className={`border-border relative size-5 rounded-full border-2 ${
                                            isSelected ? "ring-foreground ring-2 ring-offset-1" : ""
                                        }`}
                                    />
                                );
                            }
                            return (
                                <button
                                    key={value}
                                    type="button"
                                    aria-pressed={isSelected}
                                    onClick={() => onChange({ ...selected, [key]: value })}
                                    className={`border-border rounded-sm border px-3 py-1 text-xs transition-colors duration-100 ${
                                        isSelected
                                            ? "border-foreground bg-muted"
                                            : "hover:border-foreground/40"
                                    }`}
                                >
                                    {value}
                                </button>
                            );
                        })}
                    </div>
                </div>
            ))}
        </div>
    );
}
