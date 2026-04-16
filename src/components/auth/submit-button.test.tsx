import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { SubmitButton } from "./submit-button";

describe("SubmitButton", () => {
    it("renders children text", () => {
        render(<SubmitButton pending={false}>Sign in</SubmitButton>);
        expect(screen.getByRole("button", { name: /sign in/i })).toBeInTheDocument();
    });

    it("is disabled when pending", () => {
        render(<SubmitButton pending={true}>Sign in</SubmitButton>);
        expect(screen.getByRole("button", { name: /sign in/i })).toBeDisabled();
    });

    it("is enabled when not pending", () => {
        render(<SubmitButton pending={false}>Sign in</SubmitButton>);
        expect(screen.getByRole("button", { name: /sign in/i })).not.toBeDisabled();
    });

    it("shows spinner when pending", () => {
        const { container } = render(<SubmitButton pending={true}>Sign in</SubmitButton>);
        expect(container.querySelector(".animate-spin")).toBeInTheDocument();
    });

    it("does not show spinner when not pending", () => {
        const { container } = render(<SubmitButton pending={false}>Sign in</SubmitButton>);
        expect(container.querySelector(".animate-spin")).not.toBeInTheDocument();
    });
});
