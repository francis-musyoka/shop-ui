/**
 * Shared return type for all server actions that back useActionState forms.
 *
 * - fieldErrors: Zod validation errors keyed by field name
 * - formError: a single top-level error (e.g. from ApiError)
 * - success: true when the action succeeded but did NOT redirect
 *   (used for in-place updates like profile save)
 *
 * The initial state passed to useActionState is `null`.
 */
export type ActionState = {
    fieldErrors?: Record<string, string[]>;
    formError?: string;
    success?: boolean;
} | null;
