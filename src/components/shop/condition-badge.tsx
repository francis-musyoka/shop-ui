import { Badge } from "@/components/ui/badge";

const CONDITION_CONFIG = {
    NEW: { label: "New", className: "bg-brand-50 text-brand-700 border-brand-200" },
    USED: { label: "Used", className: "bg-gold-100 text-gold-600 border-gold-200" },
    REFURBISHED: {
        label: "Refurbished",
        className: "bg-muted text-muted-foreground border-transparent",
    },
} as const;

export function ConditionBadge({ condition }: { condition: keyof typeof CONDITION_CONFIG }) {
    const c = CONDITION_CONFIG[condition];
    return (
        <Badge variant="outline" className={`py-1 text-sm ${c.className}`}>
            {c.label}
        </Badge>
    );
}
