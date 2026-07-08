"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { BookOpen, Package, RefreshCw } from "lucide-react";
import { t } from "@/i18n";
import { fetchPanelArticles, fetchPanelProducts, indexAllArticles } from "@/lib/panel-api";

export default function PanelDashboardPage() {
  const [articles, setArticles] = useState(0);
  const [products, setProducts] = useState(0);
  const [status, setStatus] = useState(t("panel.loadingStats"));
  const [indexStatus, setIndexStatus] = useState("");

  useEffect(() => {
    Promise.all([fetchPanelArticles(), fetchPanelProducts()])
      .then(([articlesData, productsData]) => {
        setArticles(articlesData.total);
        setProducts(productsData.products.totalItems);
        setStatus("");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : t("common.fetchFailed")));
  }, []);

  async function reindexArticles() {
    setIndexStatus(t("panel.indexing"));
    try {
      const result = await indexAllArticles();
      setIndexStatus(t("panel.indexed", { count: result.indexed }));
    } catch (error) {
      setIndexStatus(error instanceof Error ? error.message : t("panel.indexFailed"));
    }
  }

  return (
    <div className="grid gap-5">
      <div>
        <h1 className="text-2xl font-black tracking-tight">{t("panel.dashboard")}</h1>
        <p className="mt-1 text-sm text-slate-600">{t("panel.dashboardSubtitle")}</p>
      </div>

      {status ? <p className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-slate-600">{status}</p> : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <Link className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300" href="/panel/articles">
          <BookOpen className="h-6 w-6 text-emerald-700" />
          <p className="mt-3 text-sm font-black uppercase text-emerald-800">{t("panel.articles")}</p>
          <p className="mt-1 text-3xl font-black">{articles}</p>
        </Link>
        <Link className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm transition hover:border-emerald-300" href="/panel/products">
          <Package className="h-6 w-6 text-emerald-700" />
          <p className="mt-3 text-sm font-black uppercase text-emerald-800">{t("panel.products")}</p>
          <p className="mt-1 text-3xl font-black">{products}</p>
        </Link>
      </div>

      <section className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <p className="text-sm font-black uppercase text-slate-500">{t("panel.tools")}</p>
        <button
          className="mt-3 inline-flex items-center gap-2 rounded-lg bg-slate-950 px-4 py-2 text-sm font-black text-white"
          onClick={reindexArticles}
          type="button"
        >
          <RefreshCw className="h-4 w-4" />
          {t("panel.reindexArticles")}
        </button>
        {indexStatus ? <p className="mt-3 text-sm font-bold text-emerald-800">{indexStatus}</p> : null}
      </section>
    </div>
  );
}
