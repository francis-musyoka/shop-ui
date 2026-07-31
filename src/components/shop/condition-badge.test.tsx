import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { ConditionBadge } from "./condition-badge";

describe("ConditionBadge", () => {
    it("renders a human label for the condition", () => {
        render(<ConditionBadge condition="REFURBISHED" />);
        expect(screen.getByText("Refurbished")).toBeInTheDocument();
    });

    it("renders New", () => {
        render(<ConditionBadge condition="NEW" />);
        expect(screen.getByText("New")).toBeInTheDocument();
    });
});
