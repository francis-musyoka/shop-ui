import Link from "next/link";
import { Navbar } from "@/components/layout/navbar";
import { SearchBar } from "@/components/layout/search-bar";
import { CategoryBar } from "@/components/layout/category-bar";
import type { Customer } from "@/lib/schemas/customer";
import type { Category } from "@/lib/schemas/category";

interface SiteHeaderProps {
    user: Customer | null;
    categories: Category[];
}

export function SiteHeader({ user, categories }: SiteHeaderProps) {
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
                        <SearchBar
                            placeholder="Search products, brands, and categories"
                            className="w-full"
                            categories={categories}
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
            {categories.length > 0 && <CategoryBar categories={categories} />}
        </>
    );
}
