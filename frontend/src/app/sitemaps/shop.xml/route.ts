import { getShopSitemapEntries } from "@/lib/seo/sitemap-shop";
import { urlSetXml, xmlResponse } from "@/lib/seo/sitemap-xml";

export const revalidate = 300;

export async function GET() {
  return xmlResponse(urlSetXml(await getShopSitemapEntries()));
}
