"use client";

import { useEffect, useRef, useState } from "react";
import type { PageContent } from "@/lib/ebooks/schema";
import PageCover from "./pages/PageCover";
import PageTitlePage from "./pages/PageTitlePage";
import PageToc from "./pages/PageToc";
import PageChapterStart from "./pages/PageChapterStart";
import PageChapterBody from "./pages/PageChapterBody";

type Props = {
  pages: PageContent[];
  slug: string;
  totalPages: number;
};

function getChapterAnchors(pages: PageContent[]): { id: string; label: string }[] {
  const result: { id: string; label: string }[] = [];
  result.push({ id: "page-0", label: "Okładka" });
  result.push({ id: "page-1", label: "Strona tytułowa" });
  result.push({ id: "page-2", label: "Spis treści" });

  for (let i = 0; i < pages.length; i++) {
    const page = pages[i];
    if (page.kind === "chapter-start" || (page.kind === "chapter-body" && page.isFirstPage)) {
      result.push({
        id: `page-${i}`,
        label: `${page.chapterIndex + 1}. ${page.chapter.title}`,
      });
    }
  }

  return result;
}

export default function PaginatedBook({ pages, slug, totalPages }: Props) {
  const anchors = getChapterAnchors(pages);
  const [activePage, setActivePage] = useState(0);
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    observerRef.current?.disconnect();

    const observer = new IntersectionObserver(
      (entries) => {
        let best: IntersectionObserverEntry | null = null;

        for (const entry of entries) {
          if (entry.isIntersecting && (!best || entry.intersectionRatio > best.intersectionRatio)) {
            best = entry;
          }
        }

        if (best) {
          const idx = Number((best.target as HTMLElement).dataset.pageIndex);
          if (!Number.isNaN(idx)) setActivePage(idx);
        }
      },
      { threshold: [0.1, 0.5], rootMargin: "-10% 0px -10% 0px" },
    );

    document
      .querySelectorAll<HTMLElement>(".a4-sheet[data-page-index]")
      .forEach((el) => observer.observe(el));

    observerRef.current = observer;
    return () => observer.disconnect();
  }, [pages]);

  const scrollToPage = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="reader-layout">
      <nav className="reader-nav" aria-label="Rozdziały">
        <p className="reader-nav-heading">Rozdziały</p>
        <ul>
          {anchors.map((anchor) => {
            const pageIdx = Number(anchor.id.replace("page-", ""));
            const targetPage = pages[pageIdx];
            const isActive =
              activePage === pageIdx ||
              (pages[activePage]?.kind === "chapter-body" &&
                targetPage?.kind === "chapter-body" &&
                pages[activePage].chapterIndex === targetPage.chapterIndex);

            return (
              <li key={anchor.id}>
                <button
                  className={`nav-link${isActive ? " active" : ""}`}
                  onClick={() => scrollToPage(anchor.id)}
                >
                  {anchor.label}
                </button>
              </li>
            );
          })}
        </ul>
        <p className="reader-nav-counter">
          {activePage + 1} / {totalPages}
        </p>
      </nav>

      <div className="reader-scroll">
        {pages.map((page, i) => (
          <div
            key={i}
            id={`page-${i}`}
            data-page-index={i}
            className="a4-sheet"
            aria-label={`Strona ${i + 1}`}
          >
            <PageRenderer page={page} slug={slug} />
            <div className="page-number">
              {i + 1} / {totalPages}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function PageRenderer({ page, slug }: { page: PageContent; slug: string }) {
  if (page.kind === "cover") return <PageCover manifest={page.manifest} slug={slug} />;
  if (page.kind === "title-page") return <PageTitlePage manifest={page.manifest} slug={slug} />;
  if (page.kind === "toc") {
    return (
      <PageToc
        chapters={page.chapters}
        startIndex={page.startIndex}
        pageIndex={page.pageIndex}
        totalTocPages={page.totalTocPages}
      />
    );
  }
  if (page.kind === "chapter-start") {
    return <PageChapterStart chapter={page.chapter} chapterIndex={page.chapterIndex} />;
  }
  if (page.kind === "chapter-body") {
    return (
      <PageChapterBody
        chapter={page.chapter}
        chapterIndex={page.chapterIndex}
        sections={page.sectionSlice}
        slug={slug}
        isFirstPage={page.isFirstPage}
      />
    );
  }

  return null;
}
