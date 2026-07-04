import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { CategoryTreeNode } from "@/lib/schemas/category";
import { CategoryDrilldown } from "./category-drilldown";

const tree: CategoryTreeNode[] = [
    {
        id: "electronics",
        name: "Electronics",
        slug: "electronics",
        children: [
            {
                id: "phones",
                name: "Phones",
                slug: "phones",
                children: [{ id: "smartphones", name: "Smartphones", slug: "smartphones" }],
            },
            { id: "tablets", name: "Tablets", slug: "tablets" },
        ],
    },
    { id: "fashion", name: "Fashion", slug: "fashion", children: [] },
];

describe("CategoryDrilldown", () => {
    it("lists top-level categories at root; leaves are links, parents are drill buttons", () => {
        render(<CategoryDrilldown tree={tree} onNavigate={() => {}} />);
        expect(screen.getByText("All Categories")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Electronics" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Fashion" })).toHaveAttribute(
            "href",
            "/browse?categoryId=fashion",
        );
    });

    it("drills into a parent, showing Shop-all + children", async () => {
        const user = userEvent.setup();
        render(<CategoryDrilldown tree={tree} onNavigate={() => {}} />);
        await user.click(screen.getByRole("button", { name: "Electronics" }));
        expect(screen.getByRole("link", { name: /shop all electronics/i })).toHaveAttribute(
            "href",
            "/browse?categoryId=electronics",
        );
        expect(screen.getByRole("button", { name: "Phones" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: "Tablets" })).toHaveAttribute(
            "href",
            "/browse?categoryId=tablets",
        );
    });

    it("drills two levels to grandchildren as leaf links", async () => {
        const user = userEvent.setup();
        render(<CategoryDrilldown tree={tree} onNavigate={() => {}} />);
        await user.click(screen.getByRole("button", { name: "Electronics" }));
        await user.click(screen.getByRole("button", { name: "Phones" }));
        expect(screen.getByRole("link", { name: "Smartphones" })).toHaveAttribute(
            "href",
            "/browse?categoryId=smartphones",
        );
    });

    it("Back pops exactly one level (grandchildren → parent's children, not root)", async () => {
        const user = userEvent.setup();
        render(<CategoryDrilldown tree={tree} onNavigate={() => {}} />);
        await user.click(screen.getByRole("button", { name: "Electronics" }));
        await user.click(screen.getByRole("button", { name: "Phones" }));
        await user.click(screen.getByRole("button", { name: /back/i }));
        expect(screen.getByRole("link", { name: /shop all electronics/i })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Phones" })).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Fashion" })).not.toBeInTheDocument();
    });

    it("calls onNavigate when the close button is clicked", async () => {
        const user = userEvent.setup();
        const onNavigate = vi.fn();
        render(<CategoryDrilldown tree={tree} onNavigate={onNavigate} />);
        await user.click(screen.getByRole("button", { name: /close menu/i }));
        expect(onNavigate).toHaveBeenCalledOnce();
    });
});
