"use client";

import {
  ArrowLeft,
  BookOpen,
  Check,
  ChevronRight,
  Heart,
  Leaf,
  Minus,
  Plus,
  RotateCcw,
  ShieldCheck,
  ShoppingBag,
  Sprout,
  Truck,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { addFavorite, fetchFavorites, fetchProductBySlug, removeFavorite } from "@/lib/shop-api";
import type { CartItem, Product } from "@/lib/shop-api";
import { categoryImages, money, productImage, stockLabel } from "@/components/shop/shop-shared";
import { formatMoney, t, type MessageKey } from "@/i18n";

type CareKey = "careHerbs" | "careBalcony" | "careHouseplants" | "careDefault";

const careByCategory: Record<string, CareKey> = {
  ziola: "careHerbs",
  "balkon-i-taras": "careBalcony",
  "rosliny-domowe": "careHouseplants",
  produkty: "careDefault",
};

const careContent: Record<CareKey, { location: MessageKey; watering: MessageKey; usage: MessageKey }> = {
  careHerbs: {
    location: "shop.product.careHerbs.location",
    watering: "shop.product.careHerbs.watering",
    usage: "shop.product.careHerbs.usage",
  },
  careBalcony: {
    location: "shop.product.careBalcony.location",
    watering: "shop.product.careBalcony.watering",
    usage: "shop.product.careBalcony.usage",
  },
  careHouseplants: {
    location: "shop.product.careHouseplants.location",
    watering: "shop.product.careHouseplants.watering",
    usage: "shop.product.careHouseplants.usage",
  },
  careDefault: {
    location: "shop.product.careDefault.location",
    watering: "shop.product.careDefault.watering",
    usage: "shop.product.careDefault.usage",
  },
};

function careItems(category: string) {
  const key = careByCategory[category] || "careDefault";
  const content = careContent[key];
  return [
    { label: t("shop.product.careLabels.location"), value: t(content.location) },
    { label: t("shop.product.careLabels.watering"), value: t(content.watering) },
    { label: t("shop.product.careLabels.usage"), value: t(content.usage) },
  ];
}

function fallbackImage(product?: Product | null) {
  if (!product) return categoryImages.produkty;
  return categoryImages[product.category] || categoryImages.produkty;
}

function ebookPreviewPdf(product: Product) {
  if (product.slug !== "borowki-bez-bledow-ebook") return "";
  return "/products/ebooks/borowki-bez-bledow/preview-borowki-bez-bledow.pdf";
}

export function ProductPage({ slug }: { slug: string }) {
  const [product, setProduct] = useState<Product | null>(null);
  const [imageSrc, setImageSrc] = useState(categoryImages.produkty);
  const [quantity, setQuantity] = useState(1);
  const [status, setStatus] = useState(t("shop.product.loading"));
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    fetchProductBySlug(slug)
      .then((item) => {
        setProduct(item);
        setImageSrc(item ? productImage(item) : categoryImages.produkty);
        setStatus(item ? "" : t("shop.product.notFound"));
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : t("common.fetchProductFailed")));
  }, [slug]);

  useEffect(() => {
    if (!product) return;
    fetchFavorites()
      .then((favorites) => setIsFavorite(favorites.some((item) => item.productVariantId === product.variantId)))
      .catch(() => {
        const saved = JSON.parse(window.localStorage.getItem("garden-favorites") || "[]") as string[];
        setIsFavorite(saved.includes(product.variantId));
      });
  }, [product]);

  const care = useMemo(() => careItems(product?.category || "produkty"), [product]);

  function addToCart() {
    if (!product) return;
    const saved = window.localStorage.getItem("garden-vendure-cart");
    const cart = saved ? (JSON.parse(saved) as CartItem[]) : [];
    const next = cart.some((item) => item.productVariantId === product.variantId)
      ? cart.map((item) =>
          item.productVariantId === product.variantId
            ? { ...item, quantity: item.quantity + quantity }
            : item,
        )
      : [...cart, { productVariantId: product.variantId, quantity }];

    window.localStorage.setItem("garden-vendure-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("garden-cart-updated"));
    setStatus(t("shop.product.addedToCart"));
  }

  function toggleFavorite() {
    if (!product) return;
    const nextFavorite = !isFavorite;
    setIsFavorite(nextFavorite);
    const sync = nextFavorite ? addFavorite(product) : removeFavorite(product.variantId);
    sync.catch(() => {
      const saved = JSON.parse(window.localStorage.getItem("garden-favorites") || "[]") as string[];
      const next = nextFavorite
        ? Array.from(new Set([...saved, product.variantId]))
        : saved.filter((id) => id !== product.variantId);
      window.localStorage.setItem("garden-favorites", JSON.stringify(next));
    });
  }

  if (!product) {
    return (
      <main className="min-h-[70vh] bg-[#f6f7f2] px-5 py-12">
        <div className="mx-auto max-w-4xl rounded-lg bg-white p-6 shadow-sm">
          <Link className="mb-5 inline-flex items-center gap-2 text-sm font-black text-emerald-800" href="/">
            <ArrowLeft className="h-4 w-4" />
            {t("common.backToShop")}
          </Link>
          <p className="text-lg font-bold text-slate-700">{status}</p>
        </div>
      </main>
    );
  }

  const lineTotal = product.price * quantity;
  const isDigital = product.category === "ebooki";
  const previewPdf = isDigital ? ebookPreviewPdf(product) : "";
  const highlightTags = isDigital
    ? [product.categoryLabel, "PDF + EPUB", "Dostęp po płatności"]
    : [product.categoryLabel, t("shop.product.deliveryInPoland"), t("shop.product.courierShipping")];

  return (
    <main className="bg-[#f6f7f2] text-slate-950">
      <section className="border-b border-emerald-900/10 bg-white">
        <div className="mx-auto max-w-[1680px] px-6 py-5 2xl:px-8">
          <div className="flex flex-wrap items-center gap-2 text-sm font-bold text-slate-500">
            <Link className="text-emerald-800" href="/">
              {t("site.nav.shop")}
            </Link>
            <ChevronRight className="h-4 w-4" />
            <span>{product.categoryLabel}</span>
            <ChevronRight className="h-4 w-4" />
            <span className="text-slate-900">{product.name}</span>
          </div>
        </div>
      </section>

      <section className="mx-auto grid max-w-[1680px] gap-8 px-6 py-8 lg:grid-cols-[1.28fr_.72fr] 2xl:px-8">
        <div>
          <Link className="mb-5 inline-flex items-center gap-2 text-sm font-black text-emerald-800" href="/">
            <ArrowLeft className="h-4 w-4" />
            {t("common.backToShop")}
          </Link>

          <div className={`overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-sm ${isDigital ? "mx-auto max-w-xl" : ""}`}>
            <img
              className={`${isDigital ? "aspect-[210/297]" : "aspect-[4/3]"} w-full bg-slate-50 object-contain p-6`}
              src={imageSrc}
              alt={product.name}
              onError={() => setImageSrc(fallbackImage(product))}
            />
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3">
            {highlightTags.map((item) => (
              <div className="rounded-lg border border-emerald-900/10 bg-white p-4 text-sm font-black text-slate-700" key={item}>
                {item}
              </div>
            ))}
          </div>
        </div>

        <aside className="self-start rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm lg:sticky lg:top-20">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-emerald-800">{product.categoryLabel}</p>
              <h1 className="mt-3 text-4xl font-black tracking-tight">{product.name}</h1>
            </div>
            <button
              className={`grid h-11 w-11 shrink-0 place-items-center rounded-lg border border-slate-200 ${isFavorite ? "bg-red-50 text-red-600" : "text-slate-600"}`}
              onClick={toggleFavorite}
              type="button"
              aria-label={t("shop.product.addToFavorites")}
            >
              <Heart className={`h-5 w-5 ${isFavorite ? "fill-red-500" : ""}`} />
            </button>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            {product.badge ? <span className="rounded-md bg-red-600 px-2 py-1 text-xs font-black uppercase text-white">{product.badge}</span> : null}
          </div>

          <p className="mt-4 text-base leading-7 text-slate-600">{product.description}</p>

          <div className="mt-6 grid gap-3 border-y border-slate-200 py-5 text-sm">
            <p className="flex justify-between gap-4">
              <span className="text-slate-500">{t("shop.product.availability")}</span>
              <strong className="text-emerald-800">{stockLabel(product.stock)}</strong>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-500">{t("shop.product.purchaseForm")}</span>
              <strong>{t("shop.product.onlineReservation")}</strong>
            </p>
            <p className="flex justify-between gap-4">
              <span className="text-slate-500">{t("shop.product.skuVariant")}</span>
              <strong>{product.sku || product.variantId}</strong>
            </p>
          </div>

          <div className="mt-6 grid gap-4">
            <div>
              <p className="text-sm font-bold text-slate-500">{t("shop.product.grossPrice")}</p>
              <div className="flex items-baseline gap-3">
                <strong className="text-4xl font-black text-emerald-800">{money(product.price)}</strong>
                {product.oldPrice ? <span className="text-lg font-bold text-slate-400 line-through">{money(product.oldPrice)}</span> : null}
              </div>
            </div>

            <div className="flex items-center justify-between gap-4 rounded-lg bg-slate-50 p-3">
              <span className="text-sm font-black text-slate-700">{t("shop.product.quantity")}</span>
              <div className="flex items-center gap-2">
                <button className="grid h-10 w-10 place-items-center rounded-lg border bg-white" onClick={() => setQuantity((value) => Math.max(1, value - 1))} type="button">
                  <Minus className="h-4 w-4" />
                </button>
                <span className="w-8 text-center text-lg font-black">{quantity}</span>
                <button className="grid h-10 w-10 place-items-center rounded-lg border bg-white" onClick={() => setQuantity((value) => value + 1)} type="button">
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between rounded-lg bg-emerald-50 p-4 text-emerald-950">
              <span className="font-black">{t("common.total")}</span>
              <strong className="text-2xl">{money(lineTotal)}</strong>
            </div>
          </div>

          <button
            className="mt-6 flex h-12 w-full items-center justify-center gap-2 rounded-lg bg-emerald-700 px-4 font-black text-white"
            onClick={addToCart}
            type="button"
          >
            <ShoppingBag className="h-4 w-4" />
            {t("shop.product.addToCart")}
          </button>

          {status ? (
            <p className="mt-4 flex items-start gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-sm font-bold text-emerald-900">
              <Check className="mt-0.5 h-4 w-4 shrink-0" />
              {status}
            </p>
          ) : null}

          <div className="mt-5 grid gap-3 text-sm">
            <div className="flex gap-3 rounded-lg border border-slate-200 p-3">
              {isDigital ? <BookOpen className="h-5 w-5 text-emerald-700" /> : <Truck className="h-5 w-5 text-emerald-700" />}
              <div>
                <p className="font-black">{isDigital ? "PDF i EPUB" : t("shop.product.deliveryNationwide")}</p>
                <p className="mt-1 text-slate-600">
                  {isDigital ? "Bez kosztów wysyłki. PDF i EPUB otrzymasz e-mailem po potwierdzeniu płatności." : t("shop.product.shippingFrom", { price: formatMoney(18.99) })}
                </p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg border border-slate-200 p-3">
              <ShieldCheck className="h-5 w-5 text-emerald-700" />
              <div>
                <p className="font-black">{isDigital ? "Produkt cyfrowy" : t("shop.product.safeOrder")}</p>
                <p className="mt-1 text-slate-600">
                  {isDigital ? "Pliki są wysyłane na adres e-mail podany w zamówieniu i są przeznaczone do osobistego użytku kupującego." : t("shop.product.beforeShipping")}
                </p>
              </div>
            </div>
          </div>
        </aside>
      </section>

      {previewPdf ? (
        <section className="mx-auto max-w-[1680px] px-6 pb-12 2xl:px-8">
          <article className="rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm">
            <div className="flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="flex items-center gap-2 text-sm font-black uppercase text-emerald-800">
                  <BookOpen className="h-4 w-4" />
                  Podgląd e-booka
                </p>
                <h2 className="mt-2 text-2xl font-black">Zobacz pierwsze strony przed zakupem</h2>
                <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
                  Pobierz krótki PDF z pierwszymi 5 stronami poradnika. Pełny plik PDF i EPUB wysyłamy po potwierdzeniu płatności.
                </p>
              </div>
              <a
                className="inline-flex h-11 items-center rounded-lg bg-emerald-700 px-4 text-sm font-black text-white"
                href={previewPdf}
                download
              >
                Pobierz PDF
              </a>
            </div>
          </article>
        </section>
      ) : null}
      <section className="mx-auto grid max-w-[1680px] gap-6 px-6 pb-12 lg:grid-cols-[1fr_1fr] 2xl:px-8">
        <article className="rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-black uppercase text-emerald-800">
            <Leaf className="h-4 w-4" />
            {t("shop.product.care")}
          </p>
          <h2 className="mt-2 text-2xl font-black">{t("shop.product.careTitle")}</h2>
          <div className="mt-5 grid gap-3">
            {care.map((item) => (
              <div className="rounded-lg bg-slate-50 p-4" key={item.label}>
                <p className="font-black">{item.label}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{item.value}</p>
              </div>
            ))}
          </div>
        </article>

        <article className="rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-black uppercase text-emerald-800">
            <Sprout className="h-4 w-4" />
            {t("shop.product.shopDetails")}
          </p>
          <h2 className="mt-2 text-2xl font-black">{t("shop.product.purchaseDeliverySupport")}</h2>
          <div className="mt-5 grid gap-3">
            <div className="flex gap-3 rounded-lg bg-slate-50 p-4">
              <RotateCcw className="mt-0.5 h-5 w-5 text-emerald-700" />
              <div>
                <p className="font-black">{t("shop.product.riskFreeOrder")}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{t("shop.product.riskFreeOrderText")}</p>
              </div>
            </div>
            <div className="flex gap-3 rounded-lg bg-slate-50 p-4">
              <BookOpen className="mt-0.5 h-5 w-5 text-emerald-700" />
              <div>
                <p className="font-black">{t("shop.product.linkedToAdvice")}</p>
                <p className="mt-1 text-sm leading-6 text-slate-600">{t("shop.product.adviceHint")}</p>
              </div>
            </div>
          </div>
          <div className="mt-5 flex flex-wrap gap-3">
            <a className="inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700" href="/porady">
              {t("header.gardenAdvice")}
            </a>
          </div>
        </article>
      </section>

      <section className="mx-auto grid max-w-[1680px] gap-6 px-6 pb-12 lg:grid-cols-[1fr_1fr] 2xl:px-8">
        <article className="rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm">
          <p className="text-sm font-black uppercase text-emerald-800">{t("shop.product.beforePurchase")}</p>
          <h2 className="mt-2 text-2xl font-black">{t("shop.product.checkAdvice")}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">{t("shop.product.checkBeforeOrder")}</p>
          <Link className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg border border-slate-200 px-4 text-sm font-black text-slate-700" href="/porady">
            {t("header.gardenAdvice")}
          </Link>
        </article>
      </section>
    </main>
  );
}
