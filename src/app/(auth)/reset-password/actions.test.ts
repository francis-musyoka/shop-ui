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
    resetPassword: vi.fn(),
}));

import { redirect } from "next/navigation";
import { resetPassword } from "@/lib/api/customers";
import { ApiError } from "@/lib/api/errors";
import { resetPasswordAction } from "./actions";

const resetPasswordMock = resetPassword as unknown as Mock;
const redirectMock = redirect as unknown as Mock;

function makeFormData(data: Record<string, string>): FormData {
    const fd = new FormData();
    for (const [key, value] of Object.entries(data)) {
        fd.set(key, value);
    }
    return fd;
}

describe("resetPasswordAction", () => {
    beforeEach(() => {
        resetPasswordMock.mockReset();
        redirectMock.mockReset();
    });

    it("returns fieldErrors when password is too short", async () => {
        const fd = makeFormData({
            newPassword: "Sh1!",
            confirmPassword: "Sh1!",
        });
        const result = await resetPasswordAction(null, fd);

        expect(result?.fieldErrors?.newPassword).toBeDefined();
        expect(resetPasswordMock).not.toHaveBeenCalled();
    });

    it("returns fieldErrors when password lacks uppercase", async () => {
        const fd = makeFormData({
            newPassword: "alllower1!",
            confirmPassword: "alllower1!",
        });
        const result = await resetPasswordAction(null, fd);

        expect(result?.fieldErrors?.newPassword).toBeDefined();
        expect(resetPasswordMock).not.toHaveBeenCalled();
    });

    it("returns fieldErrors when passwords do not match", async () => {
        const fd = makeFormData({
            newPassword: "Strong1Pass!",
            confirmPassword: "Different1!",
        });
        const result = await resetPasswordAction(null, fd);

        expect(result?.fieldErrors?.confirmPassword).toBeDefined();
        expect(resetPasswordMock).not.toHaveBeenCalled();
    });

    it("returns fieldErrors when password contains spaces", async () => {
        const fd = makeFormData({
            newPassword: "Strong 1Pass!",
            confirmPassword: "Strong 1Pass!",
        });
        const result = await resetPasswordAction(null, fd);

        expect(result?.fieldErrors?.newPassword).toBeDefined();
        expect(resetPasswordMock).not.toHaveBeenCalled();
    });

    it("calls resetPassword and redirects to /signin?reset=true on success", async () => {
        resetPasswordMock.mockResolvedValue({ success: true });
        const fd = makeFormData({
            newPassword: "Strong1Pass!",
            confirmPassword: "Strong1Pass!",
        });

        await resetPasswordAction(null, fd);

        expect(resetPasswordMock).toHaveBeenCalledWith({
            newPassword: "Strong1Pass!",
            confirmPassword: "Strong1Pass!",
        });
        expect(redirectMock).toHaveBeenCalledWith("/signin?reset=true");
    });

    it("returns formError when API throws ApiError", async () => {
        resetPasswordMock.mockRejectedValue(
            new ApiError({
                statusCode: 400,
                code: "VALIDATION_ERROR",
                messages: ["Reset token expired"],
            }),
        );
        const fd = makeFormData({
            newPassword: "Strong1Pass!",
            confirmPassword: "Strong1Pass!",
        });

        const result = await resetPasswordAction(null, fd);

        expect(result?.formError).toBe("Reset token expired");
        expect(redirectMock).not.toHaveBeenCalled();
    });

    it("re-throws non-ApiError exceptions", async () => {
        resetPasswordMock.mockRejectedValue(new Error("Network failure"));
        const fd = makeFormData({
            newPassword: "Strong1Pass!",
            confirmPassword: "Strong1Pass!",
        });

        await expect(resetPasswordAction(null, fd)).rejects.toThrow("Network failure");
    });
});
