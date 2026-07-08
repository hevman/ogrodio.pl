"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { Bell, Check, ChevronDown, Grid3X3, LogOut, Menu, Minus, Plus, Search, Settings, ShoppingBag, Sprout, Trash2, Truck, UserRound, X } from "lucide-react";
import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { logout, me, type ShopUser } from "@/lib/auth-api";
import { siteContainer, siteGutter } from "@/lib/layout";
import { fetchProducts, searchProducts } from "@/lib/shop-api";
import type { CartItem, Product } from "@/lib/shop-api";
import { fetchGardenNotifications, type GardenNotification } from "@/lib/garden-api";
import { LogoMark } from "@/components/brand/logo-mark";
import { appPath } from "@/lib/app-url";
import { sitePath } from "@/lib/site-url";
import { formatMoney, t } from "@/i18n";
import { shopDepartments } from "@/components/shop/shop-shared";
import { navLinks, site } from "@/lib/site-config";

function isActive(pathname: string, href: string) {
  if (href === "/#faq") return pathname === "/";
  if (href === "/") return pathname === "/";
  const path = href.split("#")[0];
  if (!path || path === "/") return pathname === "/";
  return pathname === path || pathname.startsWith(`${path}/`);
}

function navClassName(active: boolean) {
  return active
    ? "font-semibold text-teal-700"
    : "text-slate-600 transition hover:text-slate-900";
}

function initials(name: string) {
  return name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("") || "U";
}

