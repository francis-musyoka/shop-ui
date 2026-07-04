import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { SellerCard } from "./seller-card";

describe("SellerCard", () => {
    it("renders the shop name as text (storefront link deferred until /shops exists)", () => {
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
        // The /shops/[slug] route isn't built yet, so the name renders as plain
        // text rather than a link — see the commented-out Link in the component.
        expect(screen.getByText("Riverflow Electronics")).toBeInTheDocument();
        expect(
            screen.queryByRole("link", { name: /Riverflow Electronics/ }),
        ).not.toBeInTheDocument();
    });
});
