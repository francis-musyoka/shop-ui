import type { Customer } from "@/lib/schemas/customer";

export function isSeller(user: Customer): boolean {
    return user.userRole.name === "SELLER";
}
