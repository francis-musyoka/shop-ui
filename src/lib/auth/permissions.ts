import type { Customer } from "@/lib/schemas/customer";

/**
 * Mirrors the conversation slice of the backend's Permission enum
 * (src/constants/permissions.ts). Only the permissions the UI actually gates on
 * are listed — this is not a full mirror.
 */
export const Permission = {
    CONVERSATION_CREATE: "conversation:create",
    CONVERSATION_SEND_MESSAGE: "conversation:send_message",
    CONVERSATION_VIEW: "conversation:view",
} as const;

/**
 * UX guard only — the backend enforces every permission and returns 403. This
 * exists so we don't render a control that is guaranteed to fail.
 *
 * `userRole.permissions` has always been on CustomerSchema; this is its first
 * consumer in the UI.
 */
export function hasPermission(user: Customer | null, permission: string): boolean {
    return user?.userRole.permissions.includes(permission) ?? false;
}
