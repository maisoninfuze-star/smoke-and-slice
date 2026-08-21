import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Every image on this site is local. Allowing arbitrary remote hosts turns
    // /_next/image into an open proxy that anyone can point at any URL, so no
    // remotePatterns are configured at all.
    formats: ["image/avif", "image/webp"],
    deviceSizes: [420, 640, 828, 1080, 1280, 1600],
  },
};

export default nextConfig;
