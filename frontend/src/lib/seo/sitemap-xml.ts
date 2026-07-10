import type { MetadataRoute } from "next";

function escapeXml(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function dateValue(value: MetadataRoute.Sitemap[number]["lastModified"]) {
  if (!value) return null;
  if (value instanceof Date) return value.toISOString();
  return value;
}

export function xmlResponse(xml: string) {
  return new Response(xml, {
    headers: {
      "Content-Type": "application/xml; charset=utf-8",
      "Cache-Control": "public, s-maxage=300, stale-while-revalidate=86400",
    },
  });
}

export function sitemapIndexXml(urls: string[]) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((url) => `  <sitemap>
    <loc>${escapeXml(url)}</loc>
  </sitemap>`).join("\n")}
</sitemapindex>`;
}

export function urlSetXml(entries: MetadataRoute.Sitemap) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries.map((entry) => {
  const lines = [`    <loc>${escapeXml(entry.url)}</loc>`];
  const lastModified = dateValue(entry.lastModified);

  if (lastModified) lines.push(`    <lastmod>${escapeXml(lastModified)}</lastmod>`);
  if (entry.changeFrequency) lines.push(`    <changefreq>${entry.changeFrequency}</changefreq>`);
  if (entry.priority !== undefined) lines.push(`    <priority>${entry.priority}</priority>`);

  return `  <url>
${lines.join("\n")}
  </url>`;
}).join("\n")}
</urlset>`;
}
