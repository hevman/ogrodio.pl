export type EbookManifest = {
  slug: string;
  title: string;
  subtitle?: string;
  description: string;
  author: string;
  publisher?: string;
  publisherLogo?: string;
  language: string;
  category?: string;
  version: string;
  year?: string;
  isbn?: string;
  cover?: string;
  epubCover?: string;
  externalImageDirs?: string[];
  chapters: string[];
};

export type EbookSection = {
  heading: string;
  paragraphs: string[];
  image?: string;
  imageCaption?: string;
  bullets?: string[];
  checklist?: string[];
  table?: {
    caption?: string;
    headers: string[];
    rows: string[][];
  };
  note?: string;
  premiumBox?: {
    title: string;
    body: string;
  };
};

export type EbookChapter = {
  id: string;
  title: string;
  summary?: string;
  sections: EbookSection[];
};

export type Ebook = {
  manifest: EbookManifest;
  chapters: EbookChapter[];
};

// ── Page-break model (used by the paginated preview) ──────────────────────────
// A "page" is a logical A4 sheet.  Content is broken at chapter boundaries and
// optionally split further inside chapters when the estimated height exceeds
// PAGE_HEIGHT_PX.  Everything lives client-side — no server rendering needed.

export type PageContent =
  | { kind: "cover"; manifest: EbookManifest }
  | { kind: "title-page"; manifest: EbookManifest }
  | {
      kind: "toc";
      chapters: EbookChapter[];
      startIndex: number;
      pageIndex: number;
      totalTocPages: number;
    }
  | { kind: "chapter-start"; chapter: EbookChapter; chapterIndex: number }
  | {
      kind: "chapter-body";
      chapter: EbookChapter;
      chapterIndex: number;
      sectionSlice: EbookSection[];
      isFirstPage: boolean;
    };
