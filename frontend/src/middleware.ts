import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

function isHost(host: string, subdomain: string) {
  return host === `${subdomain}.ogrodio.localhost` || host === `${subdomain}.ogrodio.pl`;
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
