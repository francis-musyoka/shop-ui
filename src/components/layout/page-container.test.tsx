import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { PageContainer } from "./page-container";

describe("PageContainer", () => {
    it("renders children", () => {
        render(
            <PageContainer>
                <p>Hello</p>
            </PageContainer>,
        );
        expect(screen.getByText("Hello")).toBeInTheDocument();
    });

    it("applies max-w-7xl and px-4 classes", () => {
        const { container } = render(<PageContainer>Content</PageContainer>);
        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper.className).toContain("max-w-7xl");
        expect(wrapper.className).toContain("px-4");
        expect(wrapper.className).toContain("mx-auto");
    });

    it("merges custom className", () => {
        const { container } = render(<PageContainer className="py-8">Content</PageContainer>);
        const wrapper = container.firstElementChild as HTMLElement;
        expect(wrapper.className).toContain("py-8");
    });
});
