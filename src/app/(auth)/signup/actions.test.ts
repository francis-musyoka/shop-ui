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
    signup: vi.fn(),
}));

import { redirect } from "next/navigation";
import { signup } from "@/lib/api/customers";
import { ApiError } from "@/lib/api/errors";
import { signupAction } from "./actions";

const signupMock = signup as unknown as Mock;
const redirectMock = redirect as unknown as Mock;

function makeFormData(data: Record<string, string>): FormData {
    const fd = new FormData();
    for (const [key, value] of Object.entries(data)) {
        fd.set(key, value);
    }
    return fd;
}

const validSignup = {
    firstName: "Jane",
    lastName: "Doe",
    email: "jane@example.com",
    phone: "+254700000000",
    password: "Strong1Pass!",
    confirmPassword: "Strong1Pass!",
};

describe("signupAction", () => {
    beforeEach(() => {
        signupMock.mockReset();
        redirectMock.mockReset();
    });

    it("returns fieldErrors when email is invalid", async () => {
        const fd = makeFormData({ ...validSignup, email: "bad" });
        const result = await signupAction(null, fd);

        expect(result?.fieldErrors?.email).toBeDefined();
        expect(signupMock).not.toHaveBeenCalled();
    });

    it("returns fieldErrors when passwords do not match", async () => {
        const fd = makeFormData({
            ...validSignup,
            confirmPassword: "Different1Pass!",
        });
        const result = await signupAction(null, fd);

        expect(result?.fieldErrors?.confirmPassword).toBeDefined();
        expect(signupMock).not.toHaveBeenCalled();
    });

    it("returns fieldErrors when password is too short", async () => {
        const fd = makeFormData({
            ...validSignup,
            password: "Sh1!",
            confirmPassword: "Sh1!",
        });
        const result = await signupAction(null, fd);

        expect(result?.fieldErrors?.password).toBeDefined();
        expect(signupMock).not.toHaveBeenCalled();
    });

    it("returns fieldErrors when firstName is too short", async () => {
        const fd = makeFormData({ ...validSignup, firstName: "J" });
        const result = await signupAction(null, fd);

        expect(result?.fieldErrors?.firstName).toBeDefined();
        expect(signupMock).not.toHaveBeenCalled();
    });

    it("returns fieldErrors when phone is too short", async () => {
        const fd = makeFormData({ ...validSignup, phone: "123" });
        const result = await signupAction(null, fd);

        expect(result?.fieldErrors?.phone).toBeDefined();
        expect(signupMock).not.toHaveBeenCalled();
    });

    it("calls signup and redirects to /signin?registered=true on success", async () => {
        signupMock.mockResolvedValue({
            success: true,
            customer: { id: "cl9ebqhxk00003b6093z6n3kc" },
        });
        const fd = makeFormData(validSignup);

        await signupAction(null, fd);

        expect(signupMock).toHaveBeenCalledWith(
            expect.objectContaining({
                email: "jane@example.com",
                firstName: "Jane",
                lastName: "Doe",
            }),
        );
        expect(redirectMock).toHaveBeenCalledWith("/signin?registered=true");
    });

    it("returns formError when API throws ApiError", async () => {
        signupMock.mockRejectedValue(
            new ApiError({
                statusCode: 409,
                code: "CONFLICT",
                messages: ["Email already in use"],
            }),
        );
        const fd = makeFormData(validSignup);

        const result = await signupAction(null, fd);

        expect(result?.formError).toBe("Email already in use");
        expect(redirectMock).not.toHaveBeenCalled();
    });

    it("re-throws non-ApiError exceptions", async () => {
        signupMock.mockRejectedValue(new Error("Network failure"));
        const fd = makeFormData(validSignup);

        await expect(signupAction(null, fd)).rejects.toThrow("Network failure");
    });
});
