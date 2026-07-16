"use client";

import { useState } from "react";

/**
 * Komponenty obrazów dla artykułów.
 * Używają natywnych <img> zamiast Next.js Image - obrazy są już zoptymalizowane na serwerze.
 * Placeholder używany TYLKO przy błędzie ładowania (onError), nie jako initial state.
 */

const PLACEHOLDER = "/images/articles/ogrod-placeholder-cover.webp";

export function ArticleHeroImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
  quality?: number; // kept for API compatibility but unused
}) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover opacity-75"
      fetchPriority="high"
      loading="eager"
      src={imgSrc}
      onError={() => setImgSrc(PLACEHOLDER)}
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
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      alt={alt}
      className="w-full object-cover"
      loading="lazy"
      src={imgSrc}
      onError={() => setImgSrc(PLACEHOLDER)}
    />
  );
}
