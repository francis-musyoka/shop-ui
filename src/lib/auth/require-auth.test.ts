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
vi.mock("./session", () => ({
    getSession: vi.fn(),
}));

import { redirect } from "next/navigation";
import { getSession } from "./session";
import { requireAuth } from "./require-auth";

const getSessionMock = getSession as unknown as Mock;
const redirectMock = redirect as unknown as Mock;

describe("requireAuth", () => {
    beforeEach(() => {
        getSessionMock.mockReset();
        redirectMock.mockReset();
    });

    it("returns session when user is authenticated", async () => {
        const mockSession = {
            user: {
                id: "cl9ebqhxk00003b6093z6n3kc",
                email: "jane@example.com",
                firstName: "Jane",
                lastName: "Doe",
                userRole: {
                    id: "cl9ebqhxk00004role0000001",
                    name: "CUSTOMER",
                    permissions: [],
                },
            },
        };
        getSessionMock.mockResolvedValue(mockSession);

        const result = await requireAuth();

        expect(result).toEqual(mockSession);
        expect(redirectMock).not.toHaveBeenCalled();
    });

    it("redirects to /signin when session is null", async () => {
        getSessionMock.mockResolvedValue(null);

        await requireAuth();

        expect(redirectMock).toHaveBeenCalledWith("/signin");
    });
});
