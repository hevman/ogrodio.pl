/**
 * Komponenty obrazów dla strony głównej.
 * Używają natywnych <img> - obrazy już zoptymalizowane na serwerze.
 */

export function HomeLeadArticleImage({
  src,
  alt,
}: {
  src: string;
  alt: string;
}) {
  return (
    <img
      alt={alt}
      className="absolute inset-0 h-full w-full object-cover transition duration-500 group-hover:scale-105"
      loading="lazy"
      src={src}
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
  return (
    <img
      alt={alt}
      className="h-28 w-28 rounded-xl object-cover transition duration-500 group-hover:scale-105"
      loading="lazy"
      src={src}
    />
  );
}
