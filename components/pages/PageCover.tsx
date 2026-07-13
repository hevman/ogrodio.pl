import type { EbookManifest } from "@/lib/ebooks/schema";
import PublisherLogo from "@/components/PublisherLogo";

type Props = {
  manifest: EbookManifest;
  slug: string;
};

export default function PageCover({ manifest, slug }: Props) {
  return (
    <div className="page-cover">
      {manifest.cover ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          className="cover-bg"
          src={`/api/ebook-assets/${slug}/${manifest.cover}`}
          alt=""
        />
      ) : (
        <div className="cover-bg cover-bg-placeholder" />
      )}

      <div className="cover-overlay" />

      <div className="cover-text">
        {manifest.category && <p className="cover-eyebrow">{manifest.category}</p>}
        <h1 className="cover-title">{manifest.title}</h1>
        {manifest.subtitle && <p className="cover-subtitle">{manifest.subtitle}</p>}
        <p className="cover-author">{manifest.author}</p>
      </div>

      {(manifest.publisher || manifest.publisherLogo) && (
        <div className="cover-publisher-bar">
          <PublisherLogo manifest={manifest} slug={slug} size="lg" />
        </div>
      )}
    </div>
  );
}
