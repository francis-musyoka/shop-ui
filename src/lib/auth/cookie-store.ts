import "server-only";
import { cookies } from "next/headers";

/**
 * Thin wrapper around Next's cookies() API so consumers can be unit-tested
 * via vi.mock("@/lib/auth/cookie-store", ...).
 *
 * In Next 16, cookies() is async. We await it once per call.
 */

export async function readCookieHeader(): Promise<string | undefined> {
    const store = await cookies();
    const all = store.getAll();
    if (all.length === 0) return undefined;
    return all.map((c) => `${c.name}=${encodeURIComponent(c.value)}`).join("; ");
}

export interface SetCookieOptions {
    name: string;
    value: string;
    maxAge?: number;
    path?: string;
}

export async function writeCookie(opts: SetCookieOptions): Promise<void> {
    const store = await cookies();
    const isProd = process.env.NODE_ENV === "production";
    store.set({
        name: opts.name,
        value: opts.value,
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: opts.path ?? "/",
        ...(typeof opts.maxAge === "number" ? { maxAge: opts.maxAge } : {}),
    });
}
