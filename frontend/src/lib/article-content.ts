import type { AdviceArticle } from "@/lib/advice-types";

export function buildArticleBodyText(article: AdviceArticle): string {
  const sectionText = article.sections
    .map((section) => [section.heading, ...section.paragraphs].filter(Boolean).join("\n"))
    .join("\n\n");

  const faqText = (article.faq || [])
    .map((item) => `${item.question}\n${item.answer}`)
    .join("\n\n");

  const table = article.varietyTable;
  const tableText = table?.rows
    ? table.rows
        .map((row) => [row.name, row.group, row.harvest, row.fruitSize, row.taste, row.yield, row.notes].filter(Boolean).join(" "))
        .join("\n")
    : "";

  const gantt = article.ganttChart;
  const ganttText = gantt?.rows.map((row) => `${row.name} (${row.group})`).join("\n") ?? "";

  return [
    article.summary,
    sectionText,
    faqText,
    table?.caption,
    table?.tableIntro,
    tableText,
    gantt?.title,
    gantt?.subtitle,
    ganttText,
    article.tips.join("\n"),
    article.seo.keywords.join(", "),
  ]
    .filter(Boolean)
    .join("\n\n");
}
