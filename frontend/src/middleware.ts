import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SHOP_ROUTE_PREFIXES = [
  "/sklep",
  "/produkt",
  "/szukaj",
  "/checkout",
  "/dostawa",
  "/zwroty",
  "/reklamacje",
  "/status-zamowienia",
];

const MAIN_SITE_ROUTE_PREFIXES = [
  "/porady",
  "/katalog-roslin",
  "/ogrodio-plant-intelligence",
  "/o-nas",
  "/kontakt",
  "/polityka-redakcyjna",
  "/faq",
];

function isHost(host: string, subdomain: string) {
  return host === `${subdomain}.ogrodio.localhost` || host === `${subdomain}.ogrodio.pl`;
}

function isMainSiteHost(host: string) {
  return (
    host === "ogrodio.pl" ||
    host === "www.ogrodio.pl" ||
    host === "ogrodio.localhost" ||
    host === "www.ogrodio.localhost"
  );
}

function getShopBaseUrl() {
  return (process.env.NEXT_PUBLIC_SHOP_URL || "https://sklep.ogrodio.pl").replace(/\/$/, "");
}

function getSiteBaseUrl() {
  return (process.env.NEXT_PUBLIC_SITE_URL || "https://ogrodio.pl").replace(/\/$/, "");
}

function isShopRoute(pathname: string) {
  return SHOP_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function isMainSiteRoute(pathname: string) {
  return MAIN_SITE_ROUTE_PREFIXES.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  );
}

function shopRedirectUrl(pathname: string) {
  const shopBase = getShopBaseUrl();
  if (pathname === "/sklep" || pathname === "/sklep/") {
    return `${shopBase}/`;
  }
  if (pathname.startsWith("/sklep/")) {
    return `${shopBase}${pathname.slice("/sklep".length)}`;
  }
  return `${shopBase}${pathname}`;
}

export function middleware(request: NextRequest) {
  const host = request.headers.get("host")?.split(":")[0] || "";
  const isShopHost = isHost(host, "sklep");
  const isAppHost = isHost(host, "app");
  const isPanelHost = isHost(host, "panel");
  const pathname = request.nextUrl.pathname;
  const hasGardenSession = request.cookies.has("garden_access");
  const hasPanelSession = request.cookies.has("panel_access");
  const authRoutes = pathname === "/login" || pathname === "/register";
  const panelAuthRoutes = pathname === "/login" || pathname === "/panel/login";
  const appRoutes = ["/app", "/calendar", "/plants", "/tasks", "/journal", "/notifications", "/ustawienia", "/settings"];
  const isProtectedAppRoute = appRoutes.some((route) => pathname === route || pathname.startsWith(`${route}/`));
  const isProtectedPanelRoute =
    pathname === "/panel" ||
    (pathname.startsWith("/panel/") && !pathname.startsWith("/panel/login"));

  if (isMainSiteHost(host) && isShopRoute(pathname)) {
    return NextResponse.redirect(shopRedirectUrl(pathname), 301);
  }

  if (isShopHost && (pathname === "/sklep" || pathname.startsWith("/sklep/"))) {
    const url = request.nextUrl.clone();
    url.pathname = pathname === "/sklep" ? "/" : pathname.slice("/sklep".length) || "/";
    return NextResponse.redirect(url, 301);
  }

  if ((isShopHost || isAppHost || isPanelHost) && isMainSiteRoute(pathname)) {
    return NextResponse.redirect(`${getSiteBaseUrl()}${pathname}${request.nextUrl.search}`, 301);
  }

  if (isShopHost && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/sklep";
    return NextResponse.rewrite(url);
  }

  if (isPanelHost && pathname === "/login") {
    const url = request.nextUrl.clone();
    url.pathname = "/panel/login";
    return NextResponse.rewrite(url);
  }

  if (isPanelHost && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = hasPanelSession ? "/panel" : "/panel/login";
    return NextResponse.rewrite(url);
  }

  if (isPanelHost && panelAuthRoutes && hasPanelSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/panel";
    return NextResponse.redirect(url);
  }

  if (isPanelHost && isProtectedPanelRoute && !hasPanelSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/panel/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  if (isAppHost && pathname === "/" && !hasGardenSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    return NextResponse.redirect(url);
  }

  if (isAppHost && pathname === "/") {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    return NextResponse.rewrite(url);
  }

  if (isAppHost && authRoutes && hasGardenSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/app";
    return NextResponse.redirect(url);
  }

  if (isAppHost && isProtectedAppRoute && !hasGardenSession) {
    const url = request.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/",
    "/sklep",
    "/sklep/:path*",
    "/porady",
    "/porady/:path*",
    "/katalog-roslin",
    "/ogrodio-plant-intelligence",
    "/katalog-roslin/:path*",
    "/o-nas",
    "/kontakt",
    "/polityka-redakcyjna",
    "/faq",
    "/produkt/:path*",
    "/szukaj",
    "/checkout",
    "/dostawa",
    "/zwroty",
    "/reklamacje",
    "/status-zamowienia",
    "/login",
    "/register",
    "/panel",
    "/panel/:path*",
    "/app/:path*",
    "/calendar/:path*",
    "/plants/:path*",
    "/tasks/:path*",
    "/journal/:path*",
    "/notifications/:path*",
    "/ustawienia/:path*",
    "/settings/:path*",
  ],
};
