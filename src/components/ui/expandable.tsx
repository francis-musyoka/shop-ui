"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

type ExpandableProps = {
    children: ReactNode;
    /** Collapsed height in px. Content taller than this gets a "See more" toggle. */
    collapsedHeight?: number;
};

/**
 * Clamps long content to `collapsedHeight` with a fading edge and a
 * "See more" / "See less" toggle. The toggle only appears when the content
 * actually overflows the collapsed height, so short content renders untouched.
 */
export function Expandable({ children, collapsedHeight = 160 }: ExpandableProps) {
    const contentRef = useRef<HTMLDivElement>(null);
    const [expanded, setExpanded] = useState(false);
    const [overflows, setOverflows] = useState(false);

    useEffect(() => {
        const el = contentRef.current;
        if (!el) return;
        setOverflows(el.scrollHeight > collapsedHeight + 4);
    }, [collapsedHeight, children]);

    const collapsed = overflows && !expanded;

    return (
        <div>
            <div
                ref={contentRef}
                style={collapsed ? { maxHeight: collapsedHeight } : undefined}
                className="relative overflow-hidden"
            >
                {children}
                {collapsed && (
                    <div
                        aria-hidden
                        className="from-background pointer-events-none absolute inset-x-0 bottom-0 h-12 bg-gradient-to-t to-transparent"
                    />
                )}
            </div>
            {overflows && (
                <button
                    type="button"
                    aria-expanded={expanded}
                    onClick={() => setExpanded((v) => !v)}
                    className="text-brand-600 dark:text-brand-400 mt-2 text-sm font-medium hover:underline"
                >
                    {expanded ? "See less" : "See more"}
                </button>
            )}
        </div>
    );
}
