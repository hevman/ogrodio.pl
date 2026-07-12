import Image from "next/image";
import { Check, ChevronRight, Clock, Leaf, PackageCheck, Search, ShieldCheck, ShoppingBag, Sparkles, Sprout, Star, Truck } from "lucide-react";
import Link from "next/link";
import type { Product } from "@/lib/shop-api";
import { departmentHighlights, money, productImage } from "@/components/shop/shop-shared";
import { t } from "@/i18n";

const sellingPoints = [
  { icon: ShieldCheck, titleKey: "shop.realStock" as const, textKey: "shop.realStockText" as const },
  { icon: Truck, titleKey: "shop.nationwideDelivery" as const, textKey: "shop.nationwideDeliveryText" as const },
  { icon: Clock, titleKey: "shop.fastFulfillment" as const, textKey: "shop.fastFulfillmentText" as const },
];

const promoTiles = [
  {
    titleKey: "shop.herbGardenTitle" as const,
    textKey: "shop.herbGardenText" as const,
    href: "/szukaj?category=ziola",
    image: "/products/herbs-real.jpg",
  },
  {
    titleKey: "shop.balconyPromoTitle" as const,
    textKey: "shop.balconyPromoText" as const,
    href: "/szukaj?category=balkon-i-taras",
    image: "/products/balcony-real.jpg",
  },
];

