import type { MyShop } from "@/lib/schemas/seller-shop";
export function canManageListings(status: MyShop["status"]): boolean {
    return status === "ACTIVE";
}
