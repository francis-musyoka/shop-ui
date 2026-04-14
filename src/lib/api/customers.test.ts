import { describe, it, expect, beforeEach, vi, type Mock } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("./client", () => ({
    apiFetch: vi.fn(),
}));

import { apiFetch } from "./client";
import {
    signup,
    signin,
    getProfile,
    updateProfile,
    updatePassword,
    forgotPassword,
    verifyPasswordOtp,
    resetPassword,
    refreshToken,
    logout,
} from "./customers";

const apiFetchMock = apiFetch as unknown as Mock;

beforeEach(() => {
    apiFetchMock.mockReset();
});

describe("customers API module", () => {
    it("signup() POSTs /api/customers/signup with body and no cookies", async () => {
        apiFetchMock.mockResolvedValue({
            success: true,
            customer: { id: "cl9ebqhxk00003b6093z6n3kc" },
        });
        await signup({
            firstName: "Jane",
            lastName: "Doe",
            email: "jane@example.com",
            phone: "+254700000000",
            password: "Strong1Pass!",
            confirmPassword: "Strong1Pass!",
        });
        const call = apiFetchMock.mock.calls[0]?.[0];
        expect(call.path).toBe("/api/customers/signup");
        expect(call.method).toBe("POST");
        expect(call.forwardCookies).toBe(false);
        expect(call.body.email).toBe("jane@example.com");
    });

    it("signin() POSTs /api/customers/signin without cookie forwarding", async () => {
        apiFetchMock.mockResolvedValue({ success: true });
        await signin({ email: "x@y.com", password: "p" });
        const call = apiFetchMock.mock.calls[0]?.[0];
        expect(call.path).toBe("/api/customers/signin");
        expect(call.method).toBe("POST");
        expect(call.forwardCookies).toBe(false);
    });

    it("getProfile() GETs /api/customers/profile with cookie forwarding", async () => {
        apiFetchMock.mockResolvedValue({
            authenticated: true,
            success: true,
            data: {
                id: "cl9ebqhxk00003b6093z6n3kc",
                email: "x@y.com",
                firstName: "Jane",
                lastName: "Doe",
                userRole: { id: "cl9ebqhxk00004role0000001", name: "CUSTOMER", permissions: [] },
            },
        });
        const result = await getProfile();
        const call = apiFetchMock.mock.calls[0]?.[0];
        expect(call.path).toBe("/api/customers/profile");
        expect(call.method).toBeUndefined(); // defaults to GET
        expect(call.forwardCookies).not.toBe(false); // either undefined (default true) or true
        expect(result.email).toBe("x@y.com");
    });

    it("updateProfile() PATCHes /api/customers/update-profile with cookies", async () => {
        apiFetchMock.mockResolvedValue({ success: true });
        await updateProfile({ firstName: "Jane", lastName: "Doe" });
        const call = apiFetchMock.mock.calls[0]?.[0];
        expect(call.path).toBe("/api/customers/update-profile");
        expect(call.method).toBe("PATCH");
        expect(call.forwardCookies).not.toBe(false);
    });

    it("updatePassword() PATCHes /api/customers/update-password", async () => {
        apiFetchMock.mockResolvedValue({ success: true });
        await updatePassword({
            currentPassword: "Strong1Pass!",
            newPassword: "Another2Pass!",
            currentPasswordConfirm: "Strong1Pass!",
        });
        const call = apiFetchMock.mock.calls[0]?.[0];
        expect(call.path).toBe("/api/customers/update-password");
        expect(call.method).toBe("PATCH");
    });

    it("forgotPassword() POSTs /api/customers/forgot-password without cookies", async () => {
        apiFetchMock.mockResolvedValue({ success: true, message: "ok" });
        await forgotPassword({ email: "x@y.com" });
        const call = apiFetchMock.mock.calls[0]?.[0];
        expect(call.path).toBe("/api/customers/forgot-password");
        expect(call.method).toBe("POST");
        expect(call.forwardCookies).toBe(false);
    });

    it("verifyPasswordOtp() POSTs /api/customers/verify-password-otp without cookies", async () => {
        apiFetchMock.mockResolvedValue({ success: true });
        await verifyPasswordOtp({ email: "x@y.com", code: "123456" });
        const call = apiFetchMock.mock.calls[0]?.[0];
        expect(call.path).toBe("/api/customers/verify-password-otp");
        expect(call.forwardCookies).toBe(false);
    });

    it("resetPassword() POSTs /api/customers/reset-password WITH cookies (resetToken)", async () => {
        apiFetchMock.mockResolvedValue({ success: true });
        await resetPassword({
            newPassword: "Strong1Pass!",
            confirmPassword: "Strong1Pass!",
        });
        const call = apiFetchMock.mock.calls[0]?.[0];
        expect(call.path).toBe("/api/customers/reset-password");
        expect(call.method).toBe("POST");
        // resetToken cookie set by verify-otp must be forwarded
        expect(call.forwardCookies).not.toBe(false);
    });

    it("refreshToken() POSTs /api/customers/refresh-token with cookies", async () => {
        apiFetchMock.mockResolvedValue({ success: true });
        await refreshToken();
        const call = apiFetchMock.mock.calls[0]?.[0];
        expect(call.path).toBe("/api/customers/refresh-token");
        expect(call.method).toBe("POST");
        expect(call.forwardCookies).not.toBe(false);
    });

    it("logout() POSTs /api/customers/logout with cookies", async () => {
        apiFetchMock.mockResolvedValue({ success: true });
        await logout();
        const call = apiFetchMock.mock.calls[0]?.[0];
        expect(call.path).toBe("/api/customers/logout");
        expect(call.method).toBe("POST");
        expect(call.forwardCookies).not.toBe(false);
    });
});
