import type { ReactNode } from "react";

// Card-style page header shared across Seller Center pages (Overview, Listings, ...)
// so the top of every page reads consistently.
export function PageHeader({
    title,
    description,
    actions,
}: {
    title: ReactNode;
    description?: ReactNode;
    actions?: ReactNode;
}) {
    return (
        <div className="border-border bg-card flex flex-wrap items-center justify-between gap-3 rounded-sm border px-5 py-5">
            <div>
                <h1 className="font-(family-name:--font-brand) text-xl font-bold">{title}</h1>
                {description && <p className="text-muted-foreground text-sm">{description}</p>}
            </div>
            {actions && <div className="flex gap-2">{actions}</div>}
        </div>
    );
}
