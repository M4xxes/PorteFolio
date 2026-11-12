import type { NextConfig } from "next";

// Les transitions de page (React <ViewTransition>) fonctionnent sans configuration depuis Next.js 16.4.
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Le site tient désormais sur une page : les anciennes adresses mènent à la bonne section.
  // Redirections temporaires (307), faciles à retirer.
  redirects() {
    return [
      { source: "/projects", destination: "/#work", permanent: false },
      { source: "/about", destination: "/#about", permanent: false },
      { source: "/contact", destination: "/#contact", permanent: false },
    ];
  },
};

export default nextConfig;
