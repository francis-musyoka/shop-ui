"use client";

import { useEffect, useRef } from "react";

const FOCUSABLE =
    'a[href],button:not([disabled]),input:not([disabled]),select:not([disabled]),textarea:not([disabled]),[tabindex]:not([tabindex="-1"])';

/**
 * Accessibility plumbing for a hand-rolled modal/drawer/lightbox. While `open`:
 * locks body scroll, moves focus into the dialog, traps Tab within it, and
 * restores focus to the previously-focused element on close.
 *
 * Attach the returned ref to the dialog container and give it `tabIndex={-1}`.
 * Esc / backdrop close stay the caller's responsibility.
 */
export function useModalA11y<T extends HTMLElement = HTMLDivElement>(open: boolean) {
    const ref = useRef<T>(null);

    useEffect(() => {
        if (!open) return;
        const node = ref.current;
        const previouslyFocused = document.activeElement as HTMLElement | null;
        const body = document.body;
        const prevOverflow = body.style.overflow;
        body.style.overflow = "hidden";

        const focusables = () =>
            node ? Array.from(node.querySelectorAll<HTMLElement>(FOCUSABLE)) : [];

        (focusables()[0] ?? node)?.focus();

        function onKeyDown(e: KeyboardEvent) {
            if (e.key !== "Tab" || !node) return;
            const items = focusables();
            if (items.length === 0) {
                e.preventDefault();
                node.focus();
                return;
            }
            const first = items[0]!;
            const last = items[items.length - 1]!;
            const activeEl = document.activeElement;
            if (e.shiftKey && (activeEl === first || activeEl === node)) {
                e.preventDefault();
                last.focus();
            } else if (!e.shiftKey && activeEl === last) {
                e.preventDefault();
                first.focus();
            }
        }

        node?.addEventListener("keydown", onKeyDown);
        return () => {
            body.style.overflow = prevOverflow;
            node?.removeEventListener("keydown", onKeyDown);
            previouslyFocused?.focus?.();
        };
    }, [open]);

    return ref;
}
