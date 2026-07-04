import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushMock = vi.fn();
let currentParams = new URLSearchParams("");

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
    usePathname: () => "/browse",
    useSearchParams: () => currentParams,
}));

import { PriceFacet } from "./price-facet";

beforeEach(() => {
    pushMock.mockReset();
    currentParams = new URLSearchParams("");
});

describe("PriceFacet", () => {
    it("renders all preset ranges as radios", () => {
        render(<PriceFacet />);
        expect(screen.getByRole("radio", { name: "Under KSh 10,000" })).toBeInTheDocument();
        expect(screen.getByRole("radio", { name: "Over KSh 100,000" })).toBeInTheDocument();
    });

    it("marks the active range from the URL", () => {
        currentParams = new URLSearchParams("minPrice=10000&maxPrice=30000");
        render(<PriceFacet />);
        expect(screen.getByRole("radio", { name: "KSh 10,000 – 30,000" })).toBeChecked();
    });

    it("pushes bounds when a range is selected", async () => {
        const user = userEvent.setup();
        render(<PriceFacet />);
        await user.click(screen.getByRole("radio", { name: "KSh 10,000 – 30,000" }));
        expect(pushMock).toHaveBeenCalledWith("/browse?minPrice=10000&maxPrice=30000");
    });

    it("clears price when the active range is reselected", async () => {
        const user = userEvent.setup();
        currentParams = new URLSearchParams("minPrice=10000&maxPrice=30000");
        render(<PriceFacet />);
        await user.click(screen.getByRole("radio", { name: "KSh 10,000 – 30,000" }));
        expect(pushMock).toHaveBeenCalledWith("/browse");
    });
});
