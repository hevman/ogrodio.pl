import type { MetadataRoute } from "next";
import { site } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/panel/", "/app/", "/api/", "/checkout", "/sklep", "/produkt/", "/szukaj"],
    },
    sitemap: `${site.publicUrl}/sitemap.xml`,
  };
}
