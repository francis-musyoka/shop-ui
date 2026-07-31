import { describe, it, expect } from "vitest";
import { filterAvailable, pruneCategoryTree } from "./category-filters";
import type { CategoryTreeNode } from "@/lib/schemas/category";

describe("filterAvailable", () => {
    it("drops items with productCount 0", () => {
        const items = [
            { id: "a", productCount: 0 },
            { id: "b", productCount: 3 },
        ];
        const result = filterAvailable(items);
        expect(result).toHaveLength(1);
        expect(result[0]!.id).toBe("b");
    });

    it("keeps items with productCount undefined (fail open)", () => {
        const items = [{ id: "a" }, { id: "b", productCount: 0 }];
        const result = filterAvailable(items);
        expect(result).toHaveLength(1);
        expect(result[0]!.id).toBe("a");
    });

    it("keeps items with a positive productCount", () => {
        const items = [{ id: "a", productCount: 5 }];
        expect(filterAvailable(items)).toHaveLength(1);
    });

    it("returns an empty array for an empty array", () => {
        expect(filterAvailable([])).toEqual([]);
    });
});

describe("pruneCategoryTree", () => {
    it("drops a leaf with productCount 0", () => {
        const tree: CategoryTreeNode[] = [
            { id: "a", name: "A", slug: "a", productCount: 0 },
            { id: "b", name: "B", slug: "b", productCount: 2 },
        ];
        const result = pruneCategoryTree(tree);
        expect(result).toHaveLength(1);
        expect(result[0]!.id).toBe("b");
    });

    it("keeps a leaf with productCount undefined", () => {
        const tree: CategoryTreeNode[] = [{ id: "a", name: "A", slug: "a" }];
        expect(pruneCategoryTree(tree)).toHaveLength(1);
    });

    it("keeps a parent with a positive productCount even when all children get pruned", () => {
        const tree: CategoryTreeNode[] = [
            {
                id: "parent",
                name: "Parent",
                slug: "parent",
                productCount: 5,
                children: [{ id: "child", name: "Child", slug: "child", productCount: 0 }],
            },
        ];
        const result = pruneCategoryTree(tree);
        expect(result).toHaveLength(1);
        expect(result[0]!.children).toEqual([]);
    });

    it("keeps a parent with productCount 0 if it has a surviving child (safety net against a buggy backend rollup)", () => {
        const tree: CategoryTreeNode[] = [
            {
                id: "parent",
                name: "Parent",
                slug: "parent",
                productCount: 0,
                children: [{ id: "child", name: "Child", slug: "child", productCount: 3 }],
            },
        ];
        const result = pruneCategoryTree(tree);
        expect(result).toHaveLength(1);
        expect(result[0]!.children).toHaveLength(1);
        expect(result[0]!.children![0]!.id).toBe("child");
    });

    it("drops a parent with productCount 0 and no surviving children", () => {
        const tree: CategoryTreeNode[] = [
            {
                id: "parent",
                name: "Parent",
                slug: "parent",
                productCount: 0,
                children: [{ id: "child", name: "Child", slug: "child", productCount: 0 }],
            },
        ];
        expect(pruneCategoryTree(tree)).toEqual([]);
    });

    it("returns an empty array for an empty array", () => {
        expect(pruneCategoryTree([])).toEqual([]);
    });
});
