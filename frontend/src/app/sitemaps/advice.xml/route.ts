import { getAdviceSitemapEntries } from "@/lib/seo/sitemap-advice";
import { urlSetXml, xmlResponse } from "@/lib/seo/sitemap-xml";

export const revalidate = 300;

export async function GET() {
  return xmlResponse(urlSetXml(await getAdviceSitemapEntries()));
}
