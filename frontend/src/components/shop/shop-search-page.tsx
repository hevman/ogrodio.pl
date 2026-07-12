"use client";

import { Filter, Plus, SlidersHorizontal, Truck } from "lucide-react";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { CartItem, Product } from "@/lib/shop-api";
import { fetchProducts, searchProducts } from "@/lib/shop-api";
import { money, productImage, stockLabel } from "@/components/shop/shop-shared";
import { t } from "@/i18n";

function shortDescription(value: string) {
  const text = value.replace(/\s+/g, " ").trim();
  if (text.length <= 132) return text;
  return `${text.slice(0, 129).trim()}...`;
}

export function ShopSearchPage() {
  const pathname = usePathname();
  const router = useRouter();
  const searchParams = useSearchParams();
  const categoryParam = searchParams.get("category") || "all";
  const queryParam = searchParams.get("q") || "";
  const [products, setProducts] = useState<Product[]>([]);
  const [allProducts, setAllProducts] = useState<Product[]>([]);
  const [category, setCategory] = useState(categoryParam);
  const [query, setQuery] = useState(queryParam);
  const [sort, setSort] = useState("recommended");
  const [stock, setStock] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const [priceFrom, setPriceFrom] = useState("");
  const [priceTo, setPriceTo] = useState("");
  const [brand, setBrand] = useState("");
  const [promo, setPromo] = useState("");
  const [cart, setCart] = useState<CartItem[]>([]);
  const [status, setStatus] = useState(t("shop.loadingProducts"));

  useEffect(() => {
    const saved = window.localStorage.getItem("garden-vendure-cart");
    if (saved) setCart(JSON.parse(saved));

    fetchProducts()
      .then((items) => {
        setAllProducts(items);
        setProducts(items);
        setStatus(items.length ? "" : t("shop.noProducts"));
      })
      .catch((error) => setStatus(error instanceof Error ? error.message : t("common.fetchProductsFailed")));
  }, []);

  useEffect(() => {
    window.localStorage.setItem("garden-vendure-cart", JSON.stringify(cart));
    window.dispatchEvent(new Event("garden-cart-updated"));
  }, [cart]);

  useEffect(() => {
    setCategory(categoryParam);
    setQuery(queryParam);
  }, [categoryParam, queryParam]);

  const categories = useMemo(
    () => Array.from(new Map(allProducts.map((product) => [product.category, product.categoryLabel])).entries()),
    [allProducts],
  );
  const brands = useMemo(
    () => Array.from(new Set(allProducts.map((product) => product.brand).filter(Boolean))) as string[],
    [allProducts],
  );

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      searchProducts(query, category, { sort, stock, maxPrice, priceFrom, priceTo, brand, promo })
        .then((items) => {
          setProducts(items);
          setStatus(items.length ? "" : t("shop.search.noResults"));
        })
        .catch((error) => setStatus(error instanceof Error ? error.message : t("common.searchFailed")));
    }, 180);
    return () => window.clearTimeout(timeout);
  }, [query, category, sort, stock, maxPrice, priceFrom, priceTo, brand, promo]);

  function updateUrl(nextCategory: string) {
    const params = new URLSearchParams();
    if (nextCategory !== "all") params.set("category", nextCategory);
    if (query.trim()) params.set("q", query.trim());
    const suffix = params.toString();
    router.replace(suffix ? `${pathname}?${suffix}` : pathname, { scroll: false });
  }

  function selectCategory(nextCategory: string) {
    setCategory(nextCategory);
    updateUrl(nextCategory);
  }

  function addToCart(productVariantId: string) {
    setCart((current) => {
      const existing = current.find((item) => item.productVariantId === productVariantId);
      return existing
        ? current.map((item) =>
            item.productVariantId === productVariantId ? { ...item, quantity: item.quantity + 1 } : item,
          )
        : [...current, { productVariantId, quantity: 1 }];
    });
  }

  return (
    <main className="bg-[#f6f7f2] text-slate-950">
      <section className="border-b border-emerald-900/10 bg-white">
        <div className="mx-auto max-w-[1680px] px-6 py-8 2xl:px-8">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <div>
              <p className="text-sm font-black uppercase text-emerald-700">{t("shop.search.catalog")}</p>
              <h1 className="mt-1 text-4xl font-black tracking-tight">
                {query ? t("shop.search.resultsFor", { query }) : t("shop.search.productCatalog")}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">{t("shop.search.intro")}</p>
            </div>
            <Link className="inline-flex h-11 items-center rounded-lg border border-emerald-900/15 bg-white px-4 text-sm font-black text-emerald-800 transition hover:bg-emerald-50" href="/szukaj">
              {t("shop.search.clearResults")}
            </Link>
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-[1680px] px-6 py-8 2xl:px-8">
        {status ? <p className="mb-5 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">{status}</p> : null}

        <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
          <aside className="self-start rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm lg:sticky lg:top-36">
            <p className="flex items-center gap-2 text-sm font-black uppercase text-emerald-800">
              <Filter className="h-4 w-4" />
              {t("shop.categories")}
            </p>
            <div className="mt-4 grid gap-2">
              <button
                className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-black ${category === "all" ? "bg-emerald-700 text-white" : "bg-slate-50 text-slate-700 hover:bg-emerald-50"}`}
                onClick={() => selectCategory("all")}
                type="button"
              >
                {t("common.all")}
                <span>{allProducts.length}</span>
              </button>
              {categories.map(([value, label]) => {
                const amount = allProducts.filter((product) => product.category === value).length;
                return (
                  <button
                    className={`flex items-center justify-between rounded-lg px-3 py-2 text-left text-sm font-black ${category === value ? "bg-emerald-700 text-white" : "bg-slate-50 text-slate-700 hover:bg-emerald-50"}`}
                    key={value}
                    onClick={() => selectCategory(value)}
                    type="button"
                  >
                    {label}
                    <span>{amount}</span>
                  </button>
                );
              })}
            </div>
            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="text-sm font-black uppercase text-emerald-800">{t("shop.search.availability")}</p>
              <label className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                <input checked={stock === "in-stock"} onChange={(event) => setStock(event.target.checked ? "in-stock" : "")} type="checkbox" />
                {t("shop.search.inStockOnly")}
              </label>
              <label className="mt-3 flex items-center gap-2 text-sm font-bold text-slate-700">
                <input checked={promo === "true"} onChange={(event) => setPromo(event.target.checked ? "true" : "")} type="checkbox" />
                {t("shop.search.promotions")}
              </label>
            </div>
            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="text-sm font-black uppercase text-emerald-800">{t("shop.search.price")}</p>
              <div className="mt-3 grid grid-cols-2 gap-2">
                <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-bold" inputMode="decimal" onChange={(event) => setPriceFrom(event.target.value)} placeholder={t("shop.search.priceFrom")} value={priceFrom} />
                <input className="h-10 rounded-lg border border-slate-200 px-3 text-sm font-bold" inputMode="decimal" onChange={(event) => setPriceTo(event.target.value)} placeholder={t("shop.search.priceTo")} value={priceTo} />
              </div>
              <select className="mt-2 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold" onChange={(event) => setMaxPrice(event.target.value)} value={maxPrice}>
                <option value="">{t("shop.search.anyPrice")}</option>
                <option value="15">{t("shop.search.priceUpTo15")}</option>
                <option value="30">{t("shop.search.priceUpTo30")}</option>
                <option value="50">{t("shop.search.priceUpTo50")}</option>
              </select>
            </div>
            <div className="mt-5 border-t border-slate-200 pt-5">
              <p className="text-sm font-black uppercase text-emerald-800">{t("shop.search.brand")}</p>
              <select className="mt-3 h-10 w-full rounded-lg border border-slate-200 px-3 text-sm font-bold" onChange={(event) => setBrand(event.target.value)} value={brand}>
                <option value="">{t("shop.search.allBrands")}</option>
                {brands.map((item) => (
                  <option value={item} key={item}>{item}</option>
                ))}
              </select>
            </div>
            <div id="dostawa" className="mt-5 rounded-lg border border-emerald-900/10 bg-emerald-50 p-4">
              <p className="flex items-center gap-2 font-black text-emerald-950">
                <Truck className="h-4 w-4" />
                {t("footer.shop.delivery")}
              </p>
              <p className="mt-2 text-sm leading-6 text-slate-700">{t("shop.search.shippingNote")}</p>
            </div>
          </aside>

          <div>
            <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-emerald-900/10 bg-white px-4 py-3 shadow-sm">
              <p className="flex items-center gap-2 text-sm font-bold text-slate-600">
                <SlidersHorizontal className="h-4 w-4 text-emerald-700" />
                {t("shop.search.productCount", { count: products.length })}
              </p>
              <label className="flex items-center gap-2 text-sm font-bold text-slate-600">
                {t("shop.search.sort")}
                <select className="h-9 rounded-lg border border-slate-200 bg-white px-3 text-sm font-bold" onChange={(event) => setSort(event.target.value)} value={sort}>
                  <option value="recommended">{t("shop.search.sortRecommended")}</option>
                  <option value="price-asc">{t("shop.search.sortPriceAsc")}</option>
                  <option value="price-desc">{t("shop.search.sortPriceDesc")}</option>
                  <option value="name">{t("shop.search.sortName")}</option>
                </select>
              </label>
            </div>

            <div className="grid items-stretch gap-5 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
              {products.map((product) => (
                <article className="flex h-full min-h-[470px] flex-col overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" key={product.variantId}>
                  <Link href={`/produkt/${product.slug}`}>
                    <span className="relative block bg-slate-50">
                      <img className="h-52 w-full object-contain p-3 transition duration-200 hover:scale-[1.02] 2xl:h-56" src={productImage(product)} alt="" />
                      {product.badge ? <span className="absolute left-3 top-3 rounded-md bg-red-600 px-2 py-1 text-xs font-black uppercase text-white">{product.badge}</span> : null}
                    </span>
                  </Link>
                  <div className="flex flex-1 flex-col gap-4 p-4">
                    <div>
                      <div className="mb-2 flex items-center justify-between gap-2 text-xs font-black uppercase text-emerald-800">
                        <span>{product.categoryLabel}</span>
                        <span>{stockLabel(product.stock)}</span>
                      </div>
                      <p className="mb-1 text-xs font-bold text-slate-500">{product.brand || t("site.name")}</p>
                      <Link className="block min-h-14 text-lg font-black leading-7 transition hover:text-emerald-800" href={`/produkt/${product.slug}`}>
                        {product.name}
                      </Link>
                      <p className="mt-2 h-[72px] overflow-hidden text-sm leading-6 text-slate-600">{shortDescription(product.description)}</p>
                    </div>
                    <div className="mt-auto flex items-center justify-between gap-3 border-t border-slate-100 pt-4">
                      <div>
                        <div className="flex items-baseline gap-2">
                          <strong className="text-2xl text-emerald-800">{money(product.price)}</strong>
                          {product.oldPrice ? <span className="text-sm font-bold text-slate-400 line-through">{money(product.oldPrice)}</span> : null}
                        </div>
                        <p className="mt-1 text-xs font-bold text-slate-500">{product.deliveryTag || t("common.deliveryCourierPl")}</p>
                      </div>
                      <button
                        className="flex h-11 items-center gap-2 rounded-lg bg-slate-950 px-4 text-sm font-black text-white"
                        onClick={() => addToCart(product.variantId)}
                        type="button"
                      >
                        <Plus className="h-4 w-4" />
                        {t("shop.search.add")}
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
