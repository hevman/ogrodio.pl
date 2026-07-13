import type { EbookChapter } from "@/lib/ebooks/schema";

type Props = {
  chapter: EbookChapter;
  chapterIndex: number;
};

export default function PageChapterStart({ chapter, chapterIndex }: Props) {
  return (
    <div className="page-chapter-start">
      <p className="page-eyebrow">Rozdział {chapterIndex + 1}</p>
      <h2 className="chapter-title">{chapter.title}</h2>
      {chapter.summary && <p className="chapter-summary">{chapter.summary}</p>}
    </div>
  );
}
