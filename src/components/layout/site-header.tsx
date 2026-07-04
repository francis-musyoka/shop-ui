import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { SearchBar } from "@/components/layout/search-bar";
import { CategoryBar } from "@/components/layout/category-bar";
import { getSession } from "@/lib/auth/session";
import { getCategoryTree } from "@/lib/api/categories";

export async function SiteHeader() {
    const [session, tree] = await Promise.all([
        getSession(),
        getCategoryTree().catch((error) => {
            // Category bar is non-critical chrome — degrade to no bar, but keep the
            // failure (incl. schema drift) visible in server logs rather than silent.
            console.error("SiteHeader: failed to load category tree", error);
            return [];
        }),
    ]);
    const user = session?.user ?? null;
    const topLevel = tree.map(({ id, name, slug }) => ({ id, name, slug }));

    return (
        <>
            <header className="bg-brand-800 dark:bg-brand-900">
                <div className="flex h-16 items-center gap-4 px-4 md:gap-6 md:px-6">
                    <Link
                        href="/"
                        className="shrink-0 font-[family-name:var(--font-brand)] text-xl font-bold text-white"
                    >
                        Riverflow
                    </Link>
                    <div className="hidden flex-1 sm:flex">
                        <SearchBar
                            placeholder="Search products, brands, and categories"
                            className="w-full"
                            categories={topLevel}
                        />
                    </div>
                    <Navbar user={user} />
                </div>
            </header>

            {/* Mobile search */}
            <div className="bg-brand-700 px-4 py-2 sm:hidden">
                <SearchBar placeholder="Search products..." className="w-full" />
            </div>

            {/* Category bar */}
            {tree.length > 0 && <CategoryBar tree={tree} />}
        </>
    );
}
