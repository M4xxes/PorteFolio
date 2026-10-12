import type { NextConfig } from "next";

// Les transitions de page (React <ViewTransition>) fonctionnent sans configuration depuis Next.js 16.4.
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
};

export default nextConfig;
