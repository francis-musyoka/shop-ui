import { NextResponse } from "next/server";
import { ApiError } from "./errors";

/**
 * Maps an ApiError onto the backend's error envelope for a Route Handler.
 *
 * apiFetch uses statusCode 0 for network failures, so anything outside the
 * valid HTTP range is clamped — otherwise NextResponse.json throws a RangeError
 * and the real error is masked by a generic 500.
 */
export function apiErrorResponse(error: ApiError): NextResponse {
    const status = error.statusCode >= 400 && error.statusCode <= 599 ? error.statusCode : 502;
    return NextResponse.json({ success: false, error: error.messages }, { status });
}
