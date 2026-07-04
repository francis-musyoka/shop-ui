import "@testing-library/jest-dom/vitest";
import { afterEach, vi } from "vitest";
import { cleanup } from "@testing-library/react";

vi.mock("server-only", () => ({}));

// jsdom lacks several browser APIs that Embla (and other responsive libs) touch on mount.
if (!window.matchMedia) {
    Object.defineProperty(window, "matchMedia", {
        writable: true,
        value: (query: string) => ({
            matches: false,
            media: query,
            onchange: null,
            addListener: () => {},
            removeListener: () => {},
            addEventListener: () => {},
            removeEventListener: () => {},
            dispatchEvent: () => false,
        }),
    });
}

class MockObserver {
    observe() {}
    unobserve() {}
    disconnect() {}
    takeRecords() {
        return [];
    }
}

if (!window.IntersectionObserver) {
    Object.defineProperty(window, "IntersectionObserver", {
        writable: true,
        value: MockObserver,
    });
}

if (!window.ResizeObserver) {
    Object.defineProperty(window, "ResizeObserver", {
        writable: true,
        value: MockObserver,
    });
}

afterEach(() => {
    cleanup();
});
