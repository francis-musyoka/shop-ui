import { describe, it, expect } from "vitest";
import {
    CategorySchema,
    CategoryTreeNodeSchema,
    CategoryTreeResponseSchema,
    TopLevelCategoriesResponseSchema,
    CategoryBySlugResponseSchema,
    CategoryBreadcrumbResponseSchema,
} from "./category";
import categoryFixtures from "../../../tests/fixtures/backend/categories.json";

describe("CategorySchema", () => {
    it("parses a flat category", () => {
        const cat = categoryFixtures.topLevelSuccess.categories[0];
        const parsed = CategorySchema.parse(cat);
        expect(parsed.name).toBe("Electronics");
        expect(parsed.slug).toBe("electronics");
    });
});

describe("CategoryTreeNodeSchema", () => {
    it("parses nested tree nodes", () => {
        const node = categoryFixtures.treeSuccess.categories[0];
        const parsed = CategoryTreeNodeSchema.parse(node);
        expect(parsed.children).toHaveLength(2);
        expect(parsed.children[0]!.children).toHaveLength(1);
        expect(parsed.children[0]!.children[0]!.name).toBe("Smartphones");
    });
});

describe("CategoryTreeResponseSchema", () => {
    it("parses the full tree response", () => {
        const parsed = CategoryTreeResponseSchema.parse(categoryFixtures.treeSuccess);
        expect(parsed.categories).toHaveLength(2);
    });
});

describe("TopLevelCategoriesResponseSchema", () => {
    it("parses the top-level response", () => {
        const parsed = TopLevelCategoriesResponseSchema.parse(categoryFixtures.topLevelSuccess);
        expect(parsed.categories).toHaveLength(3);
    });
});

describe("CategoryBySlugResponseSchema", () => {
    it("parses a category with parent and children", () => {
        const parsed = CategoryBySlugResponseSchema.parse(categoryFixtures.bySlugSuccess);
        expect(parsed.category.name).toBe("Phones");
        expect(parsed.category.parent?.name).toBe("Electronics");
        expect(parsed.category.children).toHaveLength(1);
    });
});

describe("CategoryBreadcrumbResponseSchema", () => {
    it("parses a breadcrumb array", () => {
        const parsed = CategoryBreadcrumbResponseSchema.parse(categoryFixtures.breadcrumbSuccess);
        expect(parsed.breadcrumb).toHaveLength(2);
        expect(parsed.breadcrumb[0]!.name).toBe("Electronics");
        expect(parsed.breadcrumb[1]!.name).toBe("Phones");
    });
});
