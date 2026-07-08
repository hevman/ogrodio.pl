"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { LockKeyhole, Mail, Sprout } from "lucide-react";
import { t } from "@/i18n";
import { staffLogin } from "@/lib/panel-api";

function PanelLoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("");
    try {
      await staffLogin(email, password);
      const next = searchParams.get("next") || "/panel";
      router.replace(next.startsWith("/panel") ? next : "/panel");
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("common.loginFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <form className="mt-8 grid gap-4" onSubmit={submit}>
      <label className="grid gap-2 text-sm font-bold">
        {t("auth.email")}
        <span className="relative">
          <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-3 outline-none focus:border-emerald-500"
            onChange={(event) => setEmail(event.target.value)}
            required
            type="email"
            value={email}
          />
        </span>
      </label>
      <label className="grid gap-2 text-sm font-bold">
        {t("auth.password")}
        <span className="relative">
          <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
          <input
            className="h-11 w-full rounded-lg border border-slate-700 bg-slate-950 pl-10 pr-3 outline-none focus:border-emerald-500"
            onChange={(event) => setPassword(event.target.value)}
            required
            type="password"
            value={password}
          />
        </span>
      </label>
      {status ? <p className="rounded-lg bg-red-950/60 px-4 py-3 text-sm font-bold text-red-200">{status}</p> : null}
      <button
        className="h-11 rounded-lg bg-emerald-600 font-black text-white disabled:opacity-60"
        disabled={isSubmitting}
        type="submit"
      >
        {t("auth.loginButton")}
      </button>
    </form>
  );
}

export default function PanelLoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-10 text-white">
      <section className="w-full max-w-md rounded-lg border border-white/10 bg-slate-900 p-8 shadow-xl">
        <p className="inline-flex items-center gap-2 text-sm font-black uppercase text-emerald-300">
          <Sprout className="h-4 w-4" />
          {t("panel.brand")}
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight">{t("panel.loginTitle")}</h1>
        <p className="mt-2 text-sm leading-6 text-slate-400">{t("panel.loginSubtitle")}</p>
        <Suspense fallback={<p className="mt-8 text-sm text-slate-400">{t("panel.loadingForm")}</p>}>
          <PanelLoginForm />
        </Suspense>
      </section>
    </main>
  );
}
