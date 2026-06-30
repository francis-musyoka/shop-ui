"use client";

import { useCallback, useEffect, useRef, useState, type TouchEvent } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X } from "lucide-react";

type ProductGalleryProps = {
    images: string[];
    title: string;
};

/**
 * Vertical thumbnail rail (left) + large image (right). Thumbnails switch the
 * main image on hover/focus. Up to 5 thumbnails show (5 × 64px + 4 × 8px gaps =
 * 22rem); beyond that the rail scrolls, with a fading edge + chevron hint.
 * Clicking the main image opens a fullscreen viewer (prev/next arrows, counter,
 * swipe, ←/→/Esc keys, backdrop-to-close).
 */
export function ProductGallery({ images, title }: ProductGalleryProps) {
    const [active, setActive] = useState(0);
    const current = images[active] ?? images[0]!;
    const count = images.length;

    const railRef = useRef<HTMLDivElement>(null);
    const [canScrollUp, setCanScrollUp] = useState(false);
    const [canScrollDown, setCanScrollDown] = useState(false);

    function updateHints() {
        const el = railRef.current;
        if (!el) return;
        setCanScrollUp(el.scrollTop > 1);
        setCanScrollDown(el.scrollTop + el.clientHeight < el.scrollHeight - 1);
    }

    useEffect(() => {
        updateHints();
    }, [count]);

    const [lightboxOpen, setLightboxOpen] = useState(false);
    const showPrev = useCallback(() => setActive((a) => (a - 1 + count) % count), [count]);
    const showNext = useCallback(() => setActive((a) => (a + 1) % count), [count]);

    useEffect(() => {
        if (!lightboxOpen) return;
        function onKey(e: KeyboardEvent) {
            if (e.key === "Escape") setLightboxOpen(false);
            else if (e.key === "ArrowLeft") showPrev();
            else if (e.key === "ArrowRight") showNext();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [lightboxOpen, showPrev, showNext]);

    // Swipe: drag left → next, drag right → previous (touch devices).
    const touchStartX = useRef<number | null>(null);
    function onTouchStart(e: TouchEvent) {
        touchStartX.current = e.touches[0]?.clientX ?? null;
    }
    function onTouchEnd(e: TouchEvent) {
        const start = touchStartX.current;
        touchStartX.current = null;
        if (start == null) return;
        const dx = (e.changedTouches[0]?.clientX ?? start) - start;
        if (dx <= -40) showNext();
        else if (dx >= 40) showPrev();
    }

    return (
        <>
            <div className="flex min-w-0 flex-1 gap-3">
                <div className="relative w-16 shrink-0">
                    <div
                        ref={railRef}
                        onScroll={updateHints}
                        className="flex max-h-96 flex-col gap-2 overflow-y-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
                    >
                        {images.map((src, i) => (
                            <button
                                key={i}
                                type="button"
                                aria-label={`${title} — view ${i + 1}`}
                                aria-pressed={active === i}
                                onMouseEnter={() => setActive(i)}
                                onFocus={() => setActive(i)}
                                onClick={() => setActive(i)}
                                className={`relative aspect-square w-full shrink-0 overflow-hidden rounded-sm border bg-white transition-[border-color] duration-100 ${
                                    active === i
                                        ? "border-brand-600 dark:border-brand-400"
                                        : "border-border hover:border-foreground/40"
                                }`}
                            >
                                <Image
                                    src={src}
                                    alt=""
                                    fill
                                    unoptimized
                                    sizes="64px"
                                    className="object-contain p-1"
                                />
                            </button>
                        ))}
                    </div>

                    <div
                        aria-hidden
                        className={`from-background pointer-events-none absolute inset-x-0 top-0 flex h-7 items-start justify-center bg-gradient-to-b to-transparent transition-opacity duration-150 motion-reduce:transition-none ${
                            canScrollUp ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        <ChevronUp size={14} className="text-muted-foreground" />
                    </div>
                    <div
                        aria-hidden
                        className={`from-background pointer-events-none absolute inset-x-0 bottom-0 flex h-7 items-end justify-center bg-gradient-to-t to-transparent transition-opacity duration-150 motion-reduce:transition-none ${
                            canScrollDown ? "opacity-100" : "opacity-0"
                        }`}
                    >
                        <ChevronDown size={14} className="text-muted-foreground" />
                    </div>
                </div>

                <button
                    type="button"
                    aria-label={`View larger image of ${title}`}
                    onClick={() => setLightboxOpen(true)}
                    className="border-border relative aspect-square min-w-0 flex-1 cursor-zoom-in overflow-hidden rounded-sm border bg-white"
                >
                    <Image
                        src={current}
                        alt={title}
                        fill
                        unoptimized
                        priority
                        sizes="(max-width: 768px) 100vw, 420px"
                        className="object-contain p-6"
                    />
                </button>
            </div>

            {lightboxOpen && (
                <div
                    role="dialog"
                    aria-modal="true"
                    aria-label={`${title} image viewer`}
                    onClick={() => setLightboxOpen(false)}
                    className="bg-foreground/90 fixed inset-0 z-50 flex items-center justify-center p-4"
                >
                    <button
                        type="button"
                        aria-label="Close image viewer"
                        onClick={() => setLightboxOpen(false)}
                        className="text-background bg-foreground/40 hover:bg-foreground/60 absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full backdrop-blur-sm"
                    >
                        <X size={20} />
                    </button>

                    {count > 1 && (
                        <button
                            type="button"
                            aria-label="Previous image"
                            onClick={(e) => {
                                e.stopPropagation();
                                showPrev();
                            }}
                            className="text-background bg-foreground/40 hover:bg-foreground/60 absolute left-10 z-10 grid size-10 place-items-center rounded-full backdrop-blur-sm"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    <div
                        className="relative h-[80vh] w-[85vw] touch-pan-y"
                        onClick={(e) => e.stopPropagation()}
                        onTouchStart={onTouchStart}
                        onTouchEnd={onTouchEnd}
                    >
                        <Image
                            src={current}
                            alt={title}
                            fill
                            unoptimized
                            sizes="85vw"
                            className="object-contain"
                        />
                    </div>

                    {count > 1 && (
                        <button
                            type="button"
                            aria-label="Next image"
                            onClick={(e) => {
                                e.stopPropagation();
                                showNext();
                            }}
                            className="text-background bg-foreground/40 hover:bg-foreground/60 absolute right-10 z-10 grid size-10 place-items-center rounded-full backdrop-blur-sm"
                        >
                            <ChevronRight size={24} />
                        </button>
                    )}

                    {count > 1 && (
                        <span className="text-background bg-background/10 absolute bottom-10 left-1/2 -translate-x-1/2 rounded-sm px-3 py-1 font-mono text-sm">
                            {active + 1} / {count}
                        </span>
                    )}
                </div>
            )}
        </>
    );
}
