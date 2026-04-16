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
vi.mock("next/cache", () => ({
    revalidatePath: vi.fn(),
}));
vi.mock("@/lib/api/customers", () => ({
    getProfile: vi.fn(),
    updateProfile: vi.fn(),
    updatePassword: vi.fn(),
    logout: vi.fn(),
}));

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { getProfile, updateProfile, updatePassword, logout } from "@/lib/api/customers";
import { ApiError } from "@/lib/api/errors";
import { updateProfileAction, updatePasswordAction, logoutAction } from "./actions";

const getProfileMock = getProfile as unknown as Mock;
const updateProfileMock = updateProfile as unknown as Mock;
const updatePasswordMock = updatePassword as unknown as Mock;
const logoutMock = logout as unknown as Mock;
const redirectMock = redirect as unknown as Mock;
const revalidatePathMock = revalidatePath as unknown as Mock;

const mockUser = {
    id: "cl9ebqhxk00003b6093z6n3kc",
    email: "jane@example.com",
    firstName: "Jane",
    lastName: "Doe",
    userRole: { id: "role1", name: "CUSTOMER", permissions: [] },
};

function makeFormData(data: Record<string, string>): FormData {
    const fd = new FormData();
    for (const [key, value] of Object.entries(data)) {
        fd.set(key, value);
    }
    return fd;
}

describe("updateProfileAction", () => {
    beforeEach(() => {
        getProfileMock.mockReset().mockResolvedValue(mockUser);
        updateProfileMock.mockReset();
        revalidatePathMock.mockReset();
        redirectMock.mockReset();
    });

    it("returns fieldErrors when firstName is too short", async () => {
        const fd = makeFormData({ firstName: "J", lastName: "Doe" });
        const result = await updateProfileAction(null, fd);

        expect(result?.fieldErrors?.firstName).toBeDefined();
        expect(updateProfileMock).not.toHaveBeenCalled();
    });

    it("returns fieldErrors when lastName is too short", async () => {
        const fd = makeFormData({ firstName: "Jane", lastName: "D" });
        const result = await updateProfileAction(null, fd);

        expect(result?.fieldErrors?.lastName).toBeDefined();
        expect(updateProfileMock).not.toHaveBeenCalled();
    });

    it("calls updateProfile and returns success on valid input", async () => {
        updateProfileMock.mockResolvedValue({ success: true });
        const fd = makeFormData({ firstName: "Jane", lastName: "Doe" });

        const result = await updateProfileAction(null, fd);

        expect(updateProfileMock).toHaveBeenCalledWith({
            firstName: "Jane",
            lastName: "Doe",
        });
        expect(revalidatePathMock).toHaveBeenCalledWith("/account");
        expect(result).toEqual({ success: true });
    });

    it("returns formError when API throws ApiError", async () => {
        updateProfileMock.mockRejectedValue(
            new ApiError({
                statusCode: 400,
                code: "VALIDATION_ERROR",
                messages: ["Invalid name"],
            }),
        );
        const fd = makeFormData({ firstName: "Jane", lastName: "Doe" });

        const result = await updateProfileAction(null, fd);

        expect(result?.formError).toBe("Invalid name");
    });

    it("re-throws non-ApiError exceptions", async () => {
        updateProfileMock.mockRejectedValue(new Error("Network failure"));
        const fd = makeFormData({ firstName: "Jane", lastName: "Doe" });

        await expect(updateProfileAction(null, fd)).rejects.toThrow("Network failure");
    });
});

describe("updatePasswordAction", () => {
    beforeEach(() => {
        getProfileMock.mockReset().mockResolvedValue(mockUser);
        updatePasswordMock.mockReset();
        redirectMock.mockReset();
    });

    it("returns fieldErrors when currentPassword is empty", async () => {
        const fd = makeFormData({
            currentPassword: "",
            newPassword: "Strong1Pass!",
            currentPasswordConfirm: "",
        });
        const result = await updatePasswordAction(null, fd);

        expect(result?.fieldErrors?.currentPassword).toBeDefined();
        expect(updatePasswordMock).not.toHaveBeenCalled();
    });

    it("returns fieldErrors when newPassword is too weak", async () => {
        const fd = makeFormData({
            currentPassword: "OldPass1!",
            newPassword: "weak",
            currentPasswordConfirm: "OldPass1!",
        });
        const result = await updatePasswordAction(null, fd);

        expect(result?.fieldErrors?.newPassword).toBeDefined();
        expect(updatePasswordMock).not.toHaveBeenCalled();
    });

    it("returns fieldErrors when newPassword equals currentPassword", async () => {
        const fd = makeFormData({
            currentPassword: "Strong1Pass!",
            newPassword: "Strong1Pass!",
            currentPasswordConfirm: "Strong1Pass!",
        });
        const result = await updatePasswordAction(null, fd);

        expect(result?.fieldErrors?.newPassword).toBeDefined();
        expect(updatePasswordMock).not.toHaveBeenCalled();
    });

    it("calls updatePassword and returns success on valid input", async () => {
        updatePasswordMock.mockResolvedValue({ success: true });
        const fd = makeFormData({
            currentPassword: "OldStrong1!",
            newPassword: "NewStrong2!",
            currentPasswordConfirm: "NewStrong2!",
        });

        const result = await updatePasswordAction(null, fd);

        expect(updatePasswordMock).toHaveBeenCalledWith({
            currentPassword: "OldStrong1!",
            newPassword: "NewStrong2!",
            currentPasswordConfirm: "NewStrong2!",
        });
        expect(result).toEqual({ success: true });
    });

    it("returns formError when API throws ApiError", async () => {
        updatePasswordMock.mockRejectedValue(
            new ApiError({
                statusCode: 401,
                code: "UNAUTHORIZED",
                messages: ["Current password is incorrect"],
            }),
        );
        const fd = makeFormData({
            currentPassword: "WrongOld1!",
            newPassword: "NewStrong2!",
            currentPasswordConfirm: "NewStrong2!",
        });

        const result = await updatePasswordAction(null, fd);

        expect(result?.formError).toBe("Current password is incorrect");
    });

    it("re-throws non-ApiError exceptions", async () => {
        updatePasswordMock.mockRejectedValue(new Error("Network failure"));
        const fd = makeFormData({
            currentPassword: "OldStrong1!",
            newPassword: "NewStrong2!",
            currentPasswordConfirm: "NewStrong2!",
        });

        await expect(updatePasswordAction(null, fd)).rejects.toThrow("Network failure");
    });
});

describe("logoutAction", () => {
    beforeEach(() => {
        getProfileMock.mockReset().mockResolvedValue(mockUser);
        logoutMock.mockReset();
        redirectMock.mockReset();
    });

    it("calls logout and redirects to /signin", async () => {
        logoutMock.mockResolvedValue({ success: true });

        await logoutAction();

        expect(logoutMock).toHaveBeenCalled();
        expect(redirectMock).toHaveBeenCalledWith("/signin");
    });

    it("still redirects even when logout API fails", async () => {
        logoutMock.mockRejectedValue(new Error("Network failure"));

        await logoutAction();

        expect(redirectMock).toHaveBeenCalledWith("/signin");
    });
});
