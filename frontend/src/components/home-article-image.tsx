"use client";

import Image from "next/image";
import { useState } from "react";

const PLACEHOLDER = "/images/articles/ogrod-placeholder-cover.webp";

export function HomeLeadArticleImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER);

  return (
    <Image
      alt={alt}
      className="object-cover transition duration-500 group-hover:scale-105"
      fill
      quality={62}
      sizes="(max-width: 1024px) 100vw, 44vw"
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
  const [imgSrc, setImgSrc] = useState(src || PLACEHOLDER);

  return (
    <Image
      alt={alt}
      className="object-cover transition duration-500 group-hover:scale-105"
      fill
      quality={56}
      sizes="112px"
      src={imgSrc}
      onError={() => setImgSrc(PLACEHOLDER)}
    />
  );
}
