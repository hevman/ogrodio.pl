"use client";

import Link from "next/link";
import { FormEvent, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { t } from "@/i18n";
import {
  fetchPanelProduct,
  updatePanelProduct,
  updatePanelProductVariant,
  type PanelProduct,
} from "@/lib/panel-api";

const formatPriceInput = (value: number) => (value / 100).toFixed(2);

export default function PanelProductEditPage() {
  const params = useParams<{ id: string }>();
  const productId = params.id;
  const [product, setProduct] = useState<PanelProduct | null>(null);
  const [price, setPrice] = useState("");
  const [status, setStatus] = useState(t("panel.loadingProduct"));
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    fetchPanelProduct(productId)
      .then((data) => {
        setProduct(data);
        const variant = data.variants[0];
        setPrice(variant ? formatPriceInput(variant.priceWithTax) : "");
        setStatus("");
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : t("panel.productNotFound")));
  }, [productId]);

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!product) return;
    setIsSaving(true);
    setStatus(t("common.saving"));
    try {
      const saved = await updatePanelProduct(productId, {
        name: product.name,
        description: product.description,
        enabled: product.enabled,
      });
      const variant = saved.variants[0];
      if (variant) {
        await updatePanelProductVariant(productId, variant.id, {
          price: Math.round(Number(price.replace(",", ".")) * 100),
        });
      }
      const refreshed = await fetchPanelProduct(productId);
      setProduct(refreshed);
      setStatus(t("common.saved"));
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("common.saveFailed"));
    } finally {
      setIsSaving(false);
    }
  }

  if (!product) {
    return <p className="rounded-lg bg-white px-4 py-3 text-sm font-bold text-slate-600">{status}</p>;
  }

  return (
    <div className="grid gap-5">
      <Link className="inline-flex items-center gap-2 text-sm font-black text-emerald-800" href="/panel/products">
        <ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </Link>

      <form className="grid gap-4 rounded-lg border border-slate-200 bg-white p-5 shadow-sm" onSubmit={save}>
        <div>
          <h1 className="text-2xl font-black tracking-tight">{t("panel.editProduct")}</h1>
          <p className="mt-1 text-sm text-slate-500">{product.slug}</p>
        </div>

        <label className="grid gap-2 text-sm font-bold">
          {t("panel.name")}
          <input
            className="h-11 rounded-lg border border-slate-200 px-3"
            onChange={(event) => setProduct({ ...product, name: event.target.value })}
            required
            value={product.name}
          />
        </label>

        <label className="inline-flex items-center gap-2 text-sm font-bold">
          <input
            checked={product.enabled}
            onChange={(event) => setProduct({ ...product, enabled: event.target.checked })}
            type="checkbox"
          />
          {t("panel.productActive")}
        </label>

        <label className="grid gap-2 text-sm font-bold">
          {t("panel.description")}
          <textarea
            className="min-h-32 rounded-lg border border-slate-200 px-3 py-2"
            onChange={(event) => setProduct({ ...product, description: event.target.value })}
            value={product.description || ""}
          />
        </label>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className="grid gap-2 text-sm font-bold">
            {t("panel.priceGross")}
            <input
              className="h-11 rounded-lg border border-slate-200 px-3"
              inputMode="decimal"
              onChange={(event) => setPrice(event.target.value)}
              value={price}
            />
          </label>
          <div className="grid gap-2 text-sm font-bold">
            {t("panel.stockLevel")}
            <p className="flex h-11 items-center rounded-lg border border-slate-200 bg-slate-50 px-3 text-slate-600">
              {product.variants[0]?.stockLevel || "—"}
            </p>
          </div>
        </div>

        {status ? <p className="text-sm font-bold text-emerald-800">{status}</p> : null}

        <button className="h-11 rounded-lg bg-emerald-700 font-black text-white disabled:opacity-60" disabled={isSaving} type="submit">
          {t("common.save")}
        </button>
      </form>
    </div>
  );
}
