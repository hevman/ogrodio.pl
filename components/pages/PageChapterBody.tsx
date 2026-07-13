import type { EbookChapter, EbookSection } from "@/lib/ebooks/schema";

type Props = {
  chapter: EbookChapter;
  chapterIndex: number;
  sections: EbookSection[];
  slug: string;
  isFirstPage: boolean;
};

export default function PageChapterBody({ chapter, chapterIndex, sections, slug }: Props) {
  return (
    <div className="page-chapter-body">
      {/* Chapter header — always shown (isFirstPage is always true now) */}
      <div className="chapter-header">
        <p className="page-eyebrow">Rozdział {chapterIndex + 1}</p>
        <h2 className="chapter-title">{chapter.title}</h2>
        {chapter.summary && <p className="chapter-summary">{chapter.summary}</p>}
      </div>

      {/* All sections flow one after another — no page breaks between them */}
      <div className="chapter-sections">
        {sections.map((section, i) => (
          <SectionBlock key={i} section={section} slug={slug} />
        ))}
      </div>
    </div>
  );
}

function SectionBlock({ section, slug }: { section: EbookSection; slug: string }) {
  return (
    <div className="section">
      {section.heading && <h3 className="section-heading">{section.heading}</h3>}

      {section.image && (
        <figure className="section-figure">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            className="section-image"
            src={`/api/ebook-assets/${slug}/${section.image}`}
            alt={section.imageCaption ?? ""}
          />
          {section.imageCaption && (
            <figcaption className="section-caption">{section.imageCaption}</figcaption>
          )}
        </figure>
      )}

      {section.paragraphs?.map((p, i) => (
        <p key={i} className="section-paragraph">{p}</p>
      ))}

      {section.bullets && section.bullets.length > 0 && (
        <ul className="section-bullets">
          {section.bullets.map((b, i) => <li key={i}>{b}</li>)}
        </ul>
      )}

      {section.checklist && section.checklist.length > 0 && (
        <ul className="section-checklist">
          {section.checklist.map((item, i) => (
            <li key={i} className="section-checklist-item">
              <span className="checklist-box" aria-hidden="true" />
              {item}
            </li>
          ))}
        </ul>
      )}

      {section.table && (
        <div className="section-table-wrap">
          {section.table.caption && (
            <p className="table-caption">{section.table.caption}</p>
          )}
          <table className="section-table">
            <thead>
              <tr>
                {section.table.headers.map((h, i) => (
                  <th key={i}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {section.table.rows.map((row, ri) => (
                <tr key={ri}>
                  {row.map((cell, ci) => (
                    <td key={ci}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {section.premiumBox && (
        <div className="premium-box">
          <p className="premium-box-title">{section.premiumBox.title}</p>
          <p className="premium-box-body">{section.premiumBox.body}</p>
        </div>
      )}

      {section.note && <div className="note">{section.note}</div>}
    </div>
  );
}
