import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";

let currentParams = new URLSearchParams("");

vi.mock("next/navigation", () => ({
    usePathname: () => "/browse",
    useSearchParams: () => currentParams,
}));

import { BrowsePagination } from "./browse-pagination";

beforeEach(() => {
    currentParams = new URLSearchParams("");
});

describe("BrowsePagination", () => {
    it("renders nothing for a single page", () => {
        const { container } = render(<BrowsePagination page={1} totalPages={1} />);
        expect(container).toBeEmptyDOMElement();
    });

    it("preserves existing filters in page links", () => {
        currentParams = new URLSearchParams("brandId=apple");
        render(<BrowsePagination page={1} totalPages={5} />);
        const page2 = screen.getByRole("link", { name: "2" });
        expect(page2.getAttribute("href")).toContain("brandId=apple");
        expect(page2.getAttribute("href")).toContain("page=2");
    });

    it("omits page=1 in the first-page link", () => {
        render(<BrowsePagination page={3} totalPages={5} />);
        const page1 = screen.getByRole("link", { name: "1" });
        expect(page1).toHaveAttribute("href", "/browse");
    });
});
