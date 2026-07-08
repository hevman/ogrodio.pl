"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { BookOpen, CalendarDays, Camera, Home, Leaf, LogOut, Settings, ShoppingBag, Users } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { LogoMark } from "@/components/brand/logo-mark";
import { AppProvider } from "@/components/app/app-context";
import { t } from "@/i18n";
import { logout, me, type ShopUser } from "@/lib/auth-api";
import { fetchGardenOrganization, type GardenOrganization } from "@/lib/garden-api";
import { appPath } from "@/lib/app-url";
import { isBusinessGarden } from "@/lib/garden-permissions";
import { site } from "@/lib/site-config";
import { sitePath } from "@/lib/site-url";

const primaryNav = [
  { href: "/app", labelKey: "app.nav.dashboard" as const, icon: Home },
  { href: "/plants", labelKey: "app.nav.plants" as const, icon: Leaf },
  { href: "/calendar", labelKey: "app.nav.plan" as const, icon: CalendarDays },
  { href: "/journal", labelKey: "app.nav.journal" as const, icon: Camera },
] as const;

const businessNav = [
  { href: "/tasks", labelKey: "app.nav.tasks" as const, icon: Users },
] as const;

function isActive(pathname: string, href: string) {
  if (href === "/app") return pathname === "/app";
  return pathname === href || pathname.startsWith(`${href}/`);
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [user, setUser] = useState<ShopUser | null>(null);
  const [organization, setOrganization] = useState<GardenOrganization | null>(null);
  const [authState, setAuthState] = useState<"checking" | "authenticated" | "guest">("checking");
  const [status, setStatus] = useState("");

  useEffect(() => {
    let isMounted = true;
    Promise.all([me(), fetchGardenOrganization().catch(() => null)])
      .then(([userData, organizationData]) => {
        if (!isMounted) return;
        setUser(userData.user);
        setOrganization(organizationData);
        setAuthState("authenticated");
        setStatus("");
      })
      .catch(async () => {
        await logout().catch(() => undefined);
        if (!isMounted) return;
        setUser(null);
        setOrganization(null);
        setAuthState("guest");
        setStatus(t("app.shell.sessionExpired"));
        window.location.assign(appPath("/login"));
      });
    return () => {
      isMounted = false;
    };
  }, []);

  const navItems = useMemo(() => {
    if (isBusinessGarden(organization)) return [...primaryNav, ...businessNav];
    return primaryNav;
  }, [organization]);

  async function handleLogout() {
    await logout().catch(() => undefined);
    window.location.assign(appPath("/login"));
  }

  if (authState === "checking") {
    return (
      <main className="min-h-screen bg-[#f4f6f2] px-5 py-10 text-slate-950">
        <section className="mx-auto max-w-xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
          <LogoMark size={40} />
          <p className="mt-4 text-sm font-black uppercase text-emerald-700">{t("app.shell.gardenApp")}</p>
          <h1 className="mt-3 text-2xl font-black tracking-tight">{t("app.shell.checkingSession")}</h1>
        </section>
      </main>
    );
  }

  if (!user) {
    return (
      <main className="min-h-screen bg-[#f4f6f2] px-5 py-10 text-slate-950">
        <section className="mx-auto max-w-xl rounded-2xl border border-amber-300 bg-amber-50 p-6 text-amber-950 shadow-sm">
          <h1 className="text-3xl font-black tracking-tight">{t("app.shell.loginPrompt")}</h1>
          <p className="mt-3 text-sm font-bold">{status}</p>
          <div className="mt-5 flex flex-wrap gap-3">
            <Link className="inline-flex h-11 items-center rounded-lg bg-emerald-700 px-4 text-sm font-black text-white" href={appPath("/login")}>
              {t("common.login")}
            </Link>
            <a className="inline-flex h-11 items-center rounded-lg border border-amber-300 bg-amber-100 px-4 text-sm font-black text-amber-950" href={sitePath("/")}>
              {t("app.shell.backToSite")}
            </a>
          </div>
        </section>
      </main>
    );
  }

  return (
    <AppProvider organization={organization} user={user}>
      <div className="min-h-screen bg-[#f4f6f2] text-slate-950 pb-20 lg:pb-0">
        <div className="lg:grid lg:grid-cols-[240px_1fr]">
          <aside className="hidden border-r border-slate-200/80 bg-white lg:flex lg:min-h-screen lg:flex-col lg:px-4 lg:py-5">
            <div className="flex items-center gap-3 px-2">
              <LogoMark href={appPath("/app")} size={36} />
              <div>
                <p className="text-sm font-black text-slate-950">{t("app.shell.productName")}</p>
                <p className="text-[11px] font-bold uppercase tracking-wide text-emerald-700">{t("app.shell.beta")}</p>
              </div>
            </div>
            <p className="mt-4 px-2 text-xs font-bold text-slate-500">{user.name}</p>

            <nav className="mt-6 grid gap-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const active = isActive(pathname, item.href);
                return (
                  <Link
                    className={`inline-flex h-11 items-center gap-3 rounded-xl px-3 text-sm font-black transition ${
                      active ? "bg-emerald-700 text-white shadow-sm" : "text-slate-700 hover:bg-emerald-50"
                    }`}
                    href={item.href}
                    key={item.href}
                  >
                    <Icon className="h-4 w-4" />
                    {t(item.labelKey)}
                  </Link>
                );
              })}
            </nav>

            <div className="mt-auto space-y-1 border-t border-slate-100 pt-4">
              <a className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-600 hover:bg-slate-50" href={sitePath("/porady")}>
                <BookOpen className="h-4 w-4" />
                {t("app.nav.advice")}
              </a>
              <a className="flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-600 hover:bg-slate-50" href={site.shopUrl}>
                <ShoppingBag className="h-4 w-4" />
                {t("app.nav.shop")}
              </a>
              <Link className={`flex h-10 items-center gap-3 rounded-xl px-3 text-sm font-bold ${isActive(pathname, "/ustawienia") ? "bg-emerald-50 text-emerald-800" : "text-slate-600 hover:bg-slate-50"}`} href="/ustawienia">
                <Settings className="h-4 w-4" />
                {t("app.nav.settings")}
              </Link>
              <button className="flex h-10 w-full items-center gap-3 rounded-xl px-3 text-sm font-bold text-slate-500 hover:bg-slate-50" onClick={handleLogout} type="button">
                <LogOut className="h-4 w-4" />
                {t("app.shell.logout")}
              </button>
            </div>
          </aside>

          <div className="min-w-0">
            <header className="sticky top-0 z-20 flex items-center justify-between border-b border-slate-200/80 bg-white/95 px-4 py-3 backdrop-blur lg:hidden">
              <div className="flex items-center gap-2">
                <LogoMark href={appPath("/app")} size={32} />
                <div>
                  <p className="text-sm font-black">{t("app.shell.productName")}</p>
                  <p className="text-[10px] font-bold uppercase text-emerald-700">{t("app.shell.beta")}</p>
                </div>
              </div>
              <Link className="grid h-10 w-10 place-items-center rounded-xl text-slate-600 hover:bg-slate-100" href="/ustawienia">
                <Settings className="h-5 w-5" />
              </Link>
            </header>

            <main className="px-4 py-5 sm:px-6 lg:px-8 lg:py-7">{children}</main>
          </div>
        </div>

        <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-200 bg-white/95 backdrop-blur lg:hidden">
          <div className={`grid ${navItems.length === 5 ? "grid-cols-5" : "grid-cols-4"} gap-1 px-2 py-2`}>
            {navItems.map((item) => {
              const Icon = item.icon;
              const active = isActive(pathname, item.href);
              return (
                <Link
                  className={`flex flex-col items-center gap-1 rounded-xl px-1 py-2 text-[10px] font-black ${
                    active ? "text-emerald-700" : "text-slate-500"
                  }`}
                  href={item.href}
                  key={item.href}
                >
                  <Icon className={`h-5 w-5 ${active ? "text-emerald-700" : "text-slate-400"}`} />
                  {t(item.labelKey)}
                </Link>
              );
            })}
          </div>
        </nav>
      </div>
    </AppProvider>
  );
}
