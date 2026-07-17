/**
 * Odtwarzacz YouTube dla artykułów.
 * Używa standardowego iframe embed - YouTube obsługuje HLS, jakości i CDN.
 */
export function ArticleVideo({
  youtubeId,
  alt,
}: {
  youtubeId: string;
  alt: string;
}) {
  return (
    <div className="relative aspect-video w-full overflow-hidden rounded-3xl bg-black">
      <iframe
        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        className="absolute inset-0 h-full w-full"
        loading="lazy"
        src={`https://www.youtube-nocookie.com/embed/${youtubeId}`}
        title={alt}
      />
    </div>
  );
}
