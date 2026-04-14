import "server-only";
import { apiFetch } from "./client";
import { SuccessFlagSchema } from "@/lib/schemas/common";
import {
    type SignupRequest,
    type SigninRequest,
    type UpdateProfileRequest,
    type UpdatePasswordRequest,
    type ForgotPasswordRequest,
    type VerifyOtpRequest,
    type ResetPasswordRequest,
    SignupResponseSchema,
    SigninResponseSchema,
    ProfileResponseSchema,
    ForgotPasswordResponseSchema,
    type Customer,
} from "@/lib/schemas/customer";

/**
 * Customer endpoint wrappers — thin pass-throughs to apiFetch with the
 * right path, schema, and forwardCookies flag.
 *
 * Any function on a public/unauthed endpoint sets forwardCookies: false
 * (signup, signin, forgot-password, verify-otp). Otherwise we default to
 * forwarding (the user's session cookie reaches the backend).
 */

export function signup(body: SignupRequest) {
    return apiFetch({
        path: "/api/customers/signup",
        method: "POST",
        body,
        schema: SignupResponseSchema,
        forwardCookies: false,
    });
}

export function signin(body: SigninRequest) {
    return apiFetch({
        path: "/api/customers/signin",
        method: "POST",
        body,
        schema: SigninResponseSchema,
        forwardCookies: false,
    });
}

export async function getProfile(): Promise<Customer> {
    const res = await apiFetch({
        path: "/api/customers/profile",
        schema: ProfileResponseSchema,
    });
    return res.data;
}

export function updateProfile(body: UpdateProfileRequest) {
    return apiFetch({
        path: "/api/customers/update-profile",
        method: "PATCH",
        body,
        schema: SuccessFlagSchema,
    });
}

export function updatePassword(body: UpdatePasswordRequest) {
    return apiFetch({
        path: "/api/customers/update-password",
        method: "PATCH",
        body,
        schema: SuccessFlagSchema,
    });
}

export function forgotPassword(body: ForgotPasswordRequest) {
    return apiFetch({
        path: "/api/customers/forgot-password",
        method: "POST",
        body,
        schema: ForgotPasswordResponseSchema,
        forwardCookies: false,
    });
}

export function verifyPasswordOtp(body: VerifyOtpRequest) {
    return apiFetch({
        path: "/api/customers/verify-password-otp",
        method: "POST",
        body,
        schema: SuccessFlagSchema,
        forwardCookies: false,
    });
}

export function resetPassword(body: ResetPasswordRequest) {
    // Forwards the resetToken cookie set by verify-password-otp.
    return apiFetch({
        path: "/api/customers/reset-password",
        method: "POST",
        body,
        schema: SuccessFlagSchema,
    });
}

export function refreshToken() {
    return apiFetch({
        path: "/api/customers/refresh-token",
        method: "POST",
        schema: SuccessFlagSchema,
    });
}

export function logout() {
    return apiFetch({
        path: "/api/customers/logout",
        method: "POST",
        schema: SuccessFlagSchema,
    });
}
