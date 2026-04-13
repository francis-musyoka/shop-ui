import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_API_URL;
if (!backendUrl) {
  throw new Error("BACKEND_API_URL must be set (check .env.local)");
}

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "res.cloudinary.com" },
    ],
  },
};

export default nextConfig;
