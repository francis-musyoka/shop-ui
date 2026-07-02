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

    it("opens a fullscreen viewer with a counter and paging controls when the main image is clicked", () => {
        render(<ProductGallery images={images} title="Phone" />);
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
        fireEvent.click(screen.getByRole("button", { name: /view larger image/i }));
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.getByText("1 / 3")).toBeInTheDocument();
        // Paging is Embla-driven (swipe/drag/arrows); its behaviour is verified in the browser,
        // since Embla needs a layout engine jsdom doesn't provide. Here we assert the controls exist.
        expect(screen.getByRole("button", { name: "Previous image" })).toBeInTheDocument();
        expect(screen.getByRole("button", { name: "Next image" })).toBeInTheDocument();
    });

    it("closes the viewer with the close button", () => {
        render(<ProductGallery images={images} title="Phone" />);
        fireEvent.click(screen.getByRole("button", { name: /view larger image/i }));
        fireEvent.click(screen.getByRole("button", { name: "Close image viewer" }));
        expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("omits paging controls and counter for a single-image gallery", () => {
        render(<ProductGallery images={["https://x/only.jpg"]} title="Phone" />);
        fireEvent.click(screen.getByRole("button", { name: /view larger image/i }));
        expect(screen.getByRole("dialog")).toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Next image" })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: "Previous image" })).not.toBeInTheDocument();
        expect(screen.queryByText("1 / 1")).not.toBeInTheDocument();
    });

    it("renders a full-width swipeable slide per image (mobile)", () => {
        render(<ProductGallery images={images} title="Phone" />);
        // CarouselItem exposes role="group" (aria-roledescription="slide").
        // With the lightbox closed, the mobile carousel is the only source of groups.
        expect(screen.getAllByRole("group")).toHaveLength(images.length);
    });

    it("renders one position dot per image on mobile", () => {
        render(<ProductGallery images={images} title="Phone" />);
        expect(screen.getByTestId("gallery-dots").childElementCount).toBe(images.length);
    });

    it("omits mobile dots for a single-image gallery", () => {
        render(<ProductGallery images={["https://x/only.jpg"]} title="Phone" />);
        expect(screen.queryByTestId("gallery-dots")).not.toBeInTheDocument();
    });
});
