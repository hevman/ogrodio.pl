"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { formatMoneyFromCents, t } from "@/i18n";
import { fetchPanelProducts, type PanelProduct } from "@/lib/panel-api";

export default function PanelProductsPage() {
  const [items, setItems] = useState<PanelProduct[]>([]);
  const [total, setTotal] = useState(0);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState(t("panel.loadingProducts"));

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      fetchPanelProducts({ q: query || undefined })
        .then((data) => {
          setItems(data.products.items);
          setTotal(data.products.totalItems);
          setStatus(data.products.items.length ? "" : t("panel.noProducts"));
        })
        .catch((error) => setStatus(error instanceof Error ? error.message : t("panel.productsFetchFailed")));
    }, 200);
    return () => window.clearTimeout(timeout);
  }, [query]);

  return (
    <div className="grid gap-5">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t("panel.products")}</h1>
          <p className="mt-1 text-sm text-slate-600">{t("panel.productsCount", { count: total })}</p>
        </div>
        <input
          className="h-10 min-w-[240px] rounded-lg border border-slate-200 bg-white px-3 text-sm font-semibold"
          onChange={(event) => setQuery(event.target.value)}
          placeholder={t("panel.searchByName")}
          value={query}
        />
      </div>

      {status ? <p className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-slate-600">{status}</p> : null}

      <div className="overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
        <table className="min-w-full text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-left text-xs font-black uppercase text-slate-500">
            <tr>
              <th className="px-4 py-3">{t("panel.product")}</th>
              <th className="px-4 py-3">{t("panel.price")}</th>
              <th className="px-4 py-3">{t("panel.stock")}</th>
              <th className="px-4 py-3">{t("panel.active")}</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const variant = item.variants[0];
              return (
                <tr className="border-b border-slate-100 last:border-0" key={item.id}>
                  <td className="px-4 py-3">
                    <Link className="font-bold text-emerald-800 hover:underline" href={`/panel/products/${item.id}`}>
                      {item.name}
                    </Link>
                    <p className="text-xs text-slate-500">{item.slug}</p>
                  </td>
                  <td className="px-4 py-3">{variant ? formatMoneyFromCents(variant.priceWithTax) : "—"}</td>
                  <td className="px-4 py-3">{variant?.stockLevel || "—"}</td>
                  <td className="px-4 py-3">{item.enabled ? t("common.yes") : t("common.no")}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
