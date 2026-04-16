import "@testing-library/jest-dom/vitest";
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

vi.mock("@/app/(account)/account/actions", () => ({
    logoutAction: vi.fn(),
}));

import { Navbar } from "./navbar";

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

describe("Navbar", () => {
    describe("when user is null (logged out)", () => {
        it("renders Account and Sign up links with correct hrefs", () => {
            render(<Navbar user={null} />);

            const accountLink = screen.getByRole("link", { name: /account/i });
            const signUp = screen.getByRole("link", { name: /sign up/i });

            expect(accountLink).toBeInTheDocument();
            expect(accountLink).toHaveAttribute("href", "/signin");
            expect(signUp).toBeInTheDocument();
            expect(signUp).toHaveAttribute("href", "/signup");
        });

        it("does not render account menu", () => {
            render(<Navbar user={null} />);

            expect(screen.queryByLabelText("Account menu")).not.toBeInTheDocument();
        });
    });

    describe("when user is provided (logged in)", () => {
        it("renders the avatar with user initials", () => {
            render(<Navbar user={mockUser} />);

            expect(screen.getByText("JD")).toBeInTheDocument();
        });

        it("renders the account menu trigger", () => {
            render(<Navbar user={mockUser} />);

            expect(screen.getByLabelText("Account menu")).toBeInTheDocument();
        });

        it("does not render Sign in / Sign up buttons", () => {
            render(<Navbar user={mockUser} />);

            expect(screen.queryByRole("button", { name: /sign in/i })).not.toBeInTheDocument();
            expect(screen.queryByRole("button", { name: /sign up/i })).not.toBeInTheDocument();
        });
    });
});
