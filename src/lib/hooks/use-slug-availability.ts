"use client";
import { useQuery } from "@tanstack/react-query";
import { isValidShopSlug } from "@/lib/shop-slug";

export function useSlugAvailability(slug: string, excludeSlug?: string) {
    const trimmed = slug.trim();
    return useQuery({
        queryKey: ["slug-available", trimmed],
        enabled: isValidShopSlug(trimmed) && trimmed !== excludeSlug,
        queryFn: async () => {
            const res = await fetch(
                `/api/shops/slug-available?slug=${encodeURIComponent(trimmed)}`,
            );
            if (!res.ok) throw new Error("Failed to check slug");
            return (await res.json()) as { available: boolean };
        },
    });
}
