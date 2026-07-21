"use client";

import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { setSingle } from "@/lib/browse-params";
import { STATUS_TABS } from "@/lib/seller-listings-params";

// "All" has no `status` param, so it's represented by the empty string both in the
// URL (key absent) and as the Tabs primitive's active value.
const ALL_VALUE = "";

export function StatusTabs() {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const current = searchParams.get("status") ?? ALL_VALUE;

    function choose(value: string) {
        const next = setSingle(searchParams, "status", value || null);
        const qs = next.toString();
        router.push(qs ? `${pathname}?${qs}` : pathname);
    }

    return (
        <div className="overflow-x-auto">
            <Tabs value={current} onValueChange={(value) => choose(String(value))}>
                <TabsList variant="line">
                    {STATUS_TABS.map((tab) => (
                        <TabsTrigger
                            key={tab.label}
                            value={tab.value ?? ALL_VALUE}
                            className="shrink-0"
                        >
                            {tab.label}
                        </TabsTrigger>
                    ))}
                </TabsList>
            </Tabs>
        </div>
    );
}
