import { site } from "@/lib/site-config";
import { shopIndexingEnabled } from "@/lib/seo/shop-indexing";
import { sitemapIndexXml, xmlResponse } from "@/lib/seo/sitemap-xml";

export const revalidate = 300;

export function GET() {
  const base = site.publicUrl;
  const sitemaps = [
    `${base}/sitemaps/static.xml`,
    `${base}/sitemaps/advice.xml`,
    `${base}/sitemaps/plants.xml`,
    ...(shopIndexingEnabled ? [`${base}/sitemaps/shop.xml`] : []),
  ];

  return xmlResponse(sitemapIndexXml(sitemaps));
}
