import { Badge } from "@/components/ui/badge";

const LABELS = {
    NEW: "New",
    USED: "Used",
    REFURBISHED: "Refurbished",
} as const;

export function ConditionBadge({ condition }: { condition: keyof typeof LABELS }) {
    return (
        <Badge variant="outline" className="border-accent text-muted-foreground py-1 text-sm">
            Status: {LABELS[condition]}
        </Badge>
    );
}
