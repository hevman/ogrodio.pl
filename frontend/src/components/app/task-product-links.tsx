import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { formatMoney, t } from "@/i18n";
import type { Product } from "@/lib/shop-api";
import { site } from "@/lib/site-config";

type Props = {
  products: Product[];
};

export function TaskProductLinks({ products }: Props) {
  if (!products.length) return null;

  return (
    <div className="mt-3 rounded-lg border border-emerald-100 bg-emerald-50/70 p-3">
      <p className="flex items-center gap-1.5 text-xs font-black uppercase text-emerald-800">
        <ShoppingBag className="h-3.5 w-3.5" />
        {t("app.dashboard.taskShopEyebrow")}
      </p>
      <ul className="mt-2 space-y-1.5">
        {products.map((product) => (
          <li key={product.variantId}>
            <a
              className="flex items-center justify-between gap-3 rounded-md px-1 py-1 text-sm transition hover:bg-white/80"
              href={`${site.shopUrl}/produkt/${product.slug}`}
              rel="noopener noreferrer"
              target="_blank"
            >
              <span className="font-bold text-slate-900">{product.name}</span>
              <span className="shrink-0 text-xs font-black text-emerald-800">{formatMoney(product.price)}</span>
            </a>
          </li>
        ))}
      </ul>
      <Link className="mt-2 inline-block text-xs font-bold text-emerald-800 underline-offset-2 hover:underline" href={site.shopUrl}>
        {t("app.dashboard.taskShopCatalog")}
      </Link>
    </div>
  );
}
