"use client";

import Image from "next/image";
import { useState } from "react";

export function ArticleHeroImage({
  src,
  alt,
  quality,
}: {
  src: string;
  alt: string;
  quality: number;
}) {
  const [imgSrc, setImgSrc] = useState(src || "/brand/ogrodio-leaf.jpg");

  return (
    <Image
      alt={alt}
      className="object-cover opacity-75"
      fetchPriority="high"
      fill
      priority
      quality={quality}
      sizes="100vw"
      src={imgSrc}
      onError={() => setImgSrc("/brand/ogrodio-leaf.jpg")}
    />
  );
}

export function ArticleInlineImage({
  src,
  alt,
  quality,
}: {
  src: string;
  alt: string;
  quality: number;
}) {
  const [imgSrc, setImgSrc] = useState(src || "/brand/ogrodio-leaf.jpg");

  return (
    <Image
      alt={alt}
      className="w-full object-cover"
      height={600}
      quality={quality}
      sizes="(max-width: 768px) 100vw, (max-width: 1280px) min(100vw - 3rem, 900px), min(100vw - 22rem, 1340px)"
      src={imgSrc}
      width={1000}
      onError={() => setImgSrc("/brand/ogrodio-leaf.jpg")}
    />
  );
}
