import { site } from "@/lib/site-config";
import { getShopSitemapEntries } from "@/lib/seo/sitemap-shop";
import { sitemapIndexXml, urlSetXml, xmlResponse } from "@/lib/seo/sitemap-xml";

export const revalidate = 300;

export async function GET(request: Request) {
  const host = new URL(request.url).hostname;
  if (host === "sklep.ogrodio.pl" || host === "sklep.ogrodio.localhost") {
    return xmlResponse(urlSetXml(await getShopSitemapEntries()));
  }

  const base = site.publicUrl;
  const sitemaps = [
    `${base}/sitemaps/static.xml`,
    `${base}/sitemaps/advice.xml`,
    `${base}/sitemaps/plants.xml`,
  ];

  return xmlResponse(sitemapIndexXml(sitemaps));
}
