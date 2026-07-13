import { notFound } from "next/navigation";
import Link from "next/link";
import { getEbookSlugs, loadEbook } from "@/lib/ebooks/load";
import { paginateEbook } from "@/lib/ebooks/paginate";
import PaginatedBook from "@/components/PaginatedBook";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return getEbookSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params;
  const ebook = loadEbook(slug);
  return {
    title: ebook.manifest.title,
    description: ebook.manifest.description,
  };
}

export default async function EbookPage({ params }: PageProps) {
  const { slug } = await params;

  if (!getEbookSlugs().includes(slug)) {
    notFound();
  }

  const ebook = loadEbook(slug);
  const pages = paginateEbook(ebook);

  return (
    <main className="shell">
      <div className="topbar">
        <div className="brand">
          <h1>{ebook.manifest.title}</h1>
          <p className="meta">{ebook.manifest.description}</p>
        </div>
        <div className="actions">
          <Link className="button secondary" href="/">
            ← Lista
          </Link>
          <a className="button secondary" href={`/api/ebook-assets/${slug}/export/pdf`} target="_blank">
            PDF
          </a>
          <a className="button secondary" href={`/api/ebook-assets/${slug}/export/epub`} target="_blank">
            EPUB
          </a>
        </div>
      </div>

      <PaginatedBook pages={pages} slug={slug} totalPages={pages.length} />
    </main>
  );
}
