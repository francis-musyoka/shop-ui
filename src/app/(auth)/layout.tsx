import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-[380px]">
                <Link
                    href="/"
                    className="text-brand-800 dark:text-brand-200 mb-6 block text-center font-[family-name:var(--font-brand)] text-xl font-bold"
                >
                    Riverflow
                </Link>
                <div className="border-border bg-card rounded-sm border p-6 shadow-none">
                    {children}
                </div>
            </div>
        </main>
    );
}
