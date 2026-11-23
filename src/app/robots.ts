import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  return { rules: [{ userAgent: "*", allow: "/", disallow: ["/admin/", "/minha-area/", "/checkout/"] }], sitemap: "https://movehaus.com.br/sitemap.xml" };
}
