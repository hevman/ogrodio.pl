/**
 * Komponenty obrazów dla artykułów.
 * Używają natywnych <img> zamiast Next.js Image - obrazy są już zoptymalizowane na serwerze.
 * To rozwiązuje problem z placeholderami w Google Search Console.
 */

export function ArticleHeroImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
  quality?: number; // kept for API compatibility but unused
}) {
  return (
    <img
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover opacity-75"
      fetchPriority="high"
      loading="eager"
      src={src}
    />
  );
}

export function ArticleInlineImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
  quality?: number; // kept for API compatibility but unused
}) {
  return (
    <img
      alt={alt}
      className="w-full object-cover"
      loading="lazy"
      src={src}
    />
  );
}
