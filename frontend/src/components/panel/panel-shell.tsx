"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { BookOpen, LayoutDashboard, LogOut, Package } from "lucide-react";
import { useEffect, useState } from "react";
import { LogoMark } from "@/components/brand/logo-mark";
import { t } from "@/i18n";
import { staffLogout, staffMe, type StaffUser } from "@/lib/panel-api";

const nav = [
  { href: "/panel", labelKey: "panel.dashboard" as const, icon: LayoutDashboard },
  { href: "/panel/articles", labelKey: "panel.articles" as const, icon: BookOpen },
  { href: "/panel/products", labelKey: "panel.products" as const, icon: Package },
] as const;

function navClass(active: boolean) {
  return active
    ? "bg-emerald-700 text-white"
    : "text-slate-600 hover:bg-emerald-50 hover:text-emerald-900";
}

export function PanelShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [user, setUser] = useState<StaffUser | null>(null);
  const [status, setStatus] = useState(t("panel.loading"));

  useEffect(() => {
    staffMe()
      .then((data) => {
        setUser(data.user);
        setStatus("");
      })
      .catch(() => {
        router.replace(`/panel/login?next=${encodeURIComponent(pathname)}`);
      });
  }, [pathname, router]);

  async function logout() {
    try {
      await staffLogout();
    } finally {
      router.replace("/panel/login");
    }
  }

  if (status) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-100 text-sm font-bold text-slate-600">
        {status}
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 text-slate-950">
      <div className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4">
          <Link className="flex items-center gap-2 font-black" href="/panel">
            <LogoMark size={32} />
            {t("panel.brand")}
          </Link>
          <div className="flex items-center gap-3 text-sm">
            <span className="hidden font-semibold text-slate-600 sm:inline">{user?.name}</span>
            <button
              className="inline-flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-1.5 font-bold text-slate-700"
              onClick={logout}
              type="button"
            >
              <LogOut className="h-4 w-4" />
              {t("common.logout")}
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto grid max-w-6xl gap-6 px-4 py-6 lg:grid-cols-[220px_1fr]">
        <nav className="grid h-fit gap-1 rounded-lg border border-slate-200 bg-white p-2">
          {nav.map((item) => {
            const active = pathname === item.href || (item.href !== "/panel" && pathname.startsWith(item.href));
            const Icon = item.icon;
            return (
              <Link className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-bold ${navClass(active)}`} href={item.href} key={item.href}>
                <Icon className="h-4 w-4" />
                {t(item.labelKey)}
              </Link>
            );
          })}
        </nav>
        <div>{children}</div>
      </div>
    </div>
  );
}
