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
    variants: [
        {
            id: "v1",
            attributes: { Storage: "128GB" },
            colorHex: null,
            images: [],
            offers: [
                {
                    id: "o1",
                    price: 12000,
                    discount: 1800,
                    quantityTotal: 7,
                    quantityAvailable: 7,
                    condition: "NEW",
                    status: "ACTIVE",
                    deliveryDays: 2,
                    warrantyMonths: 12,
                    isFeatured: true,
                    location: "Nairobi",
                    finalPrice: 10200,
                    shop: { id: "s1", name: "Shop One", slug: "shop-one", rating: 4.6 },
                },
            ],
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
        expect(screen.getByText("KSh 10,200")).toBeInTheDocument();
        expect(screen.getByText("KSh 12,000")).toBeInTheDocument();
    });

    it("shows the About-this-item placeholder", () => {
        render(<ProductPageClient product={product} />);
        expect(screen.getByText("Coming soon")).toBeInTheDocument();
    });

    it("shows the winning offer's shop (linked) and the product condition", () => {
        render(<ProductPageClient product={product} />);
        const shopLink = screen.getByRole("link", { name: "Shop One" });
        expect(shopLink).toHaveAttribute("href", "/shops/shop-one");
        expect(screen.getByText(/Status:\s*New/)).toBeInTheDocument();
    });
});
