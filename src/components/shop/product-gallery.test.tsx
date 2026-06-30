import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { ProductGallery } from "./product-gallery";

const images = ["https://x/1.jpg", "https://x/2.jpg", "https://x/3.jpg"];

describe("ProductGallery", () => {
    it("renders one thumbnail button per image", () => {
        render(<ProductGallery images={images} title="Phone" />);
        expect(screen.getAllByRole("button", { name: /Phone — view/ })).toHaveLength(3);
    });

    it("marks the first thumbnail active by default", () => {
        render(<ProductGallery images={images} title="Phone" />);
        const first = screen.getByRole("button", { name: "Phone — view 1" });
        expect(first).toHaveAttribute("aria-pressed", "true");
    });

    it("activates a thumbnail on hover", () => {
        render(<ProductGallery images={images} title="Phone" />);
        const second = screen.getByRole("button", { name: "Phone — view 2" });
        fireEvent.mouseEnter(second);
        expect(second).toHaveAttribute("aria-pressed", "true");
    });

    it("opens a fullscreen viewer with a counter when the main image is clicked", () => {
        render(<ProductGallery images={images} title="Phone" />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /view larger image/i }));
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("1 / 3")).toBeInTheDocument();
    });

    it("steps through images with the Next button in the viewer", () => {
        render(<ProductGallery images={images} title="Phone" />);
        fireEvent.click(screen.getByRole("button", { name: /view larger image/i }));
        fireEvent.click(screen.getByRole("button", { name: "Next image" }));
        expect(screen.getByText("2 / 3")).toBeInTheDocument();
    });

    it("closes the viewer with the close button", () => {
        render(<ProductGallery images={images} title="Phone" />);
        fireEvent.click(screen.getByRole("button", { name: /view larger image/i }));
        fireEvent.click(screen.getByRole("button", { name: "Close image viewer" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("advances to the next image on a left swipe in the viewer", () => {
        render(<ProductGallery images={images} title="Phone" />);
        fireEvent.click(screen.getByRole("button", { name: /view larger image/i }));
        const stage = screen.getByRole("dialog").querySelector(".touch-pan-y")!;
        fireEvent.touchStart(stage, { touches: [{ clientX: 240 }] });
        fireEvent.touchEnd(stage, { changedTouches: [{ clientX: 60 }] });
        expect(screen.getByText("2 / 3")).toBeInTheDocument();
    });

    it("goes to the previous image on a right swipe (wraps to last)", () => {
        render(<ProductGallery images={images} title="Phone" />);
        fireEvent.click(screen.getByRole("button", { name: /view larger image/i }));
        const stage = screen.getByRole("dialog").querySelector(".touch-pan-y")!;
        fireEvent.touchStart(stage, { touches: [{ clientX: 60 }] });
        fireEvent.touchEnd(stage, { changedTouches: [{ clientX: 240 }] });
        expect(screen.getByText("3 / 3")).toBeInTheDocument();
    });
});
