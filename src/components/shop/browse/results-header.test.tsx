import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { ResultsHeader } from "./results-header";

describe("ResultsHeader", () => {
    it("renders the range/total line and the context line", () => {
        render(<ResultsHeader total={1240} count={24} page={1} />);
        expect(screen.getByText(/1–24 of over 1,240 results/)).toBeInTheDocument();
        expect(
            screen.getByText("Tap a product to compare offers from other sellers."),
        ).toBeInTheDocument();
    });

    it("computes the range for later pages", () => {
        render(<ResultsHeader total={1240} count={24} page={2} />);
        expect(screen.getByText(/25–48 of over 1,240 results/)).toBeInTheDocument();
    });
});
