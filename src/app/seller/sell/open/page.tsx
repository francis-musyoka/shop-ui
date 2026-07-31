import Link from "next/link";
import { redirect } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { getCategoryTree } from "@/lib/api/categories";
import { requireAuth } from "@/lib/auth/require-auth";
import { isSeller } from "@/lib/seller/is-seller";
import { OpenShopForm } from "./open-shop-form";

// Create-shop entry point. If the seller already has a shop, there's nothing to open —
// send them straight to the dashboard. Otherwise load the category tree the picker needs.
export default async function OpenShopPage() {
    const session = await requireAuth();
    if (isSeller(session.user)) {
        redirect("/seller/dashboard");
    }

    const tree = await getCategoryTree();

    return (
        <div className="bg-background min-h-screen">
            <header className="bg-brand-800 dark:bg-brand-900">
                <div className="flex h-14 items-center gap-3 px-4 md:px-6">
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
                </div>
            </header>

            <div className="mx-auto flex max-w-7xl flex-col gap-6 px-4 py-8">
                <nav className="text-muted-foreground flex items-center gap-1 text-sm">
                    <Link href="/seller/sell" className="hover:text-foreground">
                        Start selling
                    </Link>
                    <ChevronRight size={14} />
                    <span className="text-foreground">Open your shop</span>
                </nav>

                <div className="border-border bg-card rounded-sm border px-5 py-5">
                    <h1 className="font-[family-name:var(--font-brand)] text-xl font-bold">
                        Open your shop
                    </h1>
                    <p className="text-muted-foreground text-sm">
                        Tell us about your shop. Fields marked{" "}
                        <span className="text-destructive" aria-hidden>
                            *
                        </span>{" "}
                        are required. Your shop is reviewed before it goes live.
                    </p>
                </div>

                <OpenShopForm categories={tree} />
            </div>
        </div>
    );
}
