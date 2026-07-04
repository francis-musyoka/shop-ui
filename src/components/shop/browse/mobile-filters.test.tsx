import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { MobileFilters } from "./mobile-filters";

describe("MobileFilters", () => {
    it("renders a Filters trigger button", () => {
        render(
            <MobileFilters>
                <div>panel</div>
            </MobileFilters>,
        );
        expect(screen.getByRole("button", { name: /filters/i })).toBeInTheDocument();
    });
});
