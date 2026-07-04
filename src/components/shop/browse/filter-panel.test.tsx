import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";

const pushMock = vi.fn();
let currentParams = new URLSearchParams("");

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
    usePathname: () => "/browse",
    useSearchParams: () => currentParams,
}));

import { FilterPanel } from "./filter-panel";

const categories = [{ id: "c1", name: "Electronics" }];
const brands = [{ id: "b1", name: "Apple" }];

beforeEach(() => {
    pushMock.mockReset();
    currentParams = new URLSearchParams("");
});

describe("FilterPanel", () => {
    it("renders every facet section", () => {
        render(<FilterPanel categories={categories} brands={brands} />);
        expect(screen.getByText("Category")).toBeInTheDocument();
        expect(screen.getByText("Brand")).toBeInTheDocument();
        expect(screen.getByText("Price")).toBeInTheDocument();
        expect(screen.getByText("Condition")).toBeInTheDocument();
        expect(screen.getByRole("checkbox", { name: "New" })).toBeInTheDocument();
    });

    it("hides Clear all when no filters are active", () => {
        render(<FilterPanel categories={categories} brands={brands} />);
        expect(screen.queryByRole("link", { name: /clear all/i })).not.toBeInTheDocument();
    });

    it("shows Clear all (to /browse) when a filter is active", () => {
        currentParams = new URLSearchParams("brandId=b1");
        render(<FilterPanel categories={categories} brands={brands} />);
        expect(screen.getByRole("link", { name: /clear all/i })).toHaveAttribute("href", "/browse");
    });
});
