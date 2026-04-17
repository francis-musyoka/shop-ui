"use client";

import {
    useState,
    useRef,
    useEffect,
    useCallback,
    type FormEvent,
    type KeyboardEvent,
} from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import type { Category } from "@/lib/schemas/category";

type CategoryOption = Pick<Category, "id" | "name">;

interface SearchBarProps {
    placeholder?: string;
    defaultValue?: string;
    className?: string;
    categories?: CategoryOption[];
}

const ALL_OPTION = { id: "all", name: "All" } as const;

export function SearchBar({
    placeholder = "Search products...",
    defaultValue = "",
    className,
    categories = [],
}: SearchBarProps) {
    const router = useRouter();
    const [selected, setSelected] = useState<CategoryOption>(ALL_OPTION);
    const [open, setOpen] = useState(false);
    const [highlightIdx, setHighlightIdx] = useState(-1);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const listRef = useRef<HTMLUListElement>(null);

    const options = [ALL_OPTION, ...categories];

    // Close on click outside
    useEffect(() => {
        if (!open) return;
        function handleClick(e: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClick);
        return () => document.removeEventListener("mousedown", handleClick);
    }, [open]);

    function openDropdown() {
        const idx = options.findIndex((o) => o.id === selected.id);
        setHighlightIdx(idx >= 0 ? idx : 0);
        setOpen(true);
    }

    const handleSubmit = useCallback(
        (e: FormEvent<HTMLFormElement>) => {
            e.preventDefault();
            const formData = new FormData(e.currentTarget);
            const q = (formData.get("q") as string).trim();
            const params = new URLSearchParams();
            if (q) params.set("q", q);
            if (selected.id !== "all") params.set("categoryId", selected.id);
            const qs = params.toString();
            router.push(qs ? `/browse?${qs}` : "/browse");
        },
        [router, selected],
    );

    function selectAndClose(opt: CategoryOption) {
        setSelected(opt);
        setOpen(false);
    }

    function handleTriggerKeyDown(e: KeyboardEvent) {
        if (e.key === "ArrowDown" || e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            openDropdown();
        } else if (e.key === "Escape") {
            setOpen(false);
        }
    }

    function handleListKeyDown(e: KeyboardEvent) {
        switch (e.key) {
            case "ArrowDown":
                e.preventDefault();
                setHighlightIdx((i) => (i < options.length - 1 ? i + 1 : 0));
                break;
            case "ArrowUp":
                e.preventDefault();
                setHighlightIdx((i) => (i > 0 ? i - 1 : options.length - 1));
                break;
            case "Enter":
            case " ":
                e.preventDefault();
                if (highlightIdx >= 0 && highlightIdx < options.length) {
                    selectAndClose(options[highlightIdx]!);
                }
                break;
            case "Escape":
                e.preventDefault();
                setOpen(false);
                break;
        }
    }

    // Scroll highlighted item into view
    useEffect(() => {
        if (!open || highlightIdx < 0) return;
        const list = listRef.current;
        const item = list?.children[highlightIdx] as HTMLElement | undefined;
        item?.scrollIntoView({ block: "nearest" });
    }, [highlightIdx, open]);

    return (
        <form onSubmit={handleSubmit} className={cn("flex items-center", className)} role="search">
            <div className="relative flex w-full rounded-sm">
                {/* Custom category dropdown */}
                <div ref={dropdownRef} className="relative hidden sm:flex">
                    <button
                        type="button"
                        onClick={() => (open ? setOpen(false) : openDropdown())}
                        onKeyDown={handleTriggerKeyDown}
                        className="bg-brand-100 text-brand-800 hover:bg-brand-200 dark:bg-brand-900 dark:text-brand-200 dark:hover:bg-brand-800 flex h-11 shrink-0 items-center gap-1 rounded-l-sm px-2.5 text-xs font-medium"
                        aria-haspopup="listbox"
                        aria-expanded={open}
                        aria-label="Search category"
                    >
                        {selected.name}
                        <ChevronDown className="text-muted-foreground size-3" />
                    </button>

                    {open && (
                        <ul
                            ref={listRef}
                            role="listbox"
                            tabIndex={0}
                            onKeyDown={handleListKeyDown}
                            className="border-border bg-popover absolute top-full left-0 z-50 mt-1 max-h-72 w-56 overflow-y-auto rounded-sm border py-1 shadow-md focus:outline-none"
                        >
                            {options.map((opt, i) => (
                                <li
                                    key={opt.id}
                                    role="option"
                                    aria-selected={opt.id === selected.id}
                                    className={cn(
                                        "cursor-pointer px-3 py-2 text-sm",
                                        opt.id === selected.id
                                            ? "bg-brand-600 font-medium text-white"
                                            : i === highlightIdx
                                              ? "bg-muted text-foreground"
                                              : "text-foreground hover:bg-muted",
                                    )}
                                    onClick={() => selectAndClose(opt)}
                                >
                                    {opt.name}
                                </li>
                            ))}
                        </ul>
                    )}
                </div>

                {/* Search input */}
                <input
                    name="q"
                    type="search"
                    placeholder={placeholder}
                    defaultValue={defaultValue}
                    className="bg-card text-foreground placeholder:text-muted-foreground h-11 w-full border-0 px-4 text-base focus:outline-none sm:rounded-l-none"
                />

                {/* Search button */}
                <button
                    type="submit"
                    aria-label="Search"
                    className="bg-accent text-accent-foreground hover:bg-gold-500 flex h-11 shrink-0 items-center justify-center rounded-r-sm px-5 transition-colors duration-100"
                >
                    <Search className="size-5" />
                </button>
            </div>
        </form>
    );
}
