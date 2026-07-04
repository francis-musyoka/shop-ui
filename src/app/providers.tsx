"use client";

import { environmentManager, QueryClient, QueryClientProvider } from "@tanstack/react-query";

function makeQueryClient() {
    return new QueryClient({
        defaultOptions: {
            queries: {
                // Detail offers don't change second-to-second; avoid an
                // immediate refetch when the drawer remounts.
                staleTime: 60 * 1000,
            },
        },
    });
}

let browserQueryClient: QueryClient | undefined = undefined;

function getQueryClient() {
    if (environmentManager.isServer()) {
        // Server: always a fresh client so requests never share cache.
        return makeQueryClient();
    }
    // Browser: reuse a singleton so a suspend during initial render
    // doesn't throw the client away.
    if (!browserQueryClient) browserQueryClient = makeQueryClient();
    return browserQueryClient;
}

export default function Providers({ children }: { children: React.ReactNode }) {
    const queryClient = getQueryClient();
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
