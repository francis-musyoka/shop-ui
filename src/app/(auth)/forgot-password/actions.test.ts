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
    forgotPassword: vi.fn(),
}));

import { redirect } from "next/navigation";
import { forgotPassword } from "@/lib/api/customers";
import { ApiError } from "@/lib/api/errors";
import { forgotPasswordAction } from "./actions";

const forgotPasswordMock = forgotPassword as unknown as Mock;
const redirectMock = redirect as unknown as Mock;

function makeFormData(data: Record<string, string>): FormData {
    const fd = new FormData();
    for (const [key, value] of Object.entries(data)) {
        fd.set(key, value);
    }
    return fd;
}

describe("forgotPasswordAction", () => {
    beforeEach(() => {
        forgotPasswordMock.mockReset();
        redirectMock.mockReset();
    });

    it("returns fieldErrors when email is invalid", async () => {
        const fd = makeFormData({ email: "not-an-email" });
        const result = await forgotPasswordAction(null, fd);

        expect(result?.fieldErrors?.email).toBeDefined();
        expect(forgotPasswordMock).not.toHaveBeenCalled();
    });

    it("returns fieldErrors when email is empty", async () => {
        const fd = makeFormData({ email: "" });
        const result = await forgotPasswordAction(null, fd);

        expect(result?.fieldErrors?.email).toBeDefined();
        expect(forgotPasswordMock).not.toHaveBeenCalled();
    });

    it("calls forgotPassword and redirects to /verify-otp on success", async () => {
        forgotPasswordMock.mockResolvedValue({
            success: true,
            message: "OTP sent",
        });
        const fd = makeFormData({ email: "jane@example.com" });

        await forgotPasswordAction(null, fd);

        expect(forgotPasswordMock).toHaveBeenCalledWith({
            email: "jane@example.com",
        });
        expect(redirectMock).toHaveBeenCalledWith("/verify-otp?email=jane%40example.com");
    });

    it("returns formError when API throws ApiError", async () => {
        forgotPasswordMock.mockRejectedValue(
            new ApiError({
                statusCode: 404,
                code: "NOT_FOUND",
                messages: ["Email not found"],
            }),
        );
        const fd = makeFormData({ email: "nobody@example.com" });

        const result = await forgotPasswordAction(null, fd);

        expect(result?.formError).toBe("Email not found");
        expect(redirectMock).not.toHaveBeenCalled();
    });

    it("re-throws non-ApiError exceptions", async () => {
        forgotPasswordMock.mockRejectedValue(new Error("Network failure"));
        const fd = makeFormData({ email: "jane@example.com" });

        await expect(forgotPasswordAction(null, fd)).rejects.toThrow("Network failure");
    });
});
