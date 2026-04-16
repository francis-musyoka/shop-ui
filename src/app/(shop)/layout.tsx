import Link from "next/link";
import { getSession } from "@/lib/auth/session";
import { getTopLevelCategories } from "@/lib/api/categories";
import { Navbar } from "@/components/layout/navbar";
import { SearchBar } from "@/components/layout/search-bar";
import { CategoryBar } from "@/components/layout/category-bar";
import { Footer } from "@/components/layout/footer";

export default async function ShopLayout({ children }: { children: React.ReactNode }) {
    const [session, categories] = await Promise.all([
        getSession(),
        getTopLevelCategories().catch(() => []),
    ]);

    return (
        <>
            <header className="bg-brand-800 dark:bg-brand-900">
                <div className="flex h-[60px] items-center gap-4 px-4 md:gap-6 md:px-6">
                    <Link
                        href="/"
                        className="shrink-0 font-[family-name:var(--font-brand)] text-xl font-bold text-white"
                    >
                        Riverflow
                    </Link>
                    <div className="hidden flex-1 sm:flex">
                        <SearchBar className="w-full" categories={categories} />
                    </div>
                    <Navbar user={session?.user ?? null} />
                </div>
            </header>
            {/* Mobile search */}
            <div className="bg-brand-700 px-4 py-2 sm:hidden">
                <SearchBar className="w-full" />
            </div>
            {/* Category bar */}
            {categories.length > 0 && <CategoryBar categories={categories} />}
            <div className="flex-1">{children}</div>
            <Footer />
        </>
    );
}
