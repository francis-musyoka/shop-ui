import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { OfferList } from "./offer-list";
import type { OfferSummary } from "@/lib/schemas/product";

const offers: OfferSummary[] = [
    {
        id: "of1aaaaaaaaaaaaaaaaaaaaaa",
        condition: "NEW",
        finalPrice: 10200,
        originalPrice: 12000,
        discountPercent: 15,
        quantityAvailable: 5,
        deliveryDays: 2,
        warrantyMonths: 12,
        location: "Nairobi",
        shop: { id: "s1aaaaaaaaaaaaaaaaaaaaaa", name: "Shop One", slug: "shop-one", rating: 4.6 },
    },
];

describe("OfferList", () => {
    it("renders a row per offer with its final price", () => {
        render(<OfferList offers={offers} />);
        expect(screen.getByText("KSh 10,200")).toBeInTheDocument();
        expect(screen.getByText("Shop One")).toBeInTheDocument();
    });

    it("renders Message seller disabled while messaging is off", () => {
        render(<OfferList offers={offers} />);
        const btn = screen.getByRole("button", { name: /Message seller/ });
        expect(btn).toBeDisabled();
    });

    it("shows an empty hint when there are no offers", () => {
        render(<OfferList offers={[]} />);
        expect(screen.getByText(/No offers/)).toBeInTheDocument();
    });
});
