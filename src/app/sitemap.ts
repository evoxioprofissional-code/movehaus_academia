import type { MetadataRoute } from "next";
import { getProducts } from "@/lib/catalog";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = "https://movehaus.com.br";
  const staticRoutes = ["", "/loja", "/ebooks", "/ofertas", "/sobre", "/termos", "/privacidade"].map((path) => ({ url: `${base}${path}`, lastModified: new Date(), changeFrequency: path === "" ? "weekly" as const : "monthly" as const, priority: path === "" ? 1 : 0.7 }));
  const products = await getProducts();
  return [...staticRoutes, ...products.map((product) => ({ url: `${base}/${product.type === "ebook" ? "ebooks" : "loja"}/${product.slug}`, lastModified: new Date(), changeFrequency: "weekly" as const, priority: 0.8 }))];
}
