import type { NextConfig } from "next";

// Les transitions de page (React <ViewTransition>) fonctionnent sans configuration depuis Next.js 16.4.
const nextConfig: NextConfig = {
  images: {
    formats: ["image/avif", "image/webp"],
  },
  // Anciennes adresses : les projets vivent sous /projets/<slug>, les autres sections sont dans l'accueil.
  redirects() {
    return [
      // Le motif exclut les points : les fichiers de /projects/*.webp|mp4 (dossier public) ne sont pas redirigés.
      { source: "/projects/:slug([a-z0-9-]+)", destination: "/projets/:slug", permanent: true },
      { source: "/projects", destination: "/#projets", permanent: false },
      { source: "/projets", destination: "/#projets", permanent: false },
      { source: "/about", destination: "/", permanent: false },
      { source: "/contact", destination: "/", permanent: false },
    ];
  },
};

export default nextConfig;
