import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { Navbar } from "@/components/layout/navbar";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
    const session = await getSession();

    return (
        <>
            <header className="border-border bg-brand-800 border-b">
                <div className="mx-auto flex h-14 max-w-7xl items-center justify-between px-4">
                    <Link
                        href="/"
                        className="font-[family-name:var(--font-brand)] text-lg font-bold text-white"
                    >
                        Riverflow
                    </Link>
                    <Navbar user={session?.user ?? null} />
                </div>
            </header>
            <div className="flex-1">{children}</div>
            <footer className="border-border bg-background border-t">
                <div className="text-muted-foreground mx-auto max-w-7xl px-4 py-8 text-center text-sm">
                    &copy; 2026 Riverflow
                </div>
            </footer>
        </>
    );
}
