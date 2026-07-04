"use client";

import type { ReactNode } from "react";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";

export function MobileFilters({ children }: { children: ReactNode }) {
    return (
        <Sheet>
            <SheetTrigger render={<Button variant="outline" size="sm" className="w-full" />}>
                <SlidersHorizontal size={14} /> Filters
            </SheetTrigger>
            <SheetContent side="left" className="w-80 max-w-[85vw] overflow-y-auto p-4">
                <SheetHeader className="p-0">
                    <SheetTitle>Filters</SheetTitle>
                </SheetHeader>
                {children}
            </SheetContent>
        </Sheet>
    );
}
