"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Menu } from "lucide-react";
import type { CategoryTreeNode } from "@/lib/schemas/category";
import { Sheet, SheetContent, SheetTitle } from "@/components/ui/sheet";
import { CategoryDrilldown } from "./category-drilldown";

interface CategoryBarProps {
    tree: CategoryTreeNode[];
}

/** Max categories to show in the horizontal bar */
const MAX_VISIBLE = 8;

export function CategoryBar({ tree }: CategoryBarProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const visible = tree.slice(0, MAX_VISIBLE);
    const closeDrawer = useCallback(() => setDrawerOpen(false), []);

    return (
        <>
            <nav className="bg-brand-700 dark:bg-brand-800">
                <div className="flex items-center gap-1 overflow-x-auto px-4 py-1.5 md:px-6 [&::-webkit-scrollbar]:hidden">
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        className="flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1 text-sm font-semibold text-white hover:bg-white/10"
                    >
                        <Menu className="size-4" />
                        All
                    </button>

                    {visible.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/browse?categoryId=${cat.id}`}
                            className="text-brand-100 shrink-0 rounded-sm px-2.5 py-1 text-sm hover:bg-white/10 hover:text-white"
                        >
                            {cat.name}
                        </Link>
                    ))}

                    <Link
                        href="/deals"
                        className="text-accent shrink-0 rounded-sm px-2.5 py-1 text-sm font-medium hover:bg-white/10"
                    >
                        Today&apos;s Deals
                    </Link>
                </div>
            </nav>

            <Sheet open={drawerOpen} onOpenChange={setDrawerOpen}>
                <SheetContent
                    side="left"
                    showCloseButton={false}
                    style={{ width: "18rem" }}
                    className="gap-0 p-0"
                >
                    <SheetTitle className="sr-only">All Categories</SheetTitle>
                    <CategoryDrilldown tree={tree} onNavigate={closeDrawer} />
                </SheetContent>
            </Sheet>
        </>
    );
}
