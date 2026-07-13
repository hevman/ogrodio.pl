"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import { LockKeyhole, Mail, Phone, UserRound } from "lucide-react";
import { t } from "@/i18n";
import { register } from "@/lib/auth-api";
import { appPath } from "@/lib/app-url";
import { site } from "@/lib/site-config";

function registerTarget() {
  const value = new URLSearchParams(window.location.search).get("next") || "/app";
  return value.startsWith("/") && !value.startsWith("//") ? appPath(value) : appPath("/app");
}

export default function RegisterPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [status, setStatus] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setStatus("");

    try {
      await register({ email, name, password, phone });
      window.location.assign(registerTarget());
    } catch (error) {
      setStatus(error instanceof Error ? error.message : t("auth.registerFailed"));
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="bg-[#f6f7f2] px-5 py-12 text-slate-950">
      <section className="mx-auto grid max-w-5xl overflow-hidden rounded-lg border border-emerald-900/10 bg-white shadow-sm lg:grid-cols-[0.9fr_1.1fr]">
        <div className="bg-slate-950 p-8 text-white md:p-10">
          <p className="text-sm font-black uppercase text-emerald-300">{t("site.name")}</p>
          <h1 className="mt-4 text-4xl font-black tracking-tight">{t("auth.registerHeading")}</h1>
          <p className="mt-4 text-sm leading-6 text-slate-300">{t("auth.afterRegister")}</p>
        </div>

        <form className="grid content-start gap-4 p-6 md:p-10" onSubmit={submit}>
          <div className="grid grid-cols-2 rounded-lg bg-slate-100 p-1 text-sm font-black">
            <Link className="rounded-md px-4 py-2 text-center text-slate-600 hover:text-emerald-800" href={appPath("/login")}>
              {t("auth.loginTitle")}
            </Link>
            <span className="rounded-md bg-white px-4 py-2 text-center text-emerald-800 shadow-sm">
              {t("auth.registerTitle")}
            </span>
          </div>

          <label className="grid gap-2 text-sm font-bold">
            {t("auth.name")}
            <span className="relative">
              <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 outline-none focus:border-emerald-600" onChange={(event) => setName(event.target.value)} value={name} />
            </span>
          </label>

          <label className="grid gap-2 text-sm font-bold">
            {t("auth.phone")}
            <span className="relative">
              <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 outline-none focus:border-emerald-600" onChange={(event) => setPhone(event.target.value)} value={phone} />
            </span>
          </label>

          <label className="grid gap-2 text-sm font-bold">
            {t("auth.email")}
            <span className="relative">
              <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 outline-none focus:border-emerald-600" onChange={(event) => setEmail(event.target.value)} type="email" value={email} />
            </span>
          </label>

          <label className="grid gap-2 text-sm font-bold">
            {t("auth.password")}
            <span className="relative">
              <LockKeyhole className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input className="h-11 w-full rounded-lg border border-slate-200 pl-10 pr-3 outline-none focus:border-emerald-600" onChange={(event) => setPassword(event.target.value)} type="password" value={password} />
            </span>
          </label>

          <label className="flex items-start gap-3 text-sm font-semibold leading-6 text-slate-700">
            <input
              checked={acceptedTerms}
              className="mt-1"
              onChange={(event) => setAcceptedTerms(event.target.checked)}
              required
              type="checkbox"
            />
            <span>
              Akceptuję{" "}
              <a className="font-black text-emerald-800 underline" href={`${site.shopUrl}/regulamin`} target="_blank">
                regulamin usług Ogrodio
              </a>{" "}
              i zapoznałem się z{" "}
              <a className="font-black text-emerald-800 underline" href={`${site.shopUrl}/polityka-prywatnosci`} target="_blank">
                polityką prywatności
              </a>.
            </span>
          </label>

          {status ? <p className="rounded-lg bg-red-50 px-4 py-3 text-sm font-bold text-red-800">{status}</p> : null}

          <button className="h-12 rounded-lg bg-emerald-700 px-5 font-black text-white disabled:opacity-50" disabled={isSubmitting || !acceptedTerms} type="submit">
            {t("common.register")}
          </button>
        </form>
      </section>
    </main>
  );
}
