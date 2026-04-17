"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Link from "next/link";
import { Menu, X, ChevronRight } from "lucide-react";
import type { Category } from "@/lib/schemas/category";

interface CategoryBarProps {
    categories: Category[];
}

/** Max categories to show in the horizontal bar */
const MAX_VISIBLE = 8;

export function CategoryBar({ categories }: CategoryBarProps) {
    const [drawerOpen, setDrawerOpen] = useState(false);
    const visible = categories.slice(0, MAX_VISIBLE);
    const drawerRef = useRef<HTMLDivElement>(null);
    const closeButtonRef = useRef<HTMLButtonElement>(null);

    // Focus trap + Escape key
    useEffect(() => {
        if (!drawerOpen) return;

        // Focus the close button on open
        closeButtonRef.current?.focus();

        function handleKeyDown(e: KeyboardEvent) {
            if (e.key === "Escape") {
                setDrawerOpen(false);
                return;
            }

            // Focus trap — Tab cycles within drawer
            if (e.key === "Tab" && drawerRef.current) {
                const focusable = drawerRef.current.querySelectorAll<HTMLElement>(
                    'a, button, [tabindex]:not([tabindex="-1"])',
                );
                if (focusable.length === 0) return;
                const first = focusable[0]!;
                const last = focusable[focusable.length - 1]!;

                if (e.shiftKey && document.activeElement === first) {
                    e.preventDefault();
                    last.focus();
                } else if (!e.shiftKey && document.activeElement === last) {
                    e.preventDefault();
                    first.focus();
                }
            }
        }

        document.addEventListener("keydown", handleKeyDown);
        return () => document.removeEventListener("keydown", handleKeyDown);
    }, [drawerOpen]);

    // Prevent body scroll when drawer open
    useEffect(() => {
        if (drawerOpen) {
            document.body.style.overflow = "hidden";
        } else {
            document.body.style.overflow = "";
        }
        return () => {
            document.body.style.overflow = "";
        };
    }, [drawerOpen]);

    const closeDrawer = useCallback(() => setDrawerOpen(false), []);

    return (
        <>
            <nav className="bg-brand-700 dark:bg-brand-800">
                <div className="flex items-center gap-1 overflow-x-auto px-4 py-1.5 md:px-6 [&::-webkit-scrollbar]:hidden">
                    {/* All — opens drawer */}
                    <button
                        type="button"
                        onClick={() => setDrawerOpen(true)}
                        className="flex shrink-0 items-center gap-1.5 rounded-sm px-2.5 py-1 text-sm font-semibold text-white hover:bg-white/10"
                    >
                        <Menu className="size-4" />
                        All
                    </button>

                    {/* Category links */}
                    {visible.map((cat) => (
                        <Link
                            key={cat.id}
                            href={`/browse?categoryId=${cat.id}`}
                            className="text-brand-100 shrink-0 rounded-sm px-2.5 py-1 text-sm hover:bg-white/10 hover:text-white"
                        >
                            {cat.name}
                        </Link>
                    ))}

                    {/* Today's Deals */}
                    <Link
                        href="/deals"
                        className="text-accent shrink-0 rounded-sm px-2.5 py-1 text-sm font-medium hover:bg-white/10"
                    >
                        Today&apos;s Deals
                    </Link>
                </div>
            </nav>

            {/* Category drawer — slides in from left */}
            {drawerOpen && (
                <div
                    className="fixed inset-0 z-50 flex"
                    role="dialog"
                    aria-modal="true"
                    aria-label="All Categories"
                >
                    {/* Backdrop */}
                    <div
                        className="fixed inset-0 bg-black/50"
                        onClick={closeDrawer}
                        aria-hidden="true"
                    />

                    {/* Drawer panel */}
                    <div
                        ref={drawerRef}
                        className="bg-card relative z-10 flex h-full w-72 flex-col shadow-lg"
                    >
                        {/* Drawer header */}
                        <div className="bg-brand-800 dark:bg-brand-900 flex items-center justify-between px-4 py-3">
                            <span className="text-base font-semibold text-white">
                                All Categories
                            </span>
                            <button
                                ref={closeButtonRef}
                                type="button"
                                onClick={closeDrawer}
                                className="rounded-sm p-1 text-white/70 hover:text-white"
                                aria-label="Close menu"
                            >
                                <X className="size-5" />
                            </button>
                        </div>

                        {/* Category list */}
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

                        {/* Drawer footer */}
                        <div className="border-border border-t px-4 py-3">
                            <Link
                                href="/deals"
                                onClick={closeDrawer}
                                className="text-accent-foreground text-sm font-medium"
                            >
                                🔥 Today&apos;s Deals
                            </Link>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