export function ShopPage({ products, status = "" }: { products: Product[]; status?: string }) {
  const featured = products.slice(0, 4);
  const bestsellers = products.slice(3, 7);
  const perkLabels = [t("shop.perkCourier"), t("shop.perkCheckout"), t("shop.perkHelp")];

  return (
    <div className="bg-[#f6f7f2] text-slate-950">
      <section className="border-b border-emerald-900/10 bg-white">
        <div className="mx-auto grid max-w-[1680px] gap-6 px-6 py-6 lg:grid-cols-[1fr_420px] 2xl:px-8">
          <div className="overflow-hidden rounded-lg border border-emerald-900/10 bg-slate-950 text-white">
            <div className="relative grid min-h-[520px] content-end p-6 md:p-10 xl:min-h-[590px]">
              <Image
                alt=""
                className="object-cover"
                fetchPriority="high"
                fill
                priority
                quality={72}
                sizes="(max-width: 1024px) 100vw, 58vw"
                src="/products/garden-hero-real.jpg"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-slate-950/86 via-slate-950/45 to-slate-950/20" />
              <div className="relative">
                <p className="mb-3 inline-flex w-fit items-center gap-2 rounded-lg bg-emerald-400/15 px-3 py-2 text-sm font-black uppercase text-emerald-100">
                  <Leaf className="h-4 w-4" />
                  {t("header.shopBrand")}
                </p>
                <h1 className="max-w-3xl text-4xl font-black tracking-tight md:text-6xl">{t("shop.heroTitle")}</h1>
                <p className="mt-4 max-w-2xl text-base leading-7 text-emerald-50">{t("shop.heroText")}</p>
                <div className="mt-6 flex flex-wrap gap-3">
                  <Link className="inline-flex h-11 items-center gap-2 rounded-lg bg-emerald-500 px-4 text-sm font-black text-white" href="/szukaj">
                    {t("shop.goToCatalog")}
                    <ChevronRight className="h-4 w-4" />
                  </Link>
                  <Link className="inline-flex h-11 items-center gap-2 rounded-lg border border-white/20 px-4 text-sm font-black text-white" href="/szukaj?category=balkon-i-taras">
                    {t("shop.balconySeason")}
                    <Sprout className="h-4 w-4" />
                  </Link>
                </div>
                <div className="mt-7 grid gap-2 text-sm font-bold text-emerald-50 sm:grid-cols-3">
                  {perkLabels.map((item) => (
                    <span className="inline-flex items-center gap-2" key={item}>
                      <Check className="h-4 w-4 text-emerald-300" />
                      {item}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <aside className="grid gap-4">
            <Link className="grid min-h-40 content-end overflow-hidden rounded-lg border border-emerald-900/10 bg-slate-900 p-5 text-white shadow-sm" href="/szukaj?category=ziola">
              <Sparkles className="mb-4 h-6 w-6 text-emerald-300" />
              <p className="text-sm font-black uppercase text-emerald-100">{t("shop.hitOfWeek")}</p>
              <h2 className="mt-1 text-2xl font-black">{t("shop.herbsPromo")}</h2>
              <p className="mt-2 text-sm leading-6 text-emerald-50">{t("shop.herbsPromoText")}</p>
            </Link>
            <Link className="grid min-h-40 content-end overflow-hidden rounded-lg border border-emerald-900/10 bg-white p-5 shadow-sm" href="/szukaj">
              <Search className="mb-4 h-6 w-6 text-emerald-700" />
              <p className="text-sm font-black uppercase text-emerald-700">{t("shop.separateTab")}</p>
              <h2 className="mt-1 text-2xl font-black">{t("shop.searchCatalog")}</h2>
              <p className="mt-2 text-sm leading-6 text-slate-600">{t("shop.searchCatalogText")}</p>
            </Link>
          </aside>
        </div>
      </section>

      <section className="border-b border-emerald-900/10 bg-[#edf5e9]">
        <div className="mx-auto grid max-w-[1680px] gap-4 px-6 py-5 md:grid-cols-3 2xl:px-8">
          {sellingPoints.map((point) => (
            <div className="flex items-start gap-3 rounded-lg bg-white p-4 shadow-sm" key={point.titleKey}>
              <point.icon className="mt-1 h-5 w-5 text-emerald-700" />
              <div>
                <p className="font-black">{t(point.titleKey)}</p>
                <p className="mt-1 text-sm leading-5 text-slate-600">{t(point.textKey)}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="mx-auto max-w-[1680px] px-6 py-8 2xl:px-8">
        <div className="mb-4 flex items-end justify-between gap-4">
          <div>
            <p className="text-sm font-black uppercase text-emerald-700">{t("shop.categories")}</p>
            <h2 className="mt-1 text-2xl font-black tracking-tight">{t("shop.popularDepartments")}</h2>
          </div>
          <Link className="hidden text-sm font-black text-emerald-800 sm:inline" href="/szukaj">
            {t("header.allProducts")}
          </Link>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {departmentHighlights.map((department) => (
            <Link
              className="group overflow-hidden rounded-lg border border-emerald-900/10 bg-white text-left shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
              href={`/szukaj?category=${department.query}`}
              key={department.label}
            >
              <div className="relative h-32 2xl:h-36">
                <Image
                  alt=""
                  className="object-cover"
                  fill
                  loading="lazy"
                  quality={62}
                  sizes="(max-width: 640px) 50vw, 20vw"
                  src={department.image}
                />
              </div>
              <span className="flex min-h-14 items-center justify-between gap-2 px-4 py-3 text-sm font-black">
                {department.label}
                <ChevronRight className="h-4 w-4 text-emerald-700 transition group-hover:translate-x-0.5" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mx-auto grid max-w-[1680px] gap-5 px-6 py-4 lg:grid-cols-2 2xl:px-8">
        {promoTiles.map((tile) => (
          <Link className="group relative grid min-h-80 content-end overflow-hidden rounded-lg border border-emerald-900/10 bg-slate-950 p-6 text-white shadow-sm xl:min-h-96" href={tile.href} key={tile.titleKey}>
            <Image
              alt=""
              className="object-cover opacity-80 transition duration-300 group-hover:scale-[1.03]"
              fill
              loading="lazy"
              quality={65}
              sizes="(max-width: 1024px) 100vw, 50vw"
              src={tile.image}
            />
            <div className="absolute inset-0 bg-gradient-to-r from-slate-950/85 via-slate-950/45 to-transparent" />
            <div className="relative">
              <p className="text-sm font-black uppercase text-emerald-200">{t("shop.seasonalOffer")}</p>
              <h2 className="mt-1 text-3xl font-black">{t(tile.titleKey)}</h2>
              <p className="mt-2 max-w-md text-sm leading-6 text-emerald-50">{t(tile.textKey)}</p>
              <span className="mt-5 inline-flex w-fit items-center gap-2 rounded-lg bg-white px-4 py-3 text-sm font-black text-slate-950">
                {t("shop.seeProducts")}
                <ChevronRight className="h-4 w-4 transition group-hover:translate-x-0.5" />
              </span>
            </div>
          </Link>
        ))}
      </section>

      {featured.length ? (
        <section className="mx-auto max-w-[1680px] px-6 py-8 2xl:px-8">
          <div className="mb-5 flex items-end justify-between gap-4">
            <div>
              <p className="text-sm font-black uppercase text-emerald-700">{t("shop.featured")}</p>
              <h2 className="mt-1 text-2xl font-black tracking-tight">{t("shop.seasonStart")}</h2>
            </div>
            <Link className="text-sm font-black text-emerald-800" href="/szukaj">
              {t("shop.fullCatalog")}
            </Link>
          </div>
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
            {featured.map((product) => (
              <Link className="group overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-sm transition hover:-translate-y-0.5 hover:shadow-md" href={`/produkt/${product.slug}`} key={product.variantId}>
                <div className={`relative bg-slate-50 ${product.category === "ebooki" ? "mx-auto aspect-[210/297] w-full max-w-[240px]" : "h-52 2xl:h-60"}`}>
                  <Image
                    alt=""
                    className="object-contain p-3"
                    fill
                    loading="lazy"
                    quality={62}
                    sizes="(max-width: 768px) 50vw, 25vw"
                    src={productImage(product)}
                  />
                </div>
                <div className="p-4">
                  <p className="text-xs font-black uppercase text-emerald-700">{product.categoryLabel}</p>
                  <h3 className="mt-1 min-h-12 font-black group-hover:text-emerald-800">{product.name}</h3>
                  <p className="mt-2 text-xl font-black text-emerald-800">{money(product.price)}</p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="mx-auto grid max-w-[1680px] gap-6 px-6 pb-12 pt-4 lg:grid-cols-[1fr_420px] 2xl:px-8">
        <div className="rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm">
          <p className="flex items-center gap-2 text-sm font-black uppercase text-emerald-700">
            <Star className="h-4 w-4" />
            {t("shop.bestsellers")}
          </p>
          <div className="mt-5 grid gap-3">
            {bestsellers.map((product) => (
              <Link className="grid grid-cols-[76px_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 p-2 transition hover:bg-slate-50" href={`/produkt/${product.slug}`} key={product.variantId}>
                <div className="relative h-16 w-20 overflow-hidden rounded-lg bg-slate-50">
                  <Image
                    alt=""
                    className="object-contain p-1"
                    fill
                    loading="lazy"
                    quality={58}
                    sizes="80px"
                    src={productImage(product)}
                  />
                </div>
                <div>
                  <p className="font-black">{product.name}</p>
                  <p className="mt-1 text-xs font-bold uppercase text-emerald-700">{product.categoryLabel}</p>
                </div>
                <strong className="text-emerald-800">{money(product.price)}</strong>
              </Link>
            ))}
            {status ? <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm font-semibold text-amber-900">{status}</p> : null}
          </div>
        </div>

        <aside className="rounded-lg border border-emerald-900/10 bg-emerald-800 p-6 text-white shadow-sm">
          <PackageCheck className="h-8 w-8 text-emerald-200" />
          <h2 className="mt-4 text-2xl font-black">{t("shop.deliveryTitle")}</h2>
          <p className="mt-2 text-sm leading-6 text-emerald-50">{t("shop.deliveryText")}</p>
          <Link className="mt-5 inline-flex h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-black text-emerald-900" href="/szukaj">
            {t("shop.buyNow")}
            <ShoppingBag className="h-4 w-4" />
          </Link>
        </aside>
      </section>
    </div>
  );
}
