import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { SpecsTable } from "./specs-table";

describe("SpecsTable", () => {
    it("renders a row per spec", () => {
        render(<SpecsTable specs={{ Display: '6.7" AMOLED', Battery: "5000 mAh" }} />);
        expect(screen.getByText("Display")).toBeInTheDocument();
        expect(screen.getByText('6.7" AMOLED')).toBeInTheDocument();
        expect(screen.getByText("Battery")).toBeInTheDocument();
    });

    it("renders nothing when specs is empty", () => {
        const { container } = render(<SpecsTable specs={{}} />);
        expect(container).toBeEmptyDOMElement();
    });
});
