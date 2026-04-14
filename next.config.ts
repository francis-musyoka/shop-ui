import type { NextConfig } from "next";
import { EnvSchema } from "./src/lib/env.schema";

// Validate at config-load time — same schema as runtime env.ts uses.
// This catches malformed BACKEND_API_URL before Next silently proxies nowhere.
const env = EnvSchema.parse({
    BACKEND_API_URL: process.env.BACKEND_API_URL,
    NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
    NODE_ENV: process.env.NODE_ENV,
});

const nextConfig: NextConfig = {
    async rewrites() {
        return [
            {
                source: "/api/:path*",
                destination: `${env.BACKEND_API_URL}/api/:path*`,
            },
        ];
    },
    images: {
        remotePatterns: [{ protocol: "https", hostname: "res.cloudinary.com" }],
    },
};

export default nextConfig;
