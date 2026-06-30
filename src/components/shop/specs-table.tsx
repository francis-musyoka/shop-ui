export function SpecsTable({ specs }: { specs: Record<string, string> }) {
    const entries = Object.entries(specs);
    if (entries.length === 0) return null;

    return (
        <div className="border-border mt-3 rounded-sm border">
            <dl className="divide-border divide-y">
                {entries.map(([label, value]) => (
                    <div
                        key={label}
                        className="grid grid-cols-[140px_1fr] px-3 py-2 text-sm md:grid-cols-[200px_1fr]"
                    >
                        <dt className="text-muted-foreground">{label}</dt>
                        <dd className="text-foreground">{value}</dd>
                    </div>
                ))}
            </dl>
        </div>
    );
}
