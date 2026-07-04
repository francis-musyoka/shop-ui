import { describe, it, expect, vi } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { VariantSelector } from "./variant-selector";
import type { DetailVariant } from "@/lib/product-detail";

const variants: DetailVariant[] = [
    {
        id: "a",
        attributes: { Storage: "128GB", Color: "Black" },
        colorHex: "#111",
        images: [],
        offerCount: 0,
        buyBox: null,
    },
    {
        id: "b",
        attributes: { Storage: "256GB", Color: "Black" },
        colorHex: "#111",
        images: [],
        offerCount: 0,
        buyBox: null,
    },
];

describe("VariantSelector", () => {
    it("renders a group per attribute key with its distinct values", () => {
        render(
            <VariantSelector
                variants={variants}
                selected={{ Storage: "128GB", Color: "Black" }}
                onChange={() => {}}
            />,
        );
        expect(screen.getByText("Storage")).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "128GB" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "256GB" })).toBeInTheDocument();
    });

    it("calls onChange with the merged selection when a value is picked", () => {
        const onChange = vi.fn();
        render(
            <VariantSelector
                variants={variants}
                selected={{ Storage: "128GB", Color: "Black" }}
                onChange={onChange}
            />,
        );
        fireEvent.click(screen.getByRole("button", { name: "256GB" }));
        expect(onChange).toHaveBeenCalledWith({ Storage: "256GB", Color: "Black" });
    });

    it("marks the selected value pressed", () => {
        render(
            <VariantSelector
                variants={variants}
                selected={{ Storage: "128GB", Color: "Black" }}
                onChange={() => {}}
            />,
        );
        expect(screen.getByRole("button", { name: "128GB" })).toHaveAttribute(
            "aria-pressed",
            "true",
        );
        expect(screen.getByRole("button", { name: "256GB" })).toHaveAttribute(
            "aria-pressed",
            "false",
        );
    });
});
