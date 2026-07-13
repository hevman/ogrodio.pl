import type { MetadataRoute } from "next";
import { headers } from "next/headers";
import { shopIndexingEnabled } from "@/lib/seo/shop-indexing";
import { site } from "@/lib/site-config";

export default async function robots(): Promise<MetadataRoute.Robots> {
  const host = (await headers()).get("host")?.split(":")[0] || "";
  const isShopHost = host === "sklep.ogrodio.pl" || host === "sklep.ogrodio.localhost";
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
    sitemap: `${isShopHost ? site.shopUrl : site.publicUrl}/sitemap.xml`,
  };
}
