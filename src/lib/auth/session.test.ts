import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";

vi.mock("server-only", () => ({}));
vi.mock("@/lib/env", () => ({
    env: {
        BACKEND_API_URL: "http://localhost:4000",
        NEXT_PUBLIC_APP_URL: "http://localhost:3000",
        NODE_ENV: "test",
    },
}));
vi.mock("@/lib/api/customers", () => ({
    getProfile: vi.fn(),
}));

import { getProfile } from "@/lib/api/customers";
import { ApiError } from "@/lib/api/errors";

const getProfileMock = getProfile as unknown as Mock;

describe("getSession", () => {
    beforeEach(() => {
        vi.resetModules();
        getProfileMock.mockReset();
    });

    it("returns session with user when getProfile succeeds", async () => {
        const mockUser = {
            id: "cl9ebqhxk00003b6093z6n3kc",
            email: "jane@example.com",
            firstName: "Jane",
            lastName: "Doe",
            userRole: {
                id: "cl9ebqhxk00004role0000001",
                name: "CUSTOMER",
                permissions: [],
            },
        };
        getProfileMock.mockResolvedValue(mockUser);

        const { getSession } = await import("./session");
        const session = await getSession();

        expect(session).not.toBeNull();
        expect(session?.user.email).toBe("jane@example.com");
    });

    it("returns null when getProfile throws 401 ApiError", async () => {
        getProfileMock.mockRejectedValue(
            new ApiError({
                statusCode: 401,
                code: "UNAUTHORIZED",
                messages: ["Not authenticated"],
            }),
        );

        const { getSession } = await import("./session");
        const session = await getSession();

        expect(session).toBeNull();
    });

    it("re-throws non-401 ApiError", async () => {
        getProfileMock.mockRejectedValue(
            new ApiError({
                statusCode: 500,
                code: "INTERNAL_SERVER_ERROR",
                messages: ["Server error"],
            }),
        );

        const { getSession } = await import("./session");

        await expect(getSession()).rejects.toThrow("Server error");
    });

    it("re-throws non-ApiError exceptions", async () => {
        getProfileMock.mockRejectedValue(new Error("Network failure"));

        const { getSession } = await import("./session");

        await expect(getSession()).rejects.toThrow("Network failure");
    });
});
