import { getPlantSitemapEntries } from "@/lib/seo/sitemap-plants";
import { urlSetXml, xmlResponse } from "@/lib/seo/sitemap-xml";

export const revalidate = 300;

export function GET() {
  return xmlResponse(urlSetXml(getPlantSitemapEntries()));
}
