import type { EbookManifest } from "@/lib/ebooks/schema";

type Props = {
  manifest: EbookManifest;
  slug: string;
  size?: "sm" | "md" | "lg";
  light?: boolean; // white variant for dark backgrounds
};

export default function PublisherLogo({ manifest, slug, size = "md", light = false }: Props) {
  if (!manifest.publisher && !manifest.publisherLogo) return null;

  return (
    <div className={`pub-logo pub-logo--${size}${light ? " pub-logo--light" : ""}`}>
      {manifest.publisherLogo && (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="pub-logo__icon"
          src={`/api/ebook-assets/${slug}/${manifest.publisherLogo}`}
          alt=""
        />
      )}
      {manifest.publisher && (
        <span className="pub-logo__name">{manifest.publisher}</span>
      )}
    </div>
  );
}
