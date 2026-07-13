import type { EbookManifest } from "@/lib/ebooks/schema";
import PublisherLogo from "@/components/PublisherLogo";

type Props = {
  manifest: EbookManifest;
  slug: string;
};

export default function PageTitlePage({ manifest, slug }: Props) {
  const year = manifest.year ?? new Date().getFullYear().toString();

  return (
    <div className="title-page">
      {/* Top: logo + rok */}
      <div className="title-page-top">
        <PublisherLogo manifest={manifest} slug={slug} size="md" />
        <span className="title-page-year">{year}</span>
      </div>

      {/* Center: title block */}
      <div className="title-page-center">
        {manifest.category && (
          <p className="title-page-category">{manifest.category}</p>
        )}
        <h1 className="title-page-title">{manifest.title}</h1>
        {manifest.subtitle && (
          <p className="title-page-subtitle">{manifest.subtitle}</p>
        )}
        <div className="title-page-rule" />
        <p className="title-page-author">{manifest.author}</p>
      </div>

      {/* Bottom: colophon — tylko suche dane, bez powtarzania logo */}
      <div className="title-page-colophon">
        {manifest.isbn && <p>ISBN: {manifest.isbn}</p>}
        <p>Wersja {manifest.version}</p>
        <p className="title-page-copy">
          &copy; {year}{manifest.publisher ? ` ${manifest.publisher}` : ""}. Wszelkie prawa zastrzeżone.
        </p>
      </div>
    </div>
  );
}
