import type { Ebook, EbookChapter, PageContent } from "./schema";

/**
 * Paginacja — prosta i przewidywalna:
 *
 *   0   → okładka
 *   1   → strona tytułowa
 *   2   → spis treści  (może być kilka stron jeśli dużo rozdziałów)
 *   n   → jeden rozdział = JEDNA strona (cały, bez łamania)
 *          isFirstPage = true na każdej stronie rozdziałowej (tytuł + treść razem)
 *
 * Podrozdziały NIE są łamane na nowe strony — wyświetlają się
 * jeden pod drugim z odstępem w ramach tej samej karty A4.
 * Karta może być dłuższa niż fizyczne A4 — scrolla to obsłuży.
 */

const TOC_ITEMS_PER_PAGE = 12;

function paginateToc(chapters: EbookChapter[]): PageContent[] {
  const pages: PageContent[] = [];
  for (let i = 0; i < chapters.length; i += TOC_ITEMS_PER_PAGE) {
    const slice = chapters.slice(i, i + TOC_ITEMS_PER_PAGE);
    pages.push({
      kind: "toc",
      chapters: slice,
      startIndex: i,
      pageIndex: Math.floor(i / TOC_ITEMS_PER_PAGE),
      totalTocPages: Math.ceil(chapters.length / TOC_ITEMS_PER_PAGE),
    });
  }
  return pages;
}

export function paginateEbook(ebook: Ebook): PageContent[] {
  const { manifest, chapters } = ebook;
  const pages: PageContent[] = [];

  pages.push({ kind: "cover", manifest });
  pages.push({ kind: "title-page", manifest });
  pages.push(...paginateToc(chapters));

  // Każdy rozdział = jedna strona z isFirstPage: true
  // Cała treść (wszystkie podrozdziały) na tej jednej stronie
  for (let ci = 0; ci < chapters.length; ci++) {
    const chapter = chapters[ci];
    pages.push({
      kind: "chapter-body",
      chapter,
      chapterIndex: ci,
      sectionSlice: chapter.sections ?? [],
      isFirstPage: true,
    });
  }

  return pages;
}
