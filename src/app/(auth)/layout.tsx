import Link from "next/link";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
    return (
        <main className="flex flex-1 items-center justify-center p-6">
            <div className="w-full max-w-md">
                <Link href="/" className="mb-6 block text-center text-lg font-semibold">
                    Riverflow
                </Link>
                <div className="border-border bg-card rounded-lg border p-6 shadow-sm">
                    {children}
                </div>
            </div>
        </main>
    );
}
