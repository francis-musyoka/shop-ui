import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { ListingCard } from "./listing-card";
import type { ProductCard } from "@/lib/schemas/product";

const mockProduct: ProductCard = {
    id: "cl9ebqhxk00010prod0000001",
    title: "Samsung Galaxy S24 Ultra",
    slug: "samsung-galaxy-s24-ultra",
    specs: { display: '6.8" QHD+ AMOLED' },
    brand: { name: "Samsung", slug: "samsung" },
    category: { name: "Phones", slug: "phones" },
    images: [
        {
            id: "cl9ebqhxk00020img00000001",
            url: "https://res.cloudinary.com/demo/image/upload/sample.jpg",
        },
    ],
    variants: [
        {
            id: "cl9ebqhxk00030var00000001",
            attributes: { storage: "256gb", color: "black" },
            colorHex: "#000000",
        },
    ],
    lowestPrice: 145000,
};

describe("ListingCard", () => {
    it("renders the product title", () => {
        render(<ListingCard product={mockProduct} />);
        expect(screen.getByText("Samsung Galaxy S24 Ultra")).toBeInTheDocument();
    });

    it("renders the brand name", () => {
        render(<ListingCard product={mockProduct} />);
        expect(screen.getByText("Samsung")).toBeInTheDocument();
    });

    it("renders a formatted KSh price with mono font", () => {
        render(<ListingCard product={mockProduct} />);
        const priceEl = screen.getByText(/KSh/);
        expect(priceEl).toBeInTheDocument();
        expect(priceEl.className).toContain("font-mono");
    });

    it("links to the product detail page", () => {
        render(<ListingCard product={mockProduct} />);
        const link = screen.getByRole("link");
        expect(link).toHaveAttribute("href", "/products/samsung-galaxy-s24-ultra");
    });

    it("renders an image when available", () => {
        render(<ListingCard product={mockProduct} />);
        const img = screen.getByRole("img", { name: "Samsung Galaxy S24 Ultra" });
        expect(img).toBeInTheDocument();
    });

    it("renders 'No image' placeholder when no images", () => {
        const noImageProduct: ProductCard = {
            ...mockProduct,
            images: [],
        };
        render(<ListingCard product={noImageProduct} />);
        expect(screen.getByText("No image")).toBeInTheDocument();
    });

    it("does not render price when lowestPrice is null", () => {
        const noPriceProduct: ProductCard = {
            ...mockProduct,
            lowestPrice: null,
        };
        render(<ListingCard product={noPriceProduct} />);
        expect(screen.queryByText(/KSh/)).not.toBeInTheDocument();
    });
});
