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

import { FacetCheckboxGroup } from "./facet-checkbox-group";

const options = [
    { value: "apple", label: "Apple" },
    { value: "samsung", label: "Samsung" },
];

beforeEach(() => {
    pushMock.mockReset();
    currentParams = new URLSearchParams("");
});

describe("FacetCheckboxGroup", () => {
    it("renders the title and options", () => {
        render(<FacetCheckboxGroup title="Brand" paramKey="brandId" options={options} />);
        expect(screen.getByText("Brand")).toBeInTheDocument();
        expect(screen.getByText("Apple")).toBeInTheDocument();
        expect(screen.getByText("Samsung")).toBeInTheDocument();
    });

    it("checks options present in the URL", () => {
        currentParams = new URLSearchParams("brandId=apple");
        render(<FacetCheckboxGroup title="Brand" paramKey="brandId" options={options} />);
        expect(screen.getByRole("checkbox", { name: "Apple" })).toBeChecked();
        expect(screen.getByRole("checkbox", { name: "Samsung" })).not.toBeChecked();
    });

    it("pushes a toggled URL on click", async () => {
        const user = userEvent.setup();
        render(<FacetCheckboxGroup title="Brand" paramKey="brandId" options={options} />);
        await user.click(screen.getByRole("checkbox", { name: "Samsung" }));
        expect(pushMock).toHaveBeenCalledWith("/browse?brandId=samsung");
    });
});
