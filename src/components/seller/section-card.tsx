import type { ReactNode } from "react";

export function SectionCard({
    title,
    description,
    action,
    children,
}: {
    title: string;
    description?: string;
    action?: ReactNode;
    children: ReactNode;
}) {
    return (
        <section className="border-border bg-card rounded-sm border">
            <div className="border-border flex items-start justify-between gap-4 border-b px-4 py-3">
                <div>
                    <h2 className="text-md font-semibold">{title}</h2>
                    {description && (
                        <p className="text-muted-foreground mt-0.5 text-sm">{description}</p>
                    )}
                </div>
                {action}
            </div>
            <div className="p-4">{children}</div>
        </section>
    );
}
