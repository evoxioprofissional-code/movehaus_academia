import type { NextConfig } from "next";
import path from "node:path";

const nextConfig: NextConfig = {
  // Fixa a raiz do Turbopack neste projeto (evita inferir C:\Users\house
  // por causa de um package-lock.json na pasta home).
  turbopack: {
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
