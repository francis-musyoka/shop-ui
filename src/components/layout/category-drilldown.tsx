"use client";

import { useState } from "react";
import Link from "next/link";
import { ChevronRight, ChevronLeft, X } from "lucide-react";
import type { CategoryTreeNode } from "@/lib/schemas/category";

function browseHref(id: string) {
    return `/browse?categoryId=${id}`;
}

interface CategoryDrilldownProps {
    tree: CategoryTreeNode[];
    onNavigate: () => void;
}

/**
 * Drilldown category menu. `path` is a stack: [] = root, [Electronics] = one
 * level down, [Electronics, Phones] = two down. Back pops ONE level. A node
 * with children renders a drill button; a leaf renders a /browse link.
 */
export function CategoryDrilldown({ tree, onNavigate }: CategoryDrilldownProps) {
    const [path, setPath] = useState<CategoryTreeNode[]>([]);
    const current = path[path.length - 1];
    const nodes = current ? (current.children ?? []) : tree;

    const push = (node: CategoryTreeNode) => setPath((p) => [...p, node]);
    const pop = () => setPath((p) => p.slice(0, -1));

    return (
        <div className="flex h-full flex-col">
            <div className="bg-brand-800 dark:bg-brand-900 flex items-center justify-between gap-2 px-3 py-3">
                {current ? (
                    <button
                        type="button"
                        onClick={pop}
                        aria-label="Back"
                        className="flex min-w-0 items-center gap-1.5 rounded-sm py-0.5 pr-2 text-left text-base font-semibold text-white hover:bg-white/10"
                    >
                        <ChevronLeft className="size-5 shrink-0" />
                        <span className="truncate">{current.name}</span>
                    </button>
                ) : (
                    <span className="px-1 text-base font-semibold text-white">All Categories</span>
                )}
                <button
                    type="button"
                    onClick={onNavigate}
                    aria-label="Close menu"
                    className="shrink-0 rounded-sm p-1 text-white/70 hover:text-white"
                >
                    <X className="size-5" />
                </button>
            </div>

            <div className="flex-1 overflow-y-auto py-1">
                {current && (
                    <Link
                        href={browseHref(current.id)}
                        onClick={onNavigate}
                        className="text-brand-700 dark:text-brand-300 border-border hover:bg-muted flex items-center justify-between border-b px-4 py-2.5 text-sm font-semibold"
                    >
                        Shop all {current.name}
                        <ChevronRight className="size-4" />
                    </Link>
                )}

                {nodes.map((node) =>
                    node.children?.length ? (
                        <button
                            key={node.id}
                            type="button"
                            onClick={() => push(node)}
                            className="text-foreground hover:bg-muted flex w-full items-center justify-between px-4 py-2.5 text-left text-sm transition-colors"
                        >
                            {node.name}
                            <ChevronRight className="text-muted-foreground size-4" />
                        </button>
                    ) : (
                        <Link
                            key={node.id}
                            href={browseHref(node.id)}
                            onClick={onNavigate}
                            className="text-foreground hover:bg-muted flex items-center px-4 py-2.5 text-sm transition-colors"
                        >
                            {node.name}
                        </Link>
                    ),
                )}
            </div>

            {!current && (
                <div className="border-border border-t px-4 py-3">
                    <Link
                        href="/deals"
                        onClick={onNavigate}
                        className="text-accent-foreground text-sm font-medium"
                    >
                        🔥 Today&apos;s Deals
                    </Link>
                </div>
            )}
        </div>
    );
}
