import "server-only";
import { redirect } from "next/navigation";
import { getSession, type Session } from "./session";

/**
 * Guard for protected routes. Call at the top of any layout or page
 * that requires authentication.
 *
 * Returns the session if the user is logged in. Redirects to /signin
 * otherwise. A simple redirect for now — no ?next= parameter extraction
 * (will be enhanced with middleware in a future slice).
 */
export async function requireAuth(): Promise<Session> {
    const session = await getSession();
    if (!session) {
        redirect("/signin");
    }
    return session;
}
