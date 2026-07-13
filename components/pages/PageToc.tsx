import type { EbookChapter } from "@/lib/ebooks/schema";

type Props = {
  chapters: EbookChapter[];
  startIndex: number;
  pageIndex: number;
  totalTocPages: number;
};

export default function PageToc({ chapters, startIndex, pageIndex, totalTocPages }: Props) {
  return (
    <div className="page-toc">
      <h2 className="toc-heading">
        Spis treści
        {totalTocPages > 1 && (
          <span className="toc-page-indicator"> ({pageIndex + 1}/{totalTocPages})</span>
        )}
      </h2>
      <ol className="toc-list" start={startIndex + 1}>
        {chapters.map((chapter, i) => (
          <li key={chapter.id} className="toc-item">
            <span className="toc-num">Rozdział {startIndex + i + 1}</span>
            <span className="toc-title">{chapter.title}</span>
            {chapter.summary && <span className="toc-summary">{chapter.summary}</span>}
          </li>
        ))}
      </ol>
    </div>
  );
}
