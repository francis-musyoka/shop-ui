import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormError } from "./form-error";

describe("FormError", () => {
    it("renders nothing when message is undefined", () => {
        const { container } = render(<FormError />);
        expect(container.firstChild).toBeNull();
    });

    it("renders nothing when message is empty string", () => {
        const { container } = render(<FormError message="" />);
        expect(container.firstChild).toBeNull();
    });

    it("renders the error message in an alert role", () => {
        render(<FormError message="Invalid credentials" />);
        expect(screen.getByRole("alert")).toBeInTheDocument();
        expect(screen.getByText("Invalid credentials")).toBeInTheDocument();
    });
});
