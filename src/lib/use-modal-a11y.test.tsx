import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { useModalA11y } from "./use-modal-a11y";

function Harness({ open }: { open: boolean }) {
    const ref = useModalA11y(open);
    return open ? (
        <div ref={ref} role="dialog" tabIndex={-1}>
            <button>Close</button>
        </div>
    ) : null;
}

describe("useModalA11y", () => {
    it("locks body scroll while open and restores it on close", () => {
        const { rerender } = render(<Harness open={false} />);
        expect(document.body.style.overflow).toBe("");

        rerender(<Harness open />);
        expect(document.body.style.overflow).toBe("hidden");

        rerender(<Harness open={false} />);
        expect(document.body.style.overflow).toBe("");
    });

    it("moves focus into the dialog on open", () => {
        render(<Harness open />);
        expect(screen.getByRole("button", { name: "Close" })).toHaveFocus();
    });
});
