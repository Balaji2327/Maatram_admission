import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    const publicApi = process.env.NEXT_PUBLIC_API_URL || "";
    const apiOrigin = /^https?:\/\//.test(publicApi) ? publicApi.replace(/\/+$/, "").replace(/\/api$/, "") : "";
    const backend = (process.env.BACKEND_URL || apiOrigin || "http://localhost:5000").replace(/\/+$/, "");
    return ["auth", "application", "admin/media/applications"].map(section => ({
      source: `/backend/${section}/:path*`,
      destination: `${backend}/${section}/:path*`,
    }));
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "images.unsplash.com",
      },
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.amazonaws.com",
      },
      {
        protocol: "http",
        hostname: "localhost",
      },
      {
        protocol: "http",
        hostname: "127.0.0.1",
      },
    ],
  },
};

export default nextConfig;
