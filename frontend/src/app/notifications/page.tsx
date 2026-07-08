"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { AppShell } from "@/components/app/app-shell";

export default function NotificationsRedirectPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace("/app");
  }, [router]);

  return (
    <AppShell>
      <p className="text-sm font-bold text-slate-500">…</p>
    </AppShell>
  );
}
