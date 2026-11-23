import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      { source: "/acompanhamento/:path*", destination: "/minha-area", permanent: true },
      { source: "/admin/acompanhamento/:path*", destination: "/admin", permanent: true },
      { source: "/equipe/:path*", destination: "/admin", permanent: true },
      { source: "/coach/:path*", destination: "/loja", permanent: true },
    ];
  },
  // Mantém a navegação mobile livre do indicador de desenvolvimento.
  devIndicators: false,
  // Fixa a raiz do Turbopack neste projeto (evita inferir C:\Users\house
  // por causa de um package-lock.json na pasta home).
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Permite imagens do Storage público do Supabase no next/image.
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
        pathname: "/storage/v1/object/public/**",
      },
    ],
  },
};

export default nextConfig;
