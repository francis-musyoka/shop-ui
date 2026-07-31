// Initials shown in the shop's avatar tile, e.g. "River Tech" -> "RT". The API doesn't
// send precomputed initials (unlike the mockup fixture), so derive from the shop name.
export function shopInitials(name: string): string {
    const words = name.trim().split(/\s+/).filter(Boolean);
    return words
        .slice(0, 2)
        .map((w) => w[0]?.toUpperCase())
        .join("");
}
