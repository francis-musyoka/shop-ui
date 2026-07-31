import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { ProductPageClient } from "./product-page-client";
import type { ProductDetail } from "@/lib/schemas/product";

const product: ProductDetail = {
    id: "p1",
    title: "Galaxy A17",
    slug: "galaxy-a17",
    description: "Great phone.",
    specs: { Display: '6.7"' },
    status: "ACTIVE",
    createdAt: "2026-01-01T00:00:00Z",
    category: { id: "c1", name: "Phones", slug: "phones" },
    brand: { id: "b1", name: "Samsung", slug: "samsung" },
    images: [{ id: "i1", url: "https://x/1.jpg", order: 0 }],
    buyBoxVariantId: "v2",
    variants: [
        {
            id: "v1",
            attributes: { Storage: "128GB" },
            colorHex: null,
            images: [],
            offerCount: 2,
            buyBox: {
                id: "o1",
                condition: "NEW",
                finalPrice: 10200,
                originalPrice: 12000,
                discountPercent: 15,
                quantityAvailable: 7,
                deliveryDays: 2,
                warrantyMonths: 12,
                location: "Nairobi",
                shop: { id: "s1", name: "Shop One", slug: "shop-one", rating: 4.6 },
                quantityTotal: 7,
                quantityReserved: 0,
                isFeatured: true,
                createdAt: "2026-01-01T00:00:00Z",
            },
        },
        {
            id: "v2",
            attributes: { Storage: "256GB" },
            colorHex: null,
            images: [],
            offerCount: 3,
            buyBox: {
                id: "o2",
                condition: "NEW",
                finalPrice: 15500,
                originalPrice: 18000,
                discountPercent: 14,
                quantityAvailable: 5,
                deliveryDays: 2,
                warrantyMonths: 12,
                location: "Nairobi",
                shop: { id: "s2", name: "Shop Two", slug: "shop-two", rating: 4.8 },
                quantityTotal: 5,
                quantityReserved: 0,
                isFeatured: true,
                createdAt: "2026-01-01T00:00:00Z",
            },
        },
    ],
};

describe("ProductPageClient", () => {
    it("renders the title and brand", () => {
        render(<ProductPageClient product={product} />);
        expect(screen.getByRole("heading", { name: "Galaxy A17" })).toBeInTheDocument();
        expect(screen.getByRole("link", { name: /Samsung/ })).toBeInTheDocument();
    });

    it("renders the derived buy-box price and strike-through original", () => {
        render(<ProductPageClient product={product} />);
        expect(screen.getByText("KSh 15,500")).toBeInTheDocument();
        expect(screen.getByText("KSh 18,000")).toBeInTheDocument();
    });

    it("shows the About-this-item placeholder", () => {
        render(<ProductPageClient product={product} />);
        expect(screen.getByText("Coming soon")).toBeInTheDocument();
    });

    it("shows the winning offer's shop name and the product condition", () => {
        render(<ProductPageClient product={product} />);
        // Shop profile page (/shops/[slug]) is not built yet, so the name renders
        // as plain text rather than a link — see the commented-out Link in the component.
        expect(screen.getByText("Shop Two")).toBeInTheDocument();
        expect(screen.queryByRole("link", { name: "Shop Two" })).not.toBeInTheDocument();
        expect(screen.getByText("New")).toBeInTheDocument();
    });

    it("shows the seller count from offerCount", () => {
        render(<ProductPageClient product={product} />);
        expect(screen.getByText(/3 sellers offering this product/)).toBeInTheDocument();
    });

    it("opens on the buy-box variant so the price matches the card", () => {
        render(<ProductPageClient product={product} />);
        // buyBoxVariantId points to v2 (not variants[0]); must show v2's price, not v1's
        expect(screen.getByText("KSh 15,500")).toBeInTheDocument();
        // Ensure v1's price is NOT shown (regression check)
        expect(screen.queryByText("KSh 10,200")).not.toBeInTheDocument();
    });
});
