import { describe, it, expect, vi, beforeEach } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

const pushMock = vi.fn();

vi.mock("next/navigation", () => ({
    useRouter: () => ({ push: pushMock }),
}));

import { SearchBar } from "./search-bar";

beforeEach(() => {
    pushMock.mockReset();
});

describe("SearchBar", () => {
    it("renders a search input and submit button", () => {
        render(<SearchBar />);
        expect(screen.getByRole("search")).toBeInTheDocument();
        expect(screen.getByPlaceholderText("Search products...")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: /^search$/i })).toBeInTheDocument();
    });

    it("navigates to /browse?q=<query> on submit", async () => {
        const user = userEvent.setup();
        render(<SearchBar />);

        const input = screen.getByPlaceholderText("Search products...");
        await user.type(input, "samsung galaxy");
        await user.click(screen.getByRole("button", { name: /^search$/i }));

        expect(pushMock).toHaveBeenCalledWith("/browse?q=samsung+galaxy");
    });

    it("navigates to /browse when input is empty", async () => {
        const user = userEvent.setup();
        render(<SearchBar />);

        await user.click(screen.getByRole("button", { name: /^search$/i }));

        expect(pushMock).toHaveBeenCalledWith("/browse");
    });

    it("navigates to /browse when input is only whitespace", async () => {
        const user = userEvent.setup();
        render(<SearchBar />);

        const input = screen.getByPlaceholderText("Search products...");
        await user.type(input, "   ");
        await user.click(screen.getByRole("button", { name: /^search$/i }));

        expect(pushMock).toHaveBeenCalledWith("/browse");
    });

    it("uses custom placeholder when provided", () => {
        render(<SearchBar placeholder="Find something..." />);
        expect(screen.getByPlaceholderText("Find something...")).toBeInTheDocument();
    });

    it("pre-fills defaultValue", () => {
        render(<SearchBar defaultValue="iphone" />);
        expect(screen.getByPlaceholderText("Search products...")).toHaveValue("iphone");
    });

    it("renders category dropdown trigger when categories provided", () => {
        const categories = [
            { id: "cat1", name: "Electronics" },
            { id: "cat2", name: "Fashion" },
        ];
        render(<SearchBar categories={categories} />);
        expect(screen.getByRole("button", { name: /search category/i })).toBeInTheDocument();
    });
});
