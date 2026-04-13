export default function ShopLayout({ children }: { children: React.ReactNode }) {
    return (
        <>
            <header className="border-border bg-background border-b">
                <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4">
                    <div className="text-lg font-semibold">Riverflow</div>
                    <nav className="text-muted-foreground text-sm">
                        {/* Navbar components land in Plan 03/04 */}
                        <span>Nav placeholder</span>
                    </nav>
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
