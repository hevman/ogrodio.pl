"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { t } from "@/i18n";
import { fetchPanelArticle, indexAllArticles, updatePanelArticle, type PanelArticle } from "@/lib/panel-api";

function linesToList(value: string) {
  return value
    .split("\n")
    .map((line) => line.trim())
    .filter(Boolean);
}

function listToLines(items: string[] | undefined) {
  return (items ?? []).join("\n");
}

export default function PanelArticleEditPage() {
  const params = useParams<{ id: string }>();
  const articleId = Number(params.id);
  const [article, setArticle] = useState<PanelArticle | null>(null);
  const [relatedArticlesText, setRelatedArticlesText] = useState("");
  const [tipsText, setTipsText] = useState("");
  const [status, setStatus] = useState(t("panel.loadingArticle"));
  const [isSaving, setIsSaving] = useState(false);
  const [isReindexing, setIsReindexing] = useState(false);

  useEffect(() => {
    fetchPanelArticle(articleId)
      .then((data) => {
        setArticle(data);
        setRelatedArticlesText(listToLines(data.relatedArticles));
        setTipsText(listToLines(data.tips));
        setStatus("");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : t("panel.articleNotFound")));
  }, [articleId]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!article) return;
    setIsSaving(true);
    setStatus(t("common.saving"));
    try {
      const saved = await updatePanelArticle(articleId, {
        title: article.title,
        topic: article.topic,
        summary: article.summary,
        status: article.status,
        relatedArticles: linesToList(relatedArticlesText),
        tips: linesToList(tipsText),
        seoTitle: article.seo.title,
        seoDescription: article.seo.description,
      });
      setArticle(saved);
      setRelatedArticlesText(listToLines(saved.relatedArticles));
      setTipsText(listToLines(saved.tips));
      setStatus(t("common.saved"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("common.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  async function reindexSearch() {
    setIsReindexing(true);
    setStatus(t("panel.indexing"));
    try {
      const result = await indexAllArticles();
      setStatus(t("panel.indexed", { count: result.indexed }));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("panel.indexFailed"));
    } finally {
      setIsReindexing(false);
    }
  }

  if (!article) {
    return <p className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-slate-600">{status}</p>;
  }

  return (
    <div className="grid gap-5">
      <Link className="inline-flex items-center gap-2 text-sm font-black text-emerald-800" href="/panel/articles">
        <ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </Link>

      <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={save}>
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t("panel.editArticle")}</h1>
          <p className="mt-1 text-sm text-slate-500">{article.slug}</p>
          <p className="mt-3 rounded-lg bg-amber-50 px-3 py-2 text-sm text-amber-900">{t("panel.jsonSyncNote")}</p>
        </div>

        <label className="grid gap-2 text-sm font-bold">
          {t("panel.title")}
          <input
            className="h-11 rounded-lg border border-slate-200 px-3"
            onChange={(event) => setArticle({ ...article, title: event.target.value })}
            required
            value={article.title}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold">
          {t("panel.topic")}
          <input
            className="h-11 rounded-lg border border-slate-200 px-3"
            onChange={(event) => setArticle({ ...article, topic: event.target.value })}
            value={article.topic}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold">
          {t("panel.status")}
          <select
            className="h-11 rounded-lg border border-slate-200 px-3"
            onChange={(event) => setArticle({ ...article, status: event.target.value })}
            value={article.status}
          >
            <option value="published">published</option>
            <option value="draft">draft</option>
          </select>
        </label>

        <label className="grid gap-2 text-sm font-bold">
          {t("panel.summary")}
          <textarea
            className="min-h-28 rounded-lg border border-slate-200 px-3 py-2"
            onChange={(event) => setArticle({ ...article, summary: event.target.value })}
            value={article.summary}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold">
          {t("panel.relatedArticles")}
          <textarea
            className="min-h-28 rounded-lg border border-slate-200 px-3 py-2 font-mono text-sm"
            onChange={(event) => setRelatedArticlesText(event.target.value)}
            placeholder="odmiany-borowki-terminy-dojrzewania"
            value={relatedArticlesText}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold">
          {t("panel.tips")}
          <textarea
            className="min-h-28 rounded-lg border border-slate-200 px-3 py-2"
            onChange={(event) => setTipsText(event.target.value)}
            value={tipsText}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold">
          {t("panel.seoTitle")}
          <input
            className="h-11 rounded-lg border border-slate-200 px-3"
            onChange={(event) => setArticle({ ...article, seo: { ...article.seo, title: event.target.value } })}
            value={article.seo.title || ""}
          />
        </label>

        <label className="grid gap-2 text-sm font-bold">
          {t("panel.seoDescription")}
          <textarea
            className="min-h-24 rounded-lg border border-slate-200 px-3 py-2"
            onChange={(event) => setArticle({ ...article, seo: { ...article.seo, description: event.target.value } })}
            value={article.seo.description || ""}
          />
        </label>

        {status ? <p className="text-sm font-bold text-emerald-800">{status}</p> : null}

        <div className="flex flex-wrap gap-3">
          <button className="h-11 rounded-lg bg-emerald-700 px-5 font-black text-white disabled:opacity-60" disabled={isSaving} type="submit">
            {t("common.save")}
          </button>
          <button
            className="h-11 rounded-lg border border-slate-200 px-5 font-black text-slate-700 disabled:opacity-60"
            disabled={isReindexing}
            onClick={reindexSearch}
            type="button"
          >
            {t("panel.reindexArticles")}
          </button>
        </div>
      </form>
    </div>
  );
}
