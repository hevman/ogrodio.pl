import type { MetadataRoute } from "next";
import { shopIndexingEnabled } from "@/lib/seo/shop-indexing";
import { site } from "@/lib/site-config";

export default function robots(): MetadataRoute.Robots {
  const disallow = ["/panel/", "/app/", "/api/", "/checkout", "/szukaj"];
  if (!shopIndexingEnabled) {
    disallow.push("/sklep", "/produkt/");
  }

  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow,
    },
    sitemap: `${site.publicUrl}/sitemap.xml`,
  };
}
