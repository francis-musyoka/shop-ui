import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { Expandable } from "./expandable";

// jsdom has no layout, so scrollHeight is always 0. Force a tall value so the
// overflow path (the "See more" toggle) can be exercised.
function mockScrollHeight(px: number) {
    Object.defineProperty(HTMLElement.prototype, "scrollHeight", {
        configurable: true,
        get() {
            return px;
        },
    });
}

describe("Expandable", () => {
    it("always renders its children", () => {
        mockScrollHeight(0);
        render(
            <Expandable>
                <p>Body copy</p>
            </Expandable>,
        );
        expect(screen.getByText("Body copy")).toBeInTheDocument();
    });

    it("shows no toggle when content fits the collapsed height", () => {
        mockScrollHeight(50);
        render(
            <Expandable collapsedHeight={160}>
                <p>Short</p>
            </Expandable>,
        );
        expect(screen.queryByRole("button")).not.toBeInTheDocument();
    });

    it("shows a See more toggle when content overflows and reveals on click", () => {
        mockScrollHeight(400);
        render(
            <Expandable collapsedHeight={160}>
                <p>Long content</p>
            </Expandable>,
        );
        const toggle = screen.getByRole("button", { name: "See more" });
        expect(toggle).toHaveAttribute("aria-expanded", "false");

        fireEvent.click(toggle);
        expect(screen.getByRole("button", { name: "See less" })).toHaveAttribute(
            "aria-expanded",
            "true",
        );
    });
});
