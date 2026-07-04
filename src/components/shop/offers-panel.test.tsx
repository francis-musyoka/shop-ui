import { describe, it, expect, vi, beforeEach, type Mock } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { OffersPanel } from "./offers-panel";

function wrapper() {
    const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
    return function Wrapper({ children }: { children: React.ReactNode }) {
        return <QueryClientProvider client={client}>{children}</QueryClientProvider>;
    };
}

const offersPage = {
    success: true,
    data: [
        {
            id: "off9aaaaaaaaaaaaaaaaaaaaa",
            condition: "NEW",
            finalPrice: 10200,
            originalPrice: 12000,
            discountPercent: 15,
            quantityAvailable: 5,
            deliveryDays: 2,
            warrantyMonths: 12,
            location: "Nairobi",
            shop: {
                id: "shop1aaaaaaaaaaaaaaaaaaaa",
                name: "Shop One",
                slug: "shop-one",
                rating: 4.6,
            },
        },
    ],
    pagination: { total: 1, page: 1, limit: 20, totalPages: 1, hasNextPage: false },
};

beforeEach(() => {
    vi.restoreAllMocks();
});

describe("OffersPanel", () => {
    it("does not fetch while closed", () => {
        const fetchSpy = vi.spyOn(globalThis, "fetch");
        render(<OffersPanel slug="phone" variantId="var1aaaaaaaaaaaaaaaaaaaaa" open={false} />, {
            wrapper: wrapper(),
        });
        expect(fetchSpy).not.toHaveBeenCalled();
    });

    it("fetches the selected variant's offers when open and renders them", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(
            new Response(JSON.stringify(offersPage), {
                status: 200,
                headers: { "content-type": "application/json" },
            }),
        );
        render(<OffersPanel slug="phone" variantId="var1aaaaaaaaaaaaaaaaaaaaa" open={true} />, {
            wrapper: wrapper(),
        });
        expect(await screen.findByText("Shop One")).toBeInTheDocument();
        const url = (globalThis.fetch as Mock).mock.calls[0]![0] as string;
        expect(url).toContain("variantId=var1aaaaaaaaaaaaaaaaaaaaa");
    });

    it("shows an error state with retry when the fetch fails", async () => {
        vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("nope", { status: 500 }));
        render(<OffersPanel slug="phone" variantId="var1aaaaaaaaaaaaaaaaaaaaa" open={true} />, {
            wrapper: wrapper(),
        });
        expect(await screen.findByRole("button", { name: /try again/i })).toBeInTheDocument();
    });
});
