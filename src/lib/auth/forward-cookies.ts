/**
 * Parse `Set-Cookie` header values returned by the backend so they can be
 * re-emitted on the Next response with our own safe defaults.
 *
 * We deliberately do NOT pipe the raw Set-Cookie string through — the backend
 * may set Domain= / SameSite= attributes that don't match our origin. The
 * caller (apiFetch) takes the parsed data and calls cookies().set(...) with
 * httpOnly: true, secure: isProd, sameSite: "lax" hardcoded.
 *
 * This module has no Next dependencies — it's pure string parsing, fully unit-testable.
 */

export interface ParsedSetCookie {
    name: string;
    value: string;
    path?: string;
    maxAge?: number;
    httpOnly?: boolean;
    secure?: boolean;
    /** True if the backend is deleting this cookie (Max-Age=0, Expires in the past, or empty value). */
    deletion?: boolean;
}

/**
 * Parse a single Set-Cookie header value. Returns null if the input is malformed.
 *
 * Examples:
 *   "foo=bar"                           -> { name: "foo", value: "bar" }
 *   "foo=bar; HttpOnly; Path=/"         -> { name, value, httpOnly, path }
 *   "tok=eyJ...; Max-Age=600"           -> { name, value, maxAge: 600 }
 */
export function parseSetCookieHeader(header: string): ParsedSetCookie | null {
    if (!header || typeof header !== "string") return null;

    const segments = header.split(";").map((s) => s.trim());
    const first = segments[0];
    if (!first || !first.includes("=")) return null;

    const eqIdx = first.indexOf("=");
    const name = first.slice(0, eqIdx).trim();
    if (!name) return null;
    const rawValue = first.slice(eqIdx + 1);

    const result: ParsedSetCookie = {
        name,
        value: safeDecode(rawValue),
    };

    let expiresInPast = false;

    for (const seg of segments.slice(1)) {
        const lower = seg.toLowerCase();
        if (lower === "httponly") {
            result.httpOnly = true;
        } else if (lower === "secure") {
            result.secure = true;
        } else if (lower.startsWith("path=")) {
            result.path = seg.slice("path=".length);
        } else if (lower.startsWith("max-age=")) {
            const n = Number(seg.slice("max-age=".length));
            if (Number.isFinite(n)) result.maxAge = n;
        } else if (lower.startsWith("expires=")) {
            const dateStr = seg.slice("expires=".length);
            const when = Date.parse(dateStr);
            if (Number.isFinite(when) && when <= Date.now()) {
                expiresInPast = true;
            }
        }
        // Ignore Domain, SameSite — we set our own.
    }

    // Detect deletion: Max-Age=0, Expires in the past, or empty value.
    // Backends signal "delete this cookie" with any of these patterns.
    if (result.maxAge === 0 || expiresInPast || result.value === "") {
        result.deletion = true;
    }

    return result;
}

/**
 * Parse every Set-Cookie header from a backend response. Malformed entries
 * are dropped silently (we'd rather lose one cookie than throw and break auth).
 */
export function parseAllSetCookies(headers: string[]): ParsedSetCookie[] {
    const out: ParsedSetCookie[] = [];
    for (const h of headers) {
        const parsed = parseSetCookieHeader(h);
        if (parsed) out.push(parsed);
    }
    return out;
}

function safeDecode(value: string): string {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}
