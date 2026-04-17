import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { ListingCard } from "./listing-card";
import type { ProductCard } from "@/lib/schemas/product";

const mockProduct: ProductCard = {
    id: "cl9ebqhxk00010prod0000001",
    slug: "samsung-galaxy-s24-ultra",
    title: "Samsung Galaxy S24 Ultra",
    mainImageUrl: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
    variantCount: 3,
    offerCount: 5,
    buybox: {
        price: 145000,
        originalPrice: 160000,
        discountPercent: 9.375,
        condition: "NEW",
        stock: 8,
    },
};

describe("ListingCard", () => {
    it("renders the product title", () => {
        render(<ListingCard product={mockProduct} />);
        expect(screen.getByText("Samsung Galaxy S24 Ultra")).toBeInTheDocument();
    });

    it("renders a formatted KSh price with mono font", () => {
        render(<ListingCard product={mockProduct} />);
        const priceEl = screen.getByText("KSh 145,000");
        expect(priceEl).toBeInTheDocument();
        expect(priceEl.className).toContain("font-mono");
    });

    it("renders original price with strikethrough when discounted", () => {
        render(<ListingCard product={mockProduct} />);
        const originalEl = screen.getByText("KSh 160,000");
        expect(originalEl).toBeInTheDocument();
        expect(originalEl.className).toContain("line-through");
    });

    it("renders the discount badge when discountPercent > 0", () => {
        render(<ListingCard product={mockProduct} />);
        expect(screen.getByText("-9%")).toBeInTheDocument();
    });

    it("renders a 'From' prefix when variantCount > 1", () => {
        render(<ListingCard product={mockProduct} />);
        expect(screen.getByText("From")).toBeInTheDocument();
    });

    it("shows low-stock nudge when stock <= 10", () => {
        render(
            <ListingCard
                product={{ ...mockProduct, buybox: { ...mockProduct.buybox, stock: 4 } }}
            />,
        );
        expect(screen.getByText("Only 4 left in stock — order soon")).toBeInTheDocument();
    });

    it("hides low-stock nudge when stock > 10", () => {
        render(
            <ListingCard
                product={{ ...mockProduct, buybox: { ...mockProduct.buybox, stock: 25 } }}
            />,
        );
        expect(screen.queryByText(/left in stock/)).not.toBeInTheDocument();
    });

    it("omits 'From' prefix when variantCount is 1", () => {
        render(<ListingCard product={{ ...mockProduct, variantCount: 1 }} />);
        expect(screen.queryByText("From")).not.toBeInTheDocument();
    });

    it("omits discount badge when discountPercent is null", () => {
        const noDiscount: ProductCard = {
            ...mockProduct,
            buybox: { ...mockProduct.buybox, discountPercent: null, originalPrice: null },
        };
        render(<ListingCard product={noDiscount} />);
        expect(screen.queryByText(/^-\d+%$/)).not.toBeInTheDocument();
        expect(screen.queryByText("KSh 160,000")).not.toBeInTheDocument();
    });

    it("links to the product detail page", () => {
        render(<ListingCard product={mockProduct} />);
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", "/products/samsung-galaxy-s24-ultra");
    });

    it("renders the main image with product title as alt text", () => {
        render(<ListingCard product={mockProduct} />);
        const img = screen.getByRole("img", { name: "Samsung Galaxy S24 Ultra" });
        expect(img).toBeInTheDocument();
    });
});
