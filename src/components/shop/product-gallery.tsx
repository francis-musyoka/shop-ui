"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ChevronDown, ChevronUp, ChevronLeft, ChevronRight, X } from "lucide-react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    type CarouselApi,
} from "@/components/ui/carousel";

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
    const [lightboxApi, setLightboxApi] = useState<CarouselApi>();

    const [mobileApi, setMobileApi] = useState<CarouselApi>();
    const [mobileActive, setMobileActive] = useState(0);

    // Track the mobile carousel's position so the dots can reflect it.
    useEffect(() => {
        if (!mobileApi) return;
        const api = mobileApi;
        const onSelect = () => setMobileActive(api.selectedScrollSnap());
        onSelect();
        api.on("select", onSelect);
        return () => {
            api.off("select", onSelect);
        };
    }, [mobileApi]);

    // Carousel owns swipe/drag paging; mirror its position back to `active` so the
    // inline gallery (main image + thumbnail highlight) reflects where the viewer landed.
    useEffect(() => {
        if (!lightboxApi) return;
        const api = lightboxApi;
        const onSelect = () => setActive(api.selectedScrollSnap());
        api.on("select", onSelect);
        return () => {
            api.off("select", onSelect);
        };
    }, [lightboxApi]);

    // Global ←/→ paging while the viewer is open (Dialog traps focus here).
    useEffect(() => {
        if (!lightboxOpen || !lightboxApi) return;
        const api = lightboxApi;
        function onKey(e: KeyboardEvent) {
            if (e.key === "ArrowLeft") api.scrollPrev();
            else if (e.key === "ArrowRight") api.scrollNext();
        }
        window.addEventListener("keydown", onKey);
        return () => window.removeEventListener("keydown", onKey);
    }, [lightboxOpen, lightboxApi]);

    return (
        <>
            {/* Mobile: full-width swipeable carousel (no rail, no lightbox) */}
            <div className="md:hidden">
                <Carousel
                    opts={{ loop: false }}
                    setApi={setMobileApi}
                    aria-label={`${title} images`}
                >
                    <CarouselContent>
                        {images.map((src, i) => (
                            <CarouselItem key={i}>
                                <div className="border-border relative aspect-square overflow-hidden rounded-sm border bg-white">
                                    <Image
                                        src={src}
                                        alt={title}
                                        fill
                                        unoptimized
                                        priority={i === 0}
                                        sizes="100vw"
                                        className="object-contain p-6"
                                    />
                                </div>
                            </CarouselItem>
                        ))}
                    </CarouselContent>
                </Carousel>
                {count > 1 && (
                    <div
                        data-testid="gallery-dots"
                        className="mt-3 flex justify-center gap-1.5"
                        aria-hidden
                    >
                        {images.map((_, i) => (
                            <span
                                key={i}
                                className={`size-1.5 rounded-full transition-colors ${
                                    i === mobileActive ? "bg-foreground" : "bg-muted-foreground/30"
                                }`}
                            />
                        ))}
                    </div>
                )}
            </div>
            <div className="hidden min-w-0 flex-1 gap-3 md:flex">
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

            <Dialog open={lightboxOpen} onOpenChange={setLightboxOpen}>
                <DialogContent
                    showCloseButton={false}
                    aria-label={`${title} image viewer`}
                    onClick={() => setLightboxOpen(false)}
                    /* fullscreen media viewer: fill the viewport, drop the card chrome */
                    style={{ width: "100vw", height: "100vh", maxWidth: "none", borderRadius: 0 }}
                    className="bg-foreground/90 flex items-center justify-center p-4"
                >
                    <DialogTitle className="sr-only">{`${title} image viewer`}</DialogTitle>

                    <button
                        type="button"
                        aria-label="Close image viewer"
                        onClick={() => setLightboxOpen(false)}
                        className="text-background bg-foreground/40 hover:bg-foreground/60 absolute top-4 right-4 z-10 grid size-9 place-items-center rounded-full backdrop-blur-sm"
                    >
                        <X size={20} />
                    </button>

                    <Carousel
                        opts={{ loop: true, startIndex: active }}
                        setApi={setLightboxApi}
                        className="w-full"
                    >
                        <CarouselContent>
                            {images.map((src, i) => (
                                <CarouselItem key={i} className="flex items-center justify-center">
                                    <div
                                        className="relative h-[80vh] w-[85vw]"
                                        onClick={(e) => e.stopPropagation()}
                                    >
                                        <Image
                                            src={src}
                                            alt={title}
                                            fill
                                            unoptimized
                                            sizes="85vw"
                                            className="object-contain"
                                        />
                                    </div>
                                </CarouselItem>
                            ))}
                        </CarouselContent>
                    </Carousel>

                    {count > 1 && (
                        <button
                            type="button"
                            aria-label="Previous image"
                            onClick={(e) => {
                                e.stopPropagation();
                                lightboxApi?.scrollPrev();
                            }}
                            className="text-background bg-foreground/40 hover:bg-foreground/60 absolute left-10 z-10 grid size-10 place-items-center rounded-full backdrop-blur-sm"
                        >
                            <ChevronLeft size={24} />
                        </button>
                    )}

                    {count > 1 && (
                        <button
                            type="button"
                            aria-label="Next image"
                            onClick={(e) => {
                                e.stopPropagation();
                                lightboxApi?.scrollNext();
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
                </DialogContent>
            </Dialog>
        </>
    );
}
