"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { t } from "@/i18n";
import { fetchPanelArticles, type PanelArticleListItem } from "@/lib/panel-api";

export default function PanelArticlesPage() {
  const [items, setItems] = useState<PanelArticleListItem[]>([]);
  const [status, setStatus] = useState(t("panel.loadingArticles"));
  const [filter, setFilter] = useState("");

  useEffect(() => {
    fetchPanelArticles({ status: filter || undefined })
      .then((data) => {
        setItems(data.items);
        setStatus(data.items.length ? "" : t("panel.noArticles"));
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : t("panel.articlesFetchFailed")));
  }, [filter]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t("panel.articles")}</h1>
          <p className="mt-1 text-sm text-slate-600">{t("panel.articlesSubtitle")}</p>
        </div>
        <select
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold"
          onChange={(event) => setFilter(event.target.value)}
          value={filter}
        >
          <option value="">{t("panel.allStatuses")}</option>
          <option value="published">{t("panel.published")}</option>
          <option value="draft">{t("panel.drafts")}</option>
        </select>
      </div>

      {status ? <p className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-slate-600">{status}</p> : null}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-black uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">{t("panel.title")}</th>
              <th className="px-4 py-3">{t("panel.topic")}</th>
              <th className="px-4 py-3">{t("panel.status")}</th>
              <th className="px-4 py-3">{t("panel.updated")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => (
              <tr className="border-b border-slate-100 last:border-0" key={item.id}>
                <td className="px-4 py-3">
                  <Link className="font-bold text-emerald-800 hover:underline" href={`/panel/articles/${item.id}`}>
                    {item.title}
                  </Link>
                  <p className="text-xs text-slate-500">{item.slug}</p>
                </td>
                <td className="px-4 py-3">{item.topic || "—"}</td>
                <td className="px-4 py-3">
                  <span className="rounded-full bg-slate-100 px-2 py-1 text-xs font-black uppercase">{item.status}</span>
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {new Date(item.updated_at).toLocaleDateString("pl-PL")}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
