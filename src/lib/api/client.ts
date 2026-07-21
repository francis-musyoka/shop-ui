import "server-only";
import { z } from "zod";
import { env } from "@/lib/env";
import { readCookieHeader, writeCookie, deleteCookie } from "@/lib/auth/cookie-store";
import { parseAllSetCookies } from "@/lib/auth/forward-cookies";
import { ApiError, parseBackendError } from "./errors";

export type HttpMethod = "GET" | "POST" | "PATCH" | "PUT" | "DELETE";

/**
 * Revalidation window (seconds) for rarely-changing reference data
 * (categories, brands). Bounds staleness so tagged, cached data can't go stale
 * until redeploy. When the backend gains a mutation hook, a `revalidateTag`
 * webhook can replace this for near-real-time freshness.
 */
export const STATIC_DATA_REVALIDATE = 60 * 60; // 1 hour

export interface ApiRequest<TSchema extends z.ZodTypeAny> {
    /** Path relative to BACKEND_API_URL, e.g. "/api/customers/signin". */
    path: string;
    method?: HttpMethod;
    body?: unknown;
    query?: Record<string, string | number | boolean | undefined | null>;
    /** Zod schema the response is validated against. Required. */
    schema: TSchema;
    /**
     * If true (default), reads incoming Next request cookies and forwards them
     * to the backend, AND triggers silent refresh on 401. Set false for unauth
     * endpoints (signin, signup, forgot-password).
     */
    forwardCookies?: boolean;
    /** Next fetch cache option. Defaults to "no-store". */
    cache?: RequestCache;
    /** Next cache tags for revalidation. */
    tags?: string[];
    /**
     * Time-based revalidation window in seconds (Next `next.revalidate`). When
     * set, the response is cached and refreshed at most this often. Mutually
     * exclusive with `cache` (Next rejects both) — when provided, `cache` is
     * omitted.
     */
    revalidate?: number;
}

const REFRESH_PATH = "/api/customers/refresh-token";

export async function apiFetch<TSchema extends z.ZodTypeAny>(
    req: ApiRequest<TSchema>,
): Promise<z.infer<TSchema>> {
    const forwardCookies = req.forwardCookies !== false;
    const result = await sendOnce(req, forwardCookies);

    if (result.kind === "ok") return result.value as z.infer<TSchema>;

    // Non-2xx. Try silent refresh on 401 if cookie forwarding is on.
    if (result.error.statusCode === 401 && forwardCookies && req.path !== REFRESH_PATH) {
        const refreshed = await tryRefresh();
        if (refreshed) {
            // Retry original once. Pass forwardCookies=true so the retry sends fresh cookies.
            const retry = await sendOnce(req, true);
            if (retry.kind === "ok") return retry.value as z.infer<TSchema>;
            throw retry.error;
        }
    }

    throw result.error;
}

type SendResult = { kind: "ok"; value: unknown } | { kind: "err"; error: ApiError };

async function sendOnce<TSchema extends z.ZodTypeAny>(
    req: ApiRequest<TSchema>,
    forwardCookies: boolean,
): Promise<SendResult> {
    const url = buildUrl(req.path, req.query);
    const headers: Record<string, string> = {};
    let body: BodyInit | undefined;

    if (req.body instanceof FormData) {
        // Let fetch set Content-Type itself so it includes the multipart boundary.
        body = req.body;
    } else if (req.body !== undefined) {
        headers["Content-Type"] = "application/json";
        body = JSON.stringify(req.body);
    }

    if (forwardCookies) {
        const cookieHeader = await readCookieHeader();
        if (cookieHeader) headers.Cookie = cookieHeader;
    }

    let response: Response;
    try {
        const next: { tags?: string[]; revalidate?: number } = {};
        if (req.tags) next.tags = req.tags;
        if (req.revalidate !== undefined) next.revalidate = req.revalidate;
        response = await fetch(url, {
            method: req.method ?? "GET",
            headers,
            body,
            // `cache` and `next.revalidate` are mutually exclusive in Next — when a
            // revalidate window is set, it governs caching, so `cache` is omitted.
            ...(req.revalidate === undefined ? { cache: req.cache ?? "no-store" } : {}),
            ...(Object.keys(next).length > 0 ? { next } : {}),
        });
    } catch {
        return {
            kind: "err",
            error: new ApiError({
                statusCode: 0,
                code: "INTERNAL_SERVER_ERROR",
                messages: ["Network error. Please check your connection."],
            }),
        };
    }

    // Always look at Set-Cookie even on errors (refresh-token can return cookies even on borderline status).
    await forwardSetCookieHeaders(response);

    if (!response.ok) {
        let errBody: unknown = null;
        try {
            errBody = await response.json();
        } catch {
            // body wasn't JSON
        }
        return { kind: "err", error: parseBackendError(response.status, errBody) };
    }

    let json: unknown;
    try {
        json = await response.json();
    } catch {
        return {
            kind: "err",
            error: new ApiError({
                statusCode: response.status,
                code: "INTERNAL_SERVER_ERROR",
                messages: ["Server returned a malformed response."],
            }),
        };
    }

    const parsed = req.schema.safeParse(json);
    if (!parsed.success) {
        // Schema mismatch is a programming error (frontend/backend drift). Surface it.
        throw parsed.error;
    }
    return { kind: "ok", value: parsed.data };
}

async function tryRefresh(): Promise<boolean> {
    const url = buildUrl(REFRESH_PATH);
    let cookieHeader: string | undefined;
    try {
        cookieHeader = await readCookieHeader();
    } catch {
        return false;
    }
    if (!cookieHeader) return false;

    let response: Response;
    try {
        response = await fetch(url, {
            method: "POST",
            headers: { Cookie: cookieHeader },
            cache: "no-store",
        });
    } catch {
        return false;
    }
    await forwardSetCookieHeaders(response);
    return response.ok;
}

async function forwardSetCookieHeaders(response: Response): Promise<void> {
    const setCookies = collectSetCookieHeaders(response);
    if (setCookies.length === 0) return;
    const parsed = parseAllSetCookies(setCookies);
    for (const c of parsed) {
        if (c.deletion) {
            await deleteCookie(c.name, c.path);
        } else {
            await writeCookie({ name: c.name, value: c.value, maxAge: c.maxAge, path: c.path });
        }
    }
}

function collectSetCookieHeaders(response: Response): string[] {
    // Headers.getSetCookie() exists in modern runtimes (Node 18+, Bun, browsers).
    // Fall back to manual collection if not available.
    const anyHeaders = response.headers as Headers & { getSetCookie?: () => string[] };
    if (typeof anyHeaders.getSetCookie === "function") {
        return anyHeaders.getSetCookie();
    }
    const all: string[] = [];
    response.headers.forEach((value, key) => {
        if (key.toLowerCase() === "set-cookie") all.push(value);
    });
    return all;
}

function buildUrl(path: string, query?: ApiRequest<z.ZodTypeAny>["query"]): string {
    const base = env.BACKEND_API_URL.replace(/\/$/, "");
    const cleanPath = path.startsWith("/") ? path : `/${path}`;
    if (!query) return `${base}${cleanPath}`;
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(query)) {
        if (v === undefined || v === null) continue;
        params.set(k, String(v));
    }
    const qs = params.toString();
    return qs ? `${base}${cleanPath}?${qs}` : `${base}${cleanPath}`;
}
