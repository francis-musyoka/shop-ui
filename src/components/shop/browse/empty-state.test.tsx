import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { EmptyState } from "./empty-state";

describe("EmptyState", () => {
    it("shows a message and a Clear filters link to /browse", () => {
        render(<EmptyState />);
        expect(screen.getByText(/no products match/i)).toBeInTheDocument();
        const link = screen.getByRole("link", { name: /clear filters/i });
        expect(link).toHaveAttribute("href", "/browse");
    });
});
