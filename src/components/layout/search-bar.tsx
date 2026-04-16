"use client";

import { useState, useRef, useEffect, useCallback, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { Search, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

interface CategoryOption {
    id: string;
    name: string;
}

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
    const dropdownRef = useRef<HTMLDivElement>(null);

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

    const options = [ALL_OPTION, ...categories];

    return (
        <form onSubmit={handleSubmit} className={cn("flex items-center", className)} role="search">
            <div className="relative flex w-full rounded-sm">
                {/* Custom category dropdown */}
                <div ref={dropdownRef} className="relative hidden sm:flex">
                    <button
                        type="button"
                        onClick={() => setOpen((o) => !o)}
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
                            role="listbox"
                            className="border-border dark:bg-card absolute top-full left-0 z-50 mt-1 max-h-72 w-56 overflow-y-auto rounded-sm border bg-white py-1 shadow-md"
                        >
                            {options.map((opt) => (
                                <li
                                    key={opt.id}
                                    role="option"
                                    aria-selected={opt.id === selected.id}
                                    className={cn(
                                        "cursor-pointer px-3 py-2 text-sm",
                                        opt.id === selected.id
                                            ? "bg-brand-600 font-medium text-white"
                                            : "text-foreground hover:bg-muted",
                                    )}
                                    onClick={() => {
                                        setSelected(opt);
                                        setOpen(false);
                                    }}
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
                    className="text-foreground placeholder:text-muted-foreground h-11 w-full border-0 bg-white px-4 text-base focus:outline-none sm:rounded-l-none"
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
