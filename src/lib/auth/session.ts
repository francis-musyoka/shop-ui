import "server-only";
import { cache } from "react";
import * as api from "@/lib/api/customers";
import { ApiError } from "@/lib/api/errors";
import type { Customer } from "@/lib/schemas/customer";

export interface Session {
    user: Customer;
}

/**
 * Fetch the current user's profile, cached per request.
 *
 * Returns the session object if authenticated, or null if the user
 * is not logged in (401). Any other error is re-thrown so it bubbles
 * to the nearest error boundary.
 *
 * Uses `apiFetch` internally, which reads cookies via `readCookieHeader`
 * and handles silent refresh on 401 automatically. No direct cookie
 * reads needed here.
 */
export const getSession = cache(async (): Promise<Session | null> => {
    try {
        const user = await api.getProfile();
        return { user };
    } catch (err) {
        if (err instanceof ApiError && err.statusCode === 401) {
            return null;
        }
        throw err;
    }
});
