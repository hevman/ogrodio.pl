import Image from "next/image";
import Link from "next/link";
import { ArrowUpRight, Clock3 } from "lucide-react";
import type { AdviceArticle } from "@/lib/advice-types";
import { formatArticleDate } from "@/lib/format-date";
import { getArticlePath } from "@/lib/site-config";

export function AdviceCard({
  article,
  categorySlug,
  priority = false,
}: {
  article: AdviceArticle;
  categorySlug?: string;
  priority?: boolean;
}) {
  const href = categorySlug
    ? `/porady/${categorySlug}/${article.slug}`
    : getArticlePath(article);

  return (
    <Link
      className="group flex h-full flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-sm transition hover:-translate-y-0.5 hover:border-teal-200 hover:shadow-lg"
      href={href}
    >
      <div className="relative aspect-[16/10] overflow-hidden bg-slate-100">
        <Image
          alt={article.coverAlt}
          className="h-full w-full object-cover transition duration-500 group-hover:scale-105"
          fill
          priority={priority}
          quality={60}
          sizes="(max-width: 768px) 100vw, (max-width: 1280px) 46vw, 31vw"
          src={article.coverImage || "/brand/ogrodio-leaf.jpg"}
        />
        <span className="absolute left-4 top-4 rounded-full bg-white/95 px-3 py-1 text-xs font-bold text-teal-800 shadow-sm">
          {article.topic}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5 sm:p-6">
        <div className="flex items-start justify-between gap-3">
          <h3 className="text-xl font-bold tracking-tight text-slate-900 group-hover:text-teal-800">
            {article.title}
          </h3>
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-slate-200 text-slate-500 transition group-hover:border-teal-200 group-hover:bg-teal-50 group-hover:text-teal-700">
            <ArrowUpRight className="h-4 w-4" />
          </span>
        </div>

        <p className="mt-3 flex-1 text-sm leading-6 text-slate-600">{article.summary}</p>

        <div className="mt-4 flex items-center gap-3 text-xs font-medium text-slate-500">
          <span className="inline-flex items-center gap-1">
            <Clock3 className="h-3.5 w-3.5" />
            {article.readingMinutes} min czytania
          </span>
          <span>Aktualizacja: {formatArticleDate(article.updatedAt)}</span>
        </div>
      </div>
    </Link>
  );
}
