"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Package, Store } from "lucide-react";

const items = [
    { href: "/seller/dashboard", label: "Overview", icon: LayoutDashboard },
    { href: "/seller/dashboard/listings", label: "Listings", icon: Package },
    { href: "/seller/dashboard/settings", label: "Shop settings", icon: Store },
];

export function DashboardNav({ onNavigateAction }: { onNavigateAction?: () => void }) {
    const pathname = usePathname();

    return (
        <nav className="flex flex-col gap-0.5">
            {items.map(({ href, label, icon: Icon }) => {
                const active =
                    href === "/seller/dashboard" ? pathname === href : pathname.startsWith(href);
                return (
                    <Link
                        key={href}
                        href={href}
                        onClick={onNavigateAction}
                        aria-current={active ? "page" : undefined}
                        className={`flex items-center gap-2.5 rounded-sm px-2.5 py-2 text-sm font-medium transition-colors duration-100 ${
                            active ? "bg-brand-600 text-white" : "text-foreground hover:bg-muted"
                        }`}
                    >
                        <Icon size={16} />
                        {label}
                    </Link>
                );
            })}
        </nav>
    );
}
