import Link from "next/link";
import { redirect } from "next/navigation";
import { User } from "lucide-react";
import { getMyShop } from "@/lib/api/shops";
import { ApiError } from "@/lib/api/errors";
import { SidebarContent } from "@/components/seller/sidebar-content";
import { MobileSidebar } from "@/components/seller/mobile-sidebar";
import { ShopStatusNotice } from "@/components/seller/shop-status-notice";

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
    let shop;
    try {
        shop = await getMyShop();
    } catch (err) {
        if (err instanceof ApiError && err.statusCode === 404) {
            redirect("/seller/sell");
        }
        throw err;
    }

    return (
        <div className="bg-background min-h-screen">
            {/* Brand top bar */}
            <header className="bg-brand-800 dark:bg-brand-900">
                <div className="flex h-14 items-center gap-3 px-4 md:px-6">
                    <MobileSidebar shop={shop} />
                    <Link
                        href="/"
                        className="font-[family-name:var(--font-brand)] text-xl font-bold text-white"
                    >
                        Riverflow
                    </Link>
                    <span className="text-brand-200 hidden text-sm sm:inline">|</span>
                    <span className="text-brand-100 hidden text-sm font-medium sm:inline">
                        Seller Center
                    </span>
                    <div className="ml-auto flex items-center gap-2 text-white">
                        <User size={18} />
                        <span className="hidden text-sm sm:inline">{shop.name}</span>
                    </div>
                </div>
            </header>

            <div className="flex gap-6 px-4 py-6 md:px-6">
                {/* Sidebar */}
                <aside className="hidden w-56 shrink-0 md:block">
                    <SidebarContent shop={shop} />
                </aside>

                {/* Content */}
                <main className="min-w-0 flex-1">
                    <div className="flex flex-col gap-6">
                        <ShopStatusNotice status={shop.status} />
                        {children}
                    </div>
                </main>
            </div>
        </div>
    );
}
