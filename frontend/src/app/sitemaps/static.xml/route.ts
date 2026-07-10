import { getStaticSitemapEntries } from "@/lib/seo/sitemap-static";
import { urlSetXml, xmlResponse } from "@/lib/seo/sitemap-xml";

export const revalidate = 300;

export function GET() {
  return xmlResponse(urlSetXml(getStaticSitemapEntries()));
}
