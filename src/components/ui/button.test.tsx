import "@testing-library/jest-dom/vitest";
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { Button } from "./button";

describe("Button", () => {
    it("renders children", () => {
        render(<Button>Click me</Button>);
        expect(screen.getByRole("button", { name: "Click me" })).toBeInTheDocument();
    });

    it("applies default variant classes", () => {
        render(<Button>Default</Button>);
        const btn = screen.getByRole("button");
        expect(btn.className).toContain("bg-primary");
    });

    it("applies accent variant classes", () => {
        render(<Button variant="accent">CTA</Button>);
        const btn = screen.getByRole("button");
        expect(btn.className).toContain("bg-accent");
        expect(btn.className).toContain("text-accent-foreground");
    });

    it("applies outline variant classes", () => {
        render(<Button variant="outline">Outline</Button>);
        const btn = screen.getByRole("button");
        expect(btn.className).toContain("border-border");
    });

    it("applies destructive variant classes", () => {
        render(<Button variant="destructive">Delete</Button>);
        const btn = screen.getByRole("button");
        expect(btn.className).toContain("destructive");
    });

    it("applies size classes", () => {
        render(<Button size="lg">Large</Button>);
        const btn = screen.getByRole("button");
        expect(btn.className).toContain("h-9");
    });

    it("merges custom className", () => {
        render(<Button className="mt-4">Styled</Button>);
        const btn = screen.getByRole("button");
        expect(btn.className).toContain("mt-4");
    });

    it("passes through disabled prop", () => {
        render(<Button disabled>Disabled</Button>);
        expect(screen.getByRole("button")).toBeDisabled();
    });
});
