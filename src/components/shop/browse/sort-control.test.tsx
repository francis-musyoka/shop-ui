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

import { SortControl } from "./sort-control";

beforeEach(() => {
    pushMock.mockReset();
    currentParams = new URLSearchParams("");
});

describe("SortControl", () => {
    it("shows the default sort label", () => {
        render(<SortControl />);
        expect(screen.getByRole("button", { name: /Sort: Featured/ })).toBeInTheDocument();
    });

    it("reflects the current sort from the URL", () => {
        currentParams = new URLSearchParams("sort=price_asc");
        render(<SortControl />);
        expect(screen.getByRole("button", { name: /Price: Low to High/ })).toBeInTheDocument();
    });

    it("pushes the chosen sort", async () => {
        const user = userEvent.setup();
        render(<SortControl />);
        await user.click(screen.getByRole("button", { name: /Sort:/ }));
        await user.click(await screen.findByRole("menuitemradio", { name: "Price: High to Low" }));
        expect(pushMock).toHaveBeenCalledWith("/browse?sort=price_desc");
    });
});
