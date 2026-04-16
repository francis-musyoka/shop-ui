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
    signin: vi.fn(),
}));

import { redirect } from "next/navigation";
import { signin } from "@/lib/api/customers";
import { ApiError } from "@/lib/api/errors";
import { signinAction } from "./actions";

const signinMock = signin as unknown as Mock;
const redirectMock = redirect as unknown as Mock;

function makeFormData(data: Record<string, string>): FormData {
    const fd = new FormData();
    for (const [key, value] of Object.entries(data)) {
        fd.set(key, value);
    }
    return fd;
}

describe("signinAction", () => {
    beforeEach(() => {
        signinMock.mockReset();
        redirectMock.mockReset();
    });

    it("returns fieldErrors when email is invalid", async () => {
        const fd = makeFormData({ email: "not-an-email", password: "secret" });
        const result = await signinAction(null, fd);

        expect(result?.fieldErrors?.email).toBeDefined();
        expect(signinMock).not.toHaveBeenCalled();
    });

    it("returns fieldErrors when password is empty", async () => {
        const fd = makeFormData({ email: "test@example.com", password: "" });
        const result = await signinAction(null, fd);

        expect(result?.fieldErrors?.password).toBeDefined();
        expect(signinMock).not.toHaveBeenCalled();
    });

    it("calls signin and redirects to / on success", async () => {
        signinMock.mockResolvedValue({ success: true });
        const fd = makeFormData({
            email: "test@example.com",
            password: "secret123",
        });

        await signinAction(null, fd);

        expect(signinMock).toHaveBeenCalledWith({
            email: "test@example.com",
            password: "secret123",
        });
        expect(redirectMock).toHaveBeenCalledWith("/");
    });

    it("redirects to ?next= value when provided", async () => {
        signinMock.mockResolvedValue({ success: true });
        const fd = makeFormData({
            email: "test@example.com",
            password: "secret123",
            next: "/account",
        });

        await signinAction(null, fd);

        expect(redirectMock).toHaveBeenCalledWith("/account");
    });

    it("returns formError when API throws ApiError", async () => {
        signinMock.mockRejectedValue(
            new ApiError({
                statusCode: 401,
                code: "UNAUTHORIZED",
                messages: ["Invalid email or password"],
            }),
        );
        const fd = makeFormData({
            email: "test@example.com",
            password: "wrongpass",
        });

        const result = await signinAction(null, fd);

        expect(result?.formError).toBe("Invalid email or password");
        expect(redirectMock).not.toHaveBeenCalled();
    });

    it("re-throws non-ApiError exceptions", async () => {
        signinMock.mockRejectedValue(new Error("Network failure"));
        const fd = makeFormData({
            email: "test@example.com",
            password: "secret123",
        });

        await expect(signinAction(null, fd)).rejects.toThrow("Network failure");
    });
});
