import type { ReactNode } from "react";

const STAT_TONE_CLASSNAME = {
    default: "text-foreground",
    warning: "text-gold-500",
    critical: "text-destructive",
} as const;

export function StatTile({
    label,
    value,
    hint,
    comingSoon,
    tone = "default",
}: {
    label: string;
    value: ReactNode;
    hint?: string;
    comingSoon?: boolean;
    /** Colors the value to signal severity — e.g. a stock count that needs restocking. */
    tone?: keyof typeof STAT_TONE_CLASSNAME;
}) {
    return (
        <div className="border-border bg-card flex flex-col gap-1 rounded-sm border p-4">
            <span className="text-muted-foreground text-xs font-medium tracking-wide uppercase">
                {label}
            </span>
            <span
                className={`font-mono text-2xl font-semibold ${
                    comingSoon ? "text-muted-foreground/50" : STAT_TONE_CLASSNAME[tone]
                }`}
            >
                {value}
            </span>
            {hint && <span className="text-muted-foreground text-xs">{hint}</span>}
            {comingSoon && (
                <span className="text-muted-foreground/60 text-[11px] italic">Coming soon</span>
            )}
        </div>
    );
}
