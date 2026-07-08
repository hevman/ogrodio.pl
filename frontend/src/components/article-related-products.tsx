import Image from "next/image";
import Link from "next/link";
import { ShoppingBag } from "lucide-react";
import { formatMoney, t } from "@/i18n";
import type { Product } from "@/lib/shop-api";
import { site } from "@/lib/site-config";
import { productImage } from "@/components/shop/shop-shared";

type Props = {
  products: Product[];
  topic: string;
};

export function ArticleRelatedProducts({ products, topic }: Props) {
  return (
    <div className="rounded-3xl border border-emerald-200 bg-emerald-950 p-6 text-white">
      <p className="inline-flex items-center gap-2 text-sm font-semibold text-emerald-200">
        <ShoppingBag className="h-4 w-4" />
        {t("advice.shopEyebrow")}
      </p>
      <h2 className="mt-2 text-lg font-bold">{t("advice.shopTitle")}</h2>
      <p className="mt-2 text-sm leading-6 text-emerald-100">{t("advice.shopText", { topic })}</p>

      {products.length ? (
        <ul className="mt-4 space-y-3">
          {products.map((product) => (
            <li key={product.variantId}>
              <a
                className="group grid grid-cols-[52px_1fr_auto] items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-2 transition hover:border-emerald-300/40 hover:bg-white/10"
                href={`${site.shopUrl}/produkt/${product.slug}`}
              >
                <Image
                  alt=""
                  className="h-12 w-12 rounded-lg object-cover"
                  height={48}
                  src={productImage(product)}
                  width={48}
                />
                <span>
                  <span className="block text-sm font-bold leading-snug group-hover:text-emerald-100">{product.name}</span>
                  <span className="mt-0.5 block text-xs text-emerald-200/80">{product.categoryLabel}</span>
                </span>
                <strong className="text-sm text-emerald-100">{formatMoney(product.price)}</strong>
              </a>
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 rounded-xl bg-white/5 px-4 py-3 text-sm text-emerald-100">{t("advice.shopEmpty")}</p>
      )}

      <a
        className="mt-5 inline-flex h-11 w-full items-center justify-center rounded-xl bg-emerald-400 text-sm font-bold text-emerald-950 transition hover:bg-emerald-300"
        href={site.shopUrl}
      >
        {t("advice.shopCatalog")}
      </a>
    </div>
  );
}
