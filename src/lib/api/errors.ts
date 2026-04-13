/**
 * Frontend representation of any non-2xx response from the backend.
 *
 * Backend's error envelope is `{ success: false, error: string | string[] }`.
 * We normalize to always carry `messages: string[]` so callers don't branch.
 *
 * `code` is derived from the HTTP status (UNAUTHORIZED, FORBIDDEN, etc.) so
 * server actions can switch on it without parsing strings.
 *
 * `isFieldLevel = true` indicates the messages came from a 400 validation
 * response — the form layer can surface them at the form level (we don't have
 * structured field-level errors from the backend; see backend TODO P1-1).
 */
export type ApiErrorCode =
    | "VALIDATION_ERROR"
    | "UNAUTHORIZED"
    | "FORBIDDEN"
    | "NOT_FOUND"
    | "CONFLICT"
    | "RATE_LIMITED"
    | "INTERNAL_SERVER_ERROR";

export interface ApiErrorInit {
    statusCode: number;
    code: ApiErrorCode;
    messages: string[];
}

export class ApiError extends Error {
    readonly statusCode: number;
    readonly code: ApiErrorCode;
    readonly messages: string[];

    constructor(init: ApiErrorInit) {
        super(init.messages.join("; "));
        this.name = "ApiError";
        this.statusCode = init.statusCode;
        this.code = init.code;
        this.messages = init.messages;
    }

    get isFieldLevel(): boolean {
        return this.code === "VALIDATION_ERROR";
    }
}

const STATUS_CODE_MAP: Record<number, ApiErrorCode> = {
    400: "VALIDATION_ERROR",
    401: "UNAUTHORIZED",
    403: "FORBIDDEN",
    404: "NOT_FOUND",
    409: "CONFLICT",
    429: "RATE_LIMITED",
};

const FALLBACK_MESSAGE = "Something went wrong. Please try again.";

/**
 * Convert a backend error response body + HTTP status into an ApiError.
 * Tolerant of malformed bodies — falls back to a generic INTERNAL_SERVER_ERROR
 * with a user-safe message rather than throwing.
 */
export function parseBackendError(statusCode: number, body: unknown): ApiError {
    const code: ApiErrorCode = STATUS_CODE_MAP[statusCode] ?? "INTERNAL_SERVER_ERROR";

    let messages: string[] = [FALLBACK_MESSAGE];
    if (body && typeof body === "object" && "error" in body) {
        const raw = (body as { error: unknown }).error;
        if (typeof raw === "string" && raw.trim()) {
            messages = [raw];
        } else if (Array.isArray(raw) && raw.every((m): m is string => typeof m === "string")) {
            messages = raw.length ? raw : [FALLBACK_MESSAGE];
        }
    }

    return new ApiError({ statusCode, code, messages });
}
