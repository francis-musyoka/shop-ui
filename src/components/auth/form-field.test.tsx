import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { FormField } from "./form-field";

describe("FormField", () => {
    it("renders a label and input", () => {
        render(<FormField name="email" label="Email" type="email" />);
        expect(screen.getByLabelText("Email")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toHaveAttribute("type", "email");
        expect(screen.getByLabelText("Email")).toHaveAttribute("name", "email");
    });

    it("displays an error message when error prop is set", () => {
        render(<FormField name="email" label="Email" error="Invalid email" />);
        expect(screen.getByText("Invalid email")).toBeInTheDocument();
        expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "true");
        expect(screen.getByLabelText("Email")).toHaveAttribute("aria-describedby", "email-error");
    });

    it("does not render error markup when no error", () => {
        render(<FormField name="email" label="Email" />);
        expect(screen.getByLabelText("Email")).toHaveAttribute("aria-invalid", "false");
        expect(screen.queryByRole("paragraph")).not.toBeInTheDocument();
    });

    it("sets defaultValue when provided", () => {
        render(<FormField name="email" label="Email" defaultValue="test@example.com" />);
        expect(screen.getByLabelText("Email")).toHaveValue("test@example.com");
    });

    it("passes autoComplete attribute", () => {
        render(<FormField name="email" label="Email" autoComplete="email" />);
        expect(screen.getByLabelText("Email")).toHaveAttribute("autocomplete", "email");
    });
});
