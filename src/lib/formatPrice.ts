/**
 * Format a Kenyan-shilling amount for display, e.g. `42800` → `"KSh 42,800"`.
 */
export function formatPrice(amount: number): string {
    return `KSh ${amount.toLocaleString("en-KE")}`;
}
