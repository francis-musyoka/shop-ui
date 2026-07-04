import { describe, it, expect } from "vitest";
import "@testing-library/jest-dom/vitest";
import { render, screen } from "@testing-library/react";
import { useQuery } from "@tanstack/react-query";
import Providers from "./providers";

function Probe() {
    // If no QueryClient is in context, useQuery throws on render.
    useQuery({ queryKey: ["probe"], queryFn: async () => "ok", enabled: false });
    return <span>probe-rendered</span>;
}

describe("Providers", () => {
    it("supplies a QueryClient so useQuery can run", () => {
        render(
            <Providers>
                <Probe />
            </Providers>,
        );
        expect(screen.getByText("probe-rendered")).toBeInTheDocument();
    });
});
