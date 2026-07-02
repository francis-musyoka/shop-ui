"use client";

import { useState, useCallback } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight } from "lucide-react";
import type { Category } from "@/lib/schemas/category";
import { Sheet, SheetClose, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";

interface CategoryBarProps {
    categories: Category[];
}

/** Max categories to show in the horizontal bar */
const MAX_VISIBLE = 8;

export function CategoryBar({ categories }: CategoryBarProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const visible = categories.slice(0, MAX_VISIBLE);

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
                    <SheetHeader className="bg-brand-800 dark:bg-brand-900 flex-row items-center justify-between px-4 py-3">
                        <SheetTitle className="text-base font-semibold text-white">
                            All Categories
                        </SheetTitle>
                        <SheetClose
                            className="rounded-sm p-1 text-white/70 hover:text-white"
                            aria-label="Close menu"
                        >
                            <X className="size-5" />
                        </SheetClose>
                    </SheetHeader>

                    <div className="flex-1 overflow-y-auto py-2">
                        {categories.map((cat) => (
                            <Link
                                key={cat.id}
                                href={`/browse?categoryId=${cat.id}`}
                                onClick={closeDrawer}
                                className="text-foreground hover:bg-muted flex items-center justify-between px-4 py-2.5 text-sm transition-colors"
                            >
                                {cat.name}
                                <ChevronRight className="text-muted-foreground size-4" />
                            </Link>
                        ))}
                    </div>

                    <div className="border-border border-t px-4 py-3">
                        <Link
                            href="/deals"
                            onClick={closeDrawer}
                            className="text-accent-foreground text-sm font-medium"
                        >
                            🔥 Today&apos;s Deals
                        </Link>
                    </div>
                </SheetContent>
            </Sheet>
        </>
    );
}