export function SiteHeader({ initialIsShopHost = false }: { initialIsShopHost?: boolean }) {
  const pathname = usePathname();
  const router = useRouter();
  const [isShopHost, setIsShopHost] = useState(initialIsShopHost);
  const [cartCount, setCartCount] = useState(0);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [cartStatus, setCartStatus] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  const [suggestions, setSuggestions] = useState<Product[]>([]);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [user, setUser] = useState<ShopUser | null>(null);
  const [isAuthMenuOpen, setIsAuthMenuOpen] = useState(false);
  const [notifications, setNotifications] = useState<GardenNotification[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cart = JSON.parse(window.localStorage.getItem("garden-vendure-cart") || "[]");
        const count = Array.isArray(cart)
          ? cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)
          : 0;
        setCartCount(count);
        setCart(Array.isArray(cart) ? cart : []);
      } catch {
        setCartCount(0);
        setCart([]);
      }
    };

    setIsShopHost(
      window.location.hostname === "sklep.ogrodio.localhost" ||
        window.location.hostname === "sklep.ogrodio.pl" ||
        pathname.startsWith("/sklep") ||
        pathname.startsWith("/produkt") ||
        pathname.startsWith("/szukaj") ||
        pathname.startsWith("/checkout") ||
        pathname.startsWith("/dostawa") ||
        pathname.startsWith("/zwroty"),
    );
    updateCartCount();
    window.addEventListener("storage", updateCartCount);
    window.addEventListener("garden-cart-updated", updateCartCount);
    return () => {
      window.removeEventListener("storage", updateCartCount);
      window.removeEventListener("garden-cart-updated", updateCartCount);
    };
  }, [pathname]);

  useEffect(() => {
    me()
      .then((data) => {
        setUser(data.user);
        fetchGardenNotifications()
          .then((notificationData) => {
            setNotifications(notificationData.items);
            setUnreadCount(notificationData.unreadCount);
          })
          .catch(() => undefined);
      })
      .catch(() => setUser(null));
  }, []);

  useEffect(() => {
    if (!isShopHost) return;
    fetchProducts()
      .then((items) => {
        setProducts(items);
        setSuggestions(items.slice(0, 5));
      })
      .catch((error) => setCartStatus(error instanceof Error ? error.message : t("common.cartFetchFailed")));
  }, [isShopHost]);

  useEffect(() => {
    if (!isShopHost) return;
    const value = searchQuery.trim();
    if (value.length < 2) {
      setSuggestions(products.slice(0, 5));
      return;
    }

    const timeout = window.setTimeout(() => {
      searchProducts(value, "all")
        .then((items) => setSuggestions(items.slice(0, 6)))
        .catch(() => setSuggestions([]));
    }, 140);
    return () => window.clearTimeout(timeout);
  }, [isShopHost, products, searchQuery]);

  const productByVariant = new Map(products.map((product) => [product.variantId, product]));
  const cartTotal = cart.reduce((sum, item) => {
    const product = productByVariant.get(item.productVariantId);
    return sum + (product ? product.price * item.quantity : 0);
  }, 0);
  const freeShippingThreshold = 99;
  const freeShippingMissing = Math.max(0, freeShippingThreshold - cartTotal);
  const cartRecommendations = products
    .filter((product) => !cart.some((item) => item.productVariantId === product.variantId))
    .slice(0, 2);

  function persistCart(next: CartItem[]) {
    setCart(next);
    setCartCount(next.reduce((sum, item) => sum + item.quantity, 0));
    window.localStorage.setItem("garden-vendure-cart", JSON.stringify(next));
    window.dispatchEvent(new Event("garden-cart-updated"));
  }

  function changeCartQuantity(productVariantId: string, delta: number) {
    persistCart(
      cart
        .map((item) =>
          item.productVariantId === productVariantId
            ? { ...item, quantity: Math.max(0, item.quantity + delta) }
            : item,
        )
        .filter((item) => item.quantity > 0),
    );
  }

  function submitSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = searchQuery.trim();
    setIsSearchOpen(false);
    router.push(value ? `/szukaj?q=${encodeURIComponent(value)}` : "/szukaj");
  }

  async function signOut() {
    await logout();
    setUser(null);
    setIsAuthMenuOpen(false);
    setIsNotificationsOpen(false);
    window.location.href = appPath("/login");
  }

  const notificationButton = user ? (
    <div className="relative">
      <button
        aria-label={t("common.notifications")}
        className="relative grid h-10 w-10 place-items-center rounded-lg border border-slate-200 bg-white text-slate-700 transition hover:bg-slate-50"
        onClick={() => {
          setIsNotificationsOpen((value) => !value);
          setIsAuthMenuOpen(false);
        }}
        type="button"
      >
        <Bell className="h-5 w-5" />
        {unreadCount ? <span className="absolute -right-1 -top-1 grid h-5 min-w-5 place-items-center rounded-full bg-red-600 px-1 text-[10px] font-black text-white">{unreadCount}</span> : null}
      </button>
      {isNotificationsOpen ? (
        <div className="absolute right-0 mt-2 w-[min(360px,calc(100vw-2rem))] rounded-lg border border-slate-200 bg-white p-3 shadow-xl">
          <div className="mb-2 flex items-center justify-between gap-3">
            <p className="text-sm font-black text-slate-950">{t("common.notifications")}</p>
            <Link className="text-xs font-black text-emerald-700" href={appPath("/notifications")} onClick={() => setIsNotificationsOpen(false)}>{t("common.all")}</Link>
          </div>
          <div className="grid max-h-[360px] gap-2 overflow-y-auto">
            {notifications.length ? notifications.map((item) => (
              <Link className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-3 hover:border-emerald-200 hover:bg-emerald-50" href={appPath(item.href)} key={item.id} onClick={() => setIsNotificationsOpen(false)}>
                <span className="flex items-center justify-between gap-3">
                  <span className="block text-sm font-black text-slate-950">{item.title}</span>
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-black uppercase ${
                    item.priority === "high" ? "bg-red-100 text-red-800" : item.priority === "low" ? "bg-emerald-100 text-emerald-800" : "bg-amber-100 text-amber-900"
                  }`}>
                    {item.type}
                  </span>
                </span>
                <span className="mt-1 block text-xs font-bold text-slate-500">{item.description}</span>
              </Link>
            )) : (
              <p className="rounded-lg bg-slate-50 px-3 py-6 text-center text-sm font-bold text-slate-500">{t("common.noNotifications")}</p>
            )}
          </div>
        </div>
      ) : null}
    </div>
  ) : null;

  const authActions = user ? (
    <>
      {notificationButton}
      <div className="relative">
        <button
          className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 bg-white px-2.5 text-sm font-black text-slate-800 transition hover:bg-slate-50"
          onClick={() => {
            setIsAuthMenuOpen((value) => !value);
            setIsNotificationsOpen(false);
          }}
          type="button"
        >
          <span className="grid h-7 w-7 place-items-center rounded-md bg-emerald-100 text-xs text-emerald-800">
            {initials(user.name)}
          </span>
          <span className="hidden max-w-[160px] truncate md:inline">{user.name}</span>
          <ChevronDown className="h-4 w-4 text-slate-500" />
        </button>
        {isAuthMenuOpen ? (
          <div className="absolute right-0 mt-2 w-64 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-xl">
            <div className="border-b border-slate-100 px-4 py-3">
              <p className="truncate text-sm font-black">{user.name}</p>
              <p className="mt-1 truncate text-xs font-semibold text-slate-500">{user.email}</p>
            </div>
            <a className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50" href={appPath("/app")} onClick={() => setIsAuthMenuOpen(false)}>
              <Sprout className="h-4 w-4" />
              {t("common.app")}
            </a>
            <a className="flex items-center gap-2 px-4 py-3 text-sm font-bold text-slate-700 hover:bg-slate-50" href={appPath("/ustawienia")} onClick={() => setIsAuthMenuOpen(false)}>
              <Settings className="h-4 w-4" />
              {t("common.settings")}
            </a>
            <button className="flex w-full items-center gap-2 px-4 py-3 text-left text-sm font-bold text-red-700 hover:bg-red-50" onClick={signOut} type="button">
              <LogOut className="h-4 w-4" />
              {t("common.logout")}
            </button>
          </div>
        ) : null}
      </div>
    </>
  ) : (
    <>
      <Link
        aria-label={t("common.login")}
        className="inline-flex h-10 items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-black text-slate-700 transition hover:bg-slate-50"
        href={appPath("/login")}
      >
        <UserRound aria-hidden="true" className="h-4 w-4" />
        <span className="hidden sm:inline">{t("common.login")}</span>
      </Link>
      <Link
        aria-label={t("common.register")}
        className="inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-700 px-3 text-sm font-black text-white transition hover:bg-emerald-800"
        href={appPath("/register")}
      >
        <Sprout aria-hidden="true" className="h-4 w-4" />
        <span className="hidden sm:inline">{t("common.register")}</span>
      </Link>
    </>
  );

  if (isShopHost) {
    return (
      <header className="sticky top-0 z-40 border-b border-emerald-900/10 bg-white text-slate-950 shadow-sm">
        <div className="border-b border-slate-200 bg-slate-950 text-white">
          <div className="mx-auto flex h-9 max-w-[1680px] items-center justify-between gap-4 px-6 text-xs font-bold 2xl:px-8">
            <p className="hidden items-center gap-2 sm:flex">
              <Truck className="h-4 w-4 text-emerald-300" />
              {t("header.shippingBanner")}
            </p>
            <p className="sm:hidden">{t("header.shippingBannerShort")}</p>
            <div className="hidden items-center gap-4 md:flex">
              <span className="text-emerald-100">{t("header.shippingNote")}</span>
              <a className="transition hover:text-emerald-200" href={`mailto:${site.email}`}>
                {t("header.helpEmail", { email: site.email })}
              </a>
            </div>
          </div>
        </div>

        <div className="mx-auto grid max-w-[1680px] gap-3 px-6 py-3 lg:grid-cols-[260px_1fr_auto] lg:items-center 2xl:px-8">
          <div className="flex items-center justify-between gap-4">
            <Link className="flex items-center gap-2.5" href="/">
              <LogoMark size={36} />
              <span className="text-lg font-black tracking-tight">
                {t("site.name")} <span className="text-emerald-700">{t("site.nav.shop")}</span>
              </span>
            </Link>
            <details className="relative lg:hidden">
              <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 marker:content-none">
                <Menu className="h-4 w-4" />
                {t("common.menu")}
              </summary>
              <nav className="absolute right-0 top-12 z-50 grid min-w-[260px] gap-1 rounded-lg border border-slate-200 bg-white p-2 shadow-lg">
                <Link className="rounded-lg px-3 py-2 text-sm font-bold text-emerald-800 hover:bg-emerald-50" href="/szukaj">
                  {t("header.allProducts")}
                </Link>
                {shopDepartments.map((department) => (
                  <Link className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" href={department.href} key={department.label}>
                    {department.label}
                  </Link>
                ))}
                <a className="rounded-lg px-3 py-2 text-sm font-semibold text-slate-700 hover:bg-slate-50" href="/porady">
                  {t("header.blogAndAdvice")}
                </a>
              </nav>
            </details>
          </div>

          <form className="relative hidden lg:block" onSubmit={submitSearch}>
            <Search className="pointer-events-none absolute left-4 top-1/2 z-10 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input
              autoComplete="off"
              className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-24 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
              name="q"
              onBlur={() => window.setTimeout(() => setIsSearchOpen(false), 140)}
              onChange={(event) => {
                setSearchQuery(event.target.value);
                setIsSearchOpen(true);
              }}
              onFocus={() => setIsSearchOpen(true)}
              placeholder={t("header.searchPlaceholder")}
              type="search"
              value={searchQuery}
            />
            <button className="absolute right-1.5 top-1/2 h-8 -translate-y-1/2 rounded-md bg-emerald-700 px-3 text-xs font-black uppercase text-white" type="submit">
              {t("common.search")}
            </button>
            {isSearchOpen ? (
              <div className="absolute left-0 right-0 top-[52px] z-50 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl">
                <div className="border-b border-slate-100 px-4 py-3 text-xs font-black uppercase text-slate-500">
                  {searchQuery.trim().length >= 2 ? t("header.catalogSuggestions") : t("header.popularProducts")}
                </div>
                <div className="max-h-[420px] overflow-auto p-2">
                  {suggestions.length ? (
                    suggestions.map((product) => (
                      <Link
                        className="grid grid-cols-[54px_1fr_auto] items-center gap-3 rounded-lg p-2 transition hover:bg-emerald-50"
                        href={`/produkt/${product.slug}`}
                        key={product.variantId}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                      >
                        <img className="h-12 w-14 rounded-md object-cover" src={product.image || "/products/garden-products-real.jpg"} alt="" />
                        <span>
                          <span className="block text-sm font-black text-slate-900">{product.name}</span>
                          <span className="mt-0.5 block text-xs font-bold uppercase text-emerald-700">{product.categoryLabel}</span>
                        </span>
                        <strong className="text-sm text-emerald-800">{formatMoney(product.price)}</strong>
                      </Link>
                    ))
                  ) : (
                    <p className="px-3 py-4 text-sm font-semibold text-slate-500">{t("header.noSuggestions")}</p>
                  )}
                </div>
                <button className="flex w-full items-center justify-between border-t border-slate-100 px-4 py-3 text-left text-sm font-black text-emerald-800 hover:bg-emerald-50" type="submit">
                  {t("header.seeAllResults")}
                  <Search className="h-4 w-4" />
                </button>
              </div>
            ) : null}
          </form>

          <div className="flex items-center justify-end gap-2">
            {authActions}
            <button
              className="relative inline-flex h-10 items-center gap-2 rounded-lg bg-emerald-700 px-3 text-sm font-black text-white"
              onClick={() => setIsCartOpen(true)}
              type="button"
            >
              <ShoppingBag className="h-4 w-4" />
              <span>{t("header.cart")}</span>
              <span className="grid h-5 min-w-5 place-items-center rounded-full bg-white px-1 text-xs text-emerald-800">
                {cartCount}
              </span>
            </button>
          </div>
        </div>

        <form className="relative mx-auto w-full max-w-[1680px] px-6 pb-3 lg:hidden 2xl:px-8" onSubmit={submitSearch}>
          <Search className="pointer-events-none absolute left-10 top-[18px] z-10 h-4 w-4 text-slate-400 2xl:left-12" />
          <input
            autoComplete="off"
            className="h-11 w-full rounded-lg border border-slate-300 bg-white pl-11 pr-24 text-sm font-semibold text-slate-800 outline-none transition placeholder:text-slate-400 focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100"
            name="q"
            onBlur={() => window.setTimeout(() => setIsSearchOpen(false), 140)}
            onChange={(event) => {
              setSearchQuery(event.target.value);
              setIsSearchOpen(true);
            }}
            onFocus={() => setIsSearchOpen(true)}
            placeholder={t("header.searchPlaceholderShort")}
            type="search"
            value={searchQuery}
          />
          <button className="absolute right-7 top-[6px] h-8 rounded-md bg-emerald-700 px-3 text-xs font-black uppercase text-white 2xl:right-9" type="submit">
            {t("common.search")}
          </button>
          {isSearchOpen ? (
            <div className="absolute left-6 right-6 top-[52px] z-50 overflow-hidden rounded-lg border border-slate-200 bg-white shadow-2xl 2xl:left-8 2xl:right-8">
              <div className="border-b border-slate-100 px-4 py-3 text-xs font-black uppercase text-slate-500">
                {searchQuery.trim().length >= 2 ? t("header.catalogSuggestions") : t("header.popularProducts")}
              </div>
              <div className="max-h-[360px] overflow-auto p-2">
                {suggestions.length ? (
                  suggestions.map((product) => (
                    <Link
                      className="grid grid-cols-[54px_1fr_auto] items-center gap-3 rounded-lg p-2 transition hover:bg-emerald-50"
                      href={`/produkt/${product.slug}`}
                      key={product.variantId}
                      onClick={() => {
                        setIsSearchOpen(false);
                        setSearchQuery("");
                      }}
                    >
                      <img className="h-12 w-14 rounded-md object-cover" src={product.image || "/products/garden-products-real.jpg"} alt="" />
                      <span>
                        <span className="block text-sm font-black text-slate-900">{product.name}</span>
                        <span className="mt-0.5 block text-xs font-bold uppercase text-emerald-700">{product.categoryLabel}</span>
                      </span>
                      <strong className="text-sm text-emerald-800">{formatMoney(product.price)}</strong>
                    </Link>
                  ))
                ) : (
                  <p className="px-3 py-4 text-sm font-semibold text-slate-500">{t("header.noSuggestions")}</p>
                )}
              </div>
              <button className="flex w-full items-center justify-between border-t border-slate-100 px-4 py-3 text-left text-sm font-black text-emerald-800 hover:bg-emerald-50" type="submit">
                {t("header.seeAllResults")}
                <Search className="h-4 w-4" />
              </button>
            </div>
          ) : null}
        </form>

        <nav className="hidden border-t border-slate-200 bg-slate-50 lg:block">
          <div className="mx-auto flex h-11 max-w-[1680px] items-center gap-1 overflow-x-auto px-6 text-sm font-bold 2xl:px-8">
            <Link className="mr-2 inline-flex h-8 shrink-0 items-center gap-2 rounded-lg bg-emerald-700 px-3 text-white" href="/szukaj">
              <Grid3X3 className="h-4 w-4" />
              {t("header.categories")}
            </Link>
            {shopDepartments.map((department) => (
              <Link className="shrink-0 rounded-lg px-3 py-2 text-slate-700 transition hover:bg-white hover:text-emerald-800" href={department.href} key={department.label}>
                {department.label}
              </Link>
            ))}
            <a className="ml-auto shrink-0 rounded-lg px-3 py-2 text-slate-700 transition hover:bg-white hover:text-emerald-800" href="/porady">
              {t("header.gardenAdvice")}
            </a>
          </div>
        </nav>
        {isCartOpen ? (
          <div className="fixed inset-0 z-50">
            <button
              aria-label={t("common.closeCart")}
              className="absolute inset-0 bg-slate-950/45"
              onClick={() => setIsCartOpen(false)}
              type="button"
            />
            <aside className="absolute right-0 top-0 flex h-full w-full max-w-md flex-col bg-white shadow-2xl">
              <div className="flex items-center justify-between gap-4 border-b border-slate-200 px-5 py-4">
                <div>
                  <p className="text-sm font-black uppercase text-emerald-800">{t("header.cart")}</p>
                  <h2 className="mt-1 text-2xl font-black">{t("common.pieces", { count: cartCount })}</h2>
                </div>
                <button
                  aria-label={t("common.closeCart")}
                  className="grid h-10 w-10 place-items-center rounded-lg border border-slate-200 text-slate-700"
                  onClick={() => setIsCartOpen(false)}
                  type="button"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-auto px-5 py-4">
                {cart.length ? (
                  <div className="mb-4 rounded-lg border border-emerald-900/10 bg-emerald-50 p-4">
                    <p className="text-sm font-black text-emerald-950">
                      {freeShippingMissing > 0
                        ? t("header.freeShippingMissing", { amount: formatMoney(freeShippingMissing) })
                        : t("header.freeShippingReached")}
                    </p>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-white">
                      <div className="h-full rounded-full bg-emerald-700" style={{ width: `${Math.min(100, (cartTotal / freeShippingThreshold) * 100)}%` }} />
                    </div>
                    <p className="mt-2 text-xs font-bold text-slate-600">{t("header.plantsShippingNote")}</p>
                  </div>
                ) : null}
                {cart.length ? (
                  <div className="grid gap-3">
                    {cart.map((item) => {
                      const product = productByVariant.get(item.productVariantId);
                      if (!product) return null;
                      return (
                        <div className="grid grid-cols-[72px_1fr] gap-3 rounded-lg border border-slate-200 bg-white p-3" key={item.productVariantId}>
                          <img className="h-20 w-[72px] rounded-lg object-cover" src={product.image || "/products/garden-products-real.jpg"} alt="" />
                          <div className="grid gap-3">
                            <div className="flex items-start justify-between gap-3">
                              <Link className="font-black leading-5 hover:text-emerald-800" href={`/produkt/${product.slug}`} onClick={() => setIsCartOpen(false)}>
                                {product.name}
                              </Link>
                              <button
                                aria-label={t("common.removeProduct")}
                                className="grid h-8 w-8 place-items-center rounded-lg text-red-700 hover:bg-red-50"
                                onClick={() => persistCart(cart.filter((entry) => entry.productVariantId !== item.productVariantId))}
                                type="button"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                            <p className="text-xs font-bold text-slate-500">{product.deliveryTag || t("common.deliveryCourierPl")}</p>
                            <div className="flex items-center justify-between gap-3">
                              <div className="flex items-center gap-2">
                                <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200" onClick={() => changeCartQuantity(item.productVariantId, -1)} type="button">
                                  <Minus className="h-4 w-4" />
                                </button>
                                <span className="w-7 text-center font-black">{item.quantity}</span>
                                <button className="grid h-9 w-9 place-items-center rounded-lg border border-slate-200" onClick={() => changeCartQuantity(item.productVariantId, 1)} type="button">
                                  <Plus className="h-4 w-4" />
                                </button>
                              </div>
                              <strong>{formatMoney(product.price * item.quantity)}</strong>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="rounded-lg bg-slate-50 p-5 text-sm font-semibold text-slate-600">
                    {t("header.emptyCart")}
                  </div>
                )}
                {cartRecommendations.length ? (
                  <div className="mt-5">
                    <p className="mb-3 text-sm font-black uppercase text-slate-500">{t("header.addToOrder")}</p>
                    <div className="grid gap-2">
                      {cartRecommendations.map((product) => (
                        <button
                          className="grid grid-cols-[48px_1fr_auto] items-center gap-3 rounded-lg border border-slate-200 p-2 text-left hover:bg-slate-50"
                          key={product.variantId}
                          onClick={() => persistCart([...cart, { productVariantId: product.variantId, quantity: 1 }])}
                          type="button"
                        >
                          <img className="h-12 w-12 rounded-md object-cover" src={product.image || "/products/garden-products-real.jpg"} alt="" />
                          <span>
                            <span className="block text-sm font-black">{product.name}</span>
                            <span className="text-xs font-bold text-slate-500">{product.categoryLabel}</span>
                          </span>
                          <strong className="text-sm text-emerald-800">{formatMoney(product.price)}</strong>
                        </button>
                      ))}
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="border-t border-slate-200 p-5">
                <div className="mb-4 flex items-center justify-between text-xl font-black">
                  <span>{t("common.total")}</span>
                  <span>{formatMoney(cartTotal)}</span>
                </div>
                <Link
                  className={`flex h-12 w-full items-center justify-center gap-2 rounded-lg px-4 font-black text-white ${cart.length ? "bg-emerald-700" : "pointer-events-none bg-emerald-700 opacity-50"}`}
                  href="/checkout"
                  onClick={() => setIsCartOpen(false)}
                >
                  <Check className="h-4 w-4" />
                  {t("header.proceedToCheckout")}
                </Link>
                <Link className="mt-3 flex h-11 items-center justify-center gap-2 rounded-lg border border-slate-200 text-sm font-black text-slate-700" href={appPath("/login")} onClick={() => setIsCartOpen(false)}>
                  <UserRound className="h-4 w-4" />
                  {t("common.login")}
                </Link>
                {cartStatus ? <p className="mt-3 rounded-lg bg-emerald-50 px-3 py-2 text-sm font-bold text-emerald-900">{cartStatus}</p> : null}
              </div>
            </aside>
          </div>
        ) : null}
      </header>
    );
  }

  return (
    <header className={`sticky top-0 z-30 border-b border-slate-200 bg-white/90 text-slate-900 backdrop-blur ${siteGutter}`}>
      <div className={`flex h-16 items-center justify-between gap-4 ${siteContainer}`}>
        <a className="flex items-center gap-2.5" href={site.siteUrl}>
          <LogoMark size={36} />
          <span className="text-lg font-bold tracking-tight text-slate-900">
            {t("site.name")}
          </span>
        </a>

        <nav className="hidden items-center gap-6 text-sm font-medium lg:flex">
          {navLinks.map((link) => (
            link.href === "/" ? (
              <a
                key={link.href}
                className={navClassName(isActive(pathname, link.href))}
                href={site.siteUrl}
              >
                {link.label}
              </a>
            ) : link.href === "/porady" ? (
              <a
                key={link.href}
                className={navClassName(isActive(pathname, link.href))}
                href={sitePath("/porady")}
              >
                {link.label}
              </a>
            ) : link.href === "/app" ? (
              <a
                key={link.href}
                className="inline-flex items-center gap-1.5 font-semibold text-teal-700 transition hover:text-teal-800"
                href={site.appUrl}
              >
                {link.label}
                <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-teal-800">
                  {t("site.nav.appBeta")}
                </span>
              </a>
            ) : link.href === "/sklep" ? (
              <a
                key={link.href}
                className="font-semibold text-emerald-700 transition hover:text-emerald-800"
                href={site.shopUrl}
              >
                {link.label}
              </a>
            ) : null
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {authActions}

          <Link
            className="hidden h-10 items-center gap-2 rounded-xl border border-teal-200 px-4 text-sm font-semibold text-teal-700 transition hover:border-teal-300 hover:bg-teal-50 sm:inline-flex"
            href={sitePath("/porady")}
          >
            {t("footer.site.advice")}
          </Link>

          <details className="relative lg:hidden">
            <summary className="flex h-10 cursor-pointer list-none items-center gap-2 rounded-lg border border-slate-200 px-3 text-sm font-semibold text-slate-700 marker:content-none">
              <Menu className="h-4 w-4" />
              {t("common.menu")}
            </summary>
            <nav className="absolute right-0 top-12 z-40 grid min-w-[220px] gap-1 rounded-xl border border-slate-200 bg-white p-2 shadow-lg">
              {navLinks.map((link) => (
                link.href === "/" ? (
                  <a
                    key={link.href}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-50 ${
                      isActive(pathname, link.href) ? "bg-teal-50 text-teal-700" : "text-slate-700"
                    }`}
                    href={site.siteUrl}
                  >
                    {link.label}
                  </a>
                ) : link.href === "/porady" ? (
                  <a
                    key={link.href}
                    className={`rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-50 ${
                      isActive(pathname, link.href) ? "bg-teal-50 text-teal-700" : "text-slate-700"
                    }`}
                    href={sitePath("/porady")}
                  >
                    {link.label}
                  </a>
                ) : link.href === "/app" ? (
                  <a
                    key={link.href}
                    className="inline-flex items-center gap-1.5 rounded-lg px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                    href={site.appUrl}
                  >
                    {link.label}
                    <span className="rounded bg-teal-100 px-1.5 py-0.5 text-[10px] font-black uppercase text-teal-800">
                      {t("site.nav.appBeta")}
                    </span>
                  </a>
                ) : link.href === "/sklep" ? (
                  <a
                    key={link.href}
                    className="rounded-lg px-3 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-50"
                    href={site.shopUrl}
                  >
                    {link.label}
                  </a>
                ) : null
              ))}
              <Link
                className={`rounded-lg px-3 py-2 text-sm font-semibold hover:bg-slate-50 ${
                  isActive(pathname, "/login") ? "bg-teal-50 text-teal-700" : "text-slate-700"
                }`}
                href={appPath("/login")}
              >
                {t("common.login")}
              </Link>
              <Link
                className="rounded-lg px-3 py-2 text-sm font-semibold text-teal-700 hover:bg-teal-50"
                href={appPath("/register")}
              >
                {t("common.register")}
              </Link>
            </nav>
          </details>
        </div>
      </div>
    </header>
  );
}
