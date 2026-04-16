import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({
    env: {
        BACKEND_API_URL: "http://localhost:4000",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NODE_ENV: "test",
    },
}));
vi.mock("next/navigation", () => ({
    redirect: vi.fn(),
}));
vi.mock("@/lib/api/customers", () => ({
    verifyPasswordOtp: vi.fn(),
}));

import { redirect } from "next/navigation";
import { verifyPasswordOtp } from "@/lib/api/customers";
import { ApiError } from "@/lib/api/errors";
import { verifyOtpAction } from "./actions";

const verifyOtpMock = verifyPasswordOtp as unknown as Mock;
const redirectMock = redirect as unknown as Mock;

function makeFormData(data: Record<string, string>): FormData {
    const fd = new FormData();
    for (const [key, value] of Object.entries(data)) {
        fd.set(key, value);
    }
    return fd;
}

describe("verifyOtpAction", () => {
    beforeEach(() => {
        verifyOtpMock.mockReset();
        redirectMock.mockReset();
    });

    it("returns fieldErrors when email is invalid", async () => {
        const fd = makeFormData({ email: "bad", code: "123456" });
        const result = await verifyOtpAction(null, fd);

        expect(result?.fieldErrors?.email).toBeDefined();
        expect(verifyOtpMock).not.toHaveBeenCalled();
    });

    it("returns fieldErrors when code is not 6 characters", async () => {
        const fd = makeFormData({ email: "jane@example.com", code: "123" });
        const result = await verifyOtpAction(null, fd);

        expect(result?.fieldErrors?.code).toBeDefined();
        expect(verifyOtpMock).not.toHaveBeenCalled();
    });

    it("returns fieldErrors when code is empty", async () => {
        const fd = makeFormData({ email: "jane@example.com", code: "" });
        const result = await verifyOtpAction(null, fd);

        expect(result?.fieldErrors?.code).toBeDefined();
        expect(verifyOtpMock).not.toHaveBeenCalled();
    });

    it("calls verifyPasswordOtp and redirects to /reset-password on success", async () => {
        verifyOtpMock.mockResolvedValue({ success: true });
        const fd = makeFormData({
            email: "jane@example.com",
            code: "123456",
        });

        await verifyOtpAction(null, fd);

        expect(verifyOtpMock).toHaveBeenCalledWith({
            email: "jane@example.com",
            code: "123456",
        });
        expect(redirectMock).toHaveBeenCalledWith("/reset-password");
    });

    it("returns formError when API throws ApiError", async () => {
        verifyOtpMock.mockRejectedValue(
            new ApiError({
                statusCode: 400,
                code: "VALIDATION_ERROR",
                messages: ["Invalid or expired code"],
            }),
        );
        const fd = makeFormData({
            email: "jane@example.com",
            code: "000000",
        });

        const result = await verifyOtpAction(null, fd);

        expect(result?.formError).toBe("Invalid or expired code");
        expect(redirectMock).not.toHaveBeenCalled();
    });

    it("re-throws non-ApiError exceptions", async () => {
        verifyOtpMock.mockRejectedValue(new Error("Network failure"));
        const fd = makeFormData({
            email: "jane@example.com",
            code: "123456",
        });

        await expect(verifyOtpAction(null, fd)).rejects.toThrow("Network failure");
    });
});
