export type InlinePart =
  | { type: "text"; value: string }
  | { type: "link"; label: string; href: string };

const MARKDOWN_LINK = /\[([^\]]+)\]\(([^)]+)\)/g;

/** Ścieżki wewnętrzne w treści artykułu: [anchor](/porady/kategoria/slug) */
export function parseInlineLinks(text: string): InlinePart[] {
  const parts: InlinePart[] = [];
  let lastIndex = 0;

  for (const match of text.matchAll(MARKDOWN_LINK)) {
    const [full, label, href] = match;
    const start = match.index ?? 0;

    if (start > lastIndex) {
      parts.push({ type: "text", value: text.slice(lastIndex, start) });
    }

    const normalized = normalizeInternalHref(href.trim());
    if (normalized) {
      parts.push({ type: "link", label: label.trim(), href: normalized });
    } else {
      parts.push({ type: "text", value: full });
    }

    lastIndex = start + full.length;
  }

  if (lastIndex < text.length) {
    parts.push({ type: "text", value: text.slice(lastIndex) });
  }

  return parts.length ? parts : [{ type: "text", value: text }];
}

function normalizeInternalHref(href: string): string | null {
  if (/^https?:\/\//i.test(href)) return null;
  if (href.startsWith("/porady/")) return href.split("#")[0].split("?")[0];
  return null;
}
