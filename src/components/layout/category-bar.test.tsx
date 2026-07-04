import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import type { CategoryTreeNode } from "@/lib/schemas/category";
import { CategoryBar } from "./category-bar";

const tree: CategoryTreeNode[] = Array.from({ length: 10 }, (_, i) => ({
    id: `cat${i}`,
    name: `Category ${i}`,
    slug: `category-${i}`,
    children: [],
}));

describe("CategoryBar", () => {
    it("renders the All trigger and the first 8 root categories as /browse links", () => {
        render(<CategoryBar tree={tree} />);
        expect(screen.getByRole("button", { name: /^all$/i })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Category 0" })).toHaveAttribute(
            "href",
            "/browse?categoryId=cat0",
        );
        expect(screen.getByRole("link", { name: "Category 7" })).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Category 8" })).not.toBeInTheDocument();
        // "Today's Deals" link is commented out until /deals exists.
        expect(screen.queryByRole("link", { name: /today's deals/i })).not.toBeInTheDocument();
    });
});
