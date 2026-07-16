"use client";

import { useState } from "react";

/**
 * Komponenty obrazów dla strony głównej.
 * Placeholder tylko przy błędzie ładowania, nie jako initial state.
 */

const PLACEHOLDER = "/images/articles/ogrod-placeholder-cover.webp";

export function HomeLeadArticleImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      loading="lazy"
      src={imgSrc}
      onError={() => setImgSrc(PLACEHOLDER)}
    />
  );
}

export function HomeSideArticleImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [imgSrc, setImgSrc] = useState(src);

  return (
    <img
      alt={alt}
      className="h-28 w-28 rounded-xl object-cover transition duration-500 group-hover:scale-105"
      loading="lazy"
      src={imgSrc}
      onError={() => setImgSrc(PLACEHOLDER)}
    />
  );
}
