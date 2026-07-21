import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { CategoryTreeNode } from "@/lib/schemas/category";
import { ShopFormFields } from "./shop-form-fields";

function wrapper() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    };
}

const categories: CategoryTreeNode[] = [
    { id: "electronics", name: "Electronics", slug: "electronics", children: [] },
    { id: "fashion", name: "Fashion", slug: "fashion" },
];

describe("ShopFormFields", () => {
    it("create mode: Country is disabled with value Kenya, category is a picker", () => {
        render(<ShopFormFields mode="create" fieldErrors={{}} categories={categories} />, {
            wrapper: wrapper(),
        });

        const country = screen.getByLabelText("Country");
        expect(country).toBeDisabled();
        expect(country).toHaveValue("Kenya");

        expect(screen.getByRole("button", { name: /select a category/i })).toBeInTheDocument();
        expect(
            screen.queryByText(/contact support to change your shop category/i),
        ).not.toBeInTheDocument();
    });

    it("disableCategory: category is read-only with a support hint", () => {
        render(
            <ShopFormFields
                mode="edit"
                fieldErrors={{}}
                categories={categories}
                disableCategory
                defaults={{ categoryId: "electronics", categoryName: "Electronics" }}
            />,
            { wrapper: wrapper() },
        );

        expect(
            screen.queryByRole("button", { name: /select a category/i }),
        ).not.toBeInTheDocument();
        expect(screen.getByRole("textbox", { name: "Category" })).toHaveTextContent("Electronics");
        expect(
            screen.getByText(/contact support to change your shop category/i),
        ).toBeInTheDocument();
    });
});
