"use client";

import { useEffect, useRef, useState } from "react";

interface ArticleVideoProps {
  src: string;       // .m3u8 (HLS) lub .mp4 (fallback)
  poster?: string;
  alt: string;
}

/**
 * Odtwarzacz wideo dla artykułów.
 * - Jeśli src kończy się na .m3u8 → używa hls.js (HLS z wyborem jakości)
 * - Jeśli src kończy się na .mp4 → natywny <video>
 * - Safari obsługuje HLS natywnie bez hls.js
 */
export function ArticleVideo({ src, poster, alt }: ArticleVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isHls, setIsHls] = useState(false);
  const [quality, setQuality] = useState<string>("auto");
  const [availableQualities, setAvailableQualities] = useState<{ name: string; index: number }[]>([]);
  const hlsRef = useRef<any>(null);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    const hlsSrc = src.endsWith(".m3u8");

    if (!hlsSrc) {
      // Zwykły MP4 - natywny player
      video.src = src;
      return;
    }

    // Safari obsługuje HLS natywnie
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = src;
      setIsHls(false);
      return;
    }

    // Pozostałe przeglądarki - hls.js
    import("hls.js").then(({ default: Hls }) => {
      if (!Hls.isSupported()) {
        video.src = src;
        return;
      }

      const hls = new Hls({
        startLevel: -1, // auto
        capLevelToPlayerSize: true, // dopasuj do rozmiaru playera
      });

      hls.loadSource(src);
      hls.attachMedia(video);

      hls.on(Hls.Events.MANIFEST_PARSED, (_event: any, data: any) => {
        const levels = data.levels as any[];
        const qualities = levels.map((level, index) => ({
          name: level.height ? `${level.height}p` : `${index + 1}`,
          index,
        }));
        setAvailableQualities([{ name: "Auto", index: -1 }, ...qualities]);
        setIsHls(true);
      });

      hlsRef.current = hls;
    });

    return () => {
      if (hlsRef.current) {
        hlsRef.current.destroy();
        hlsRef.current = null;
      }
    };
  }, [src]);

  function handleQualityChange(levelIndex: number) {
    if (!hlsRef.current) return;
    hlsRef.current.currentLevel = levelIndex;
    setQuality(levelIndex === -1 ? "auto" : String(levelIndex));
  }

  return (
    <div className="relative overflow-hidden rounded-3xl bg-black">
      <video
        ref={videoRef}
        className="w-full"
        controls
        playsInline
        poster={poster}
        preload="metadata"
        aria-label={alt}
      />

      {isHls && availableQualities.length > 1 && (
        <div className="absolute bottom-14 right-3 z-10">
          <select
            className="rounded-lg bg-black/70 px-2 py-1 text-xs font-bold text-white backdrop-blur"
            value={quality}
            onChange={(e) => {
              const val = e.target.value;
              handleQualityChange(val === "auto" ? -1 : parseInt(val, 10));
            }}
            aria-label="Wybierz jakość wideo"
          >
            {availableQualities.map((q) => (
              <option key={q.index} value={q.index === -1 ? "auto" : String(q.index)}>
                {q.name}
              </option>
            ))}
          </select>
        </div>
      )}
    </div>
  );
}
