import { getPlantSitemapEntries } from "@/lib/seo/sitemap-plants";
import { urlSetXml, xmlResponse } from "@/lib/seo/sitemap-xml";

export const dynamic = "force-dynamic";

export async function GET() {
  return xmlResponse(urlSetXml(await getPlantSitemapEntries()));
}
