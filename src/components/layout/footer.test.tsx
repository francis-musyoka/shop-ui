import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { Footer } from "./footer";

describe("Footer", () => {
    it("renders the Riverflow brand name", () => {
        render(<Footer />);
        const headings = screen.getAllByText("Riverflow");
        expect(headings.length).toBeGreaterThanOrEqual(1);
    });

    it("renders Browse All and Categories links", () => {
        render(<Footer />);
        expect(screen.getByRole("link", { name: /browse all/i })).toHaveAttribute(
            "href",
            "/browse",
        );
        expect(screen.getByRole("link", { name: /categories/i })).toHaveAttribute(
            "href",
            "/categories",
        );
    });

    it("renders Sign In and Create Account links", () => {
        render(<Footer />);
        expect(screen.getByRole("link", { name: /sign in/i })).toHaveAttribute("href", "/signin");
        expect(screen.getByRole("link", { name: /create account/i })).toHaveAttribute(
            "href",
            "/signup",
        );
    });

    it("renders copyright text", () => {
        render(<Footer />);
        expect(screen.getByText(/Riverflow. All rights reserved/)).toBeInTheDocument();
    });

    it("renders Back to top button", () => {
        render(<Footer />);
        expect(screen.getByRole("button", { name: /back to top/i })).toBeInTheDocument();
    });
});
