"use client";

import { useState } from "react";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import type { MyShop } from "@/lib/schemas/seller-shop";
import { SidebarContent } from "./sidebar-content";

// Hamburger + slide-in drawer for < md, where the desktop <aside> is hidden.
export function MobileSidebar({ shop }: { shop: MyShop }) {
    const [open, setOpen] = useState(false);

    return (
        <Sheet open={open} onOpenChange={setOpen}>
            <SheetTrigger
                render={
                    <Button
                        variant="ghost"
                        size="icon-sm"
                        className="text-white hover:bg-white/10 md:hidden"
                    />
                }
            >
                <Menu size={20} />
                <span className="sr-only">Open menu</span>
            </SheetTrigger>
            <SheetContent side="left" className="p-4 pt-12">
                <SheetTitle className="sr-only">Seller navigation</SheetTitle>
                <SidebarContent shop={shop} onNavigateAction={() => setOpen(false)} />
            </SheetContent>
        </Sheet>
    );
}
