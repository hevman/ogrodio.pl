import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { t } from "@/i18n";
import type { ArticleLinkTarget } from "@/lib/article-links";

type Props = {
  links: ArticleLinkTarget[];
  title?: string;
};

export function ArticleInternalLinks({ links, title }: Props) {
  if (!links.length) return null;

  return (
    <section className="rounded-3xl border border-teal-200 bg-teal-50/60 p-6 shadow-sm sm:p-8">
      <p className="text-sm font-bold uppercase tracking-wide text-teal-800">{t("advice.relatedEyebrow")}</p>
      <h2 className="mt-2 text-xl font-bold text-slate-900">{title || t("advice.relatedTitle")}</h2>
      <ul className="mt-4 grid gap-3 sm:grid-cols-2">
        {links.map((link) => (
          <li key={link.slug}>
            <Link
              className="group flex items-start justify-between gap-3 rounded-2xl border border-white/80 bg-white px-4 py-3 transition hover:border-teal-200 hover:shadow-sm"
              href={link.href}
            >
              <span>
                <span className="block text-xs font-bold uppercase text-teal-700">{link.topic}</span>
                <span className="mt-1 block text-sm font-bold leading-snug text-slate-900 group-hover:text-teal-800">
                  {link.title}
                </span>
              </span>
              <ArrowUpRight className="mt-1 h-4 w-4 shrink-0 text-teal-600" />
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
