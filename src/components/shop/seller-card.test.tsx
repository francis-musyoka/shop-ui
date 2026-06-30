import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { SellerCard } from "./seller-card";

describe("SellerCard", () => {
    it("renders the shop name linking to its storefront", () => {
        render(
            <SellerCard
                shop={{
                    id: "s1",
                    name: "Riverflow Electronics",
                    slug: "riverflow-electronics",
                    rating: 4.6,
                }}
            />,
        );
        const link = screen.getByRole("link", { name: /Riverflow Electronics/ });
        expect(link).toHaveAttribute("href", "/shops/riverflow-electronics");
    });
});
