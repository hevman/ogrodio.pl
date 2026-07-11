import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2, Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Potwierdzenie zamówienia | Ogrodio",
  description: "Strona potwierdzenia zamówienia w sklepie Ogrodio.",
};

export default function CheckoutConfirmationPage() {
  return (
    <main className="bg-[#f6f7f2] px-6 py-12 text-slate-950">
      <section className="mx-auto max-w-3xl rounded-lg border border-emerald-900/10 bg-white p-8 text-center shadow-sm">
        <CheckCircle2 className="mx-auto h-12 w-12 text-emerald-700" />
        <p className="mt-4 text-sm font-black uppercase text-emerald-700">Zamówienie</p>
        <h1 className="mt-2 text-4xl font-black">Dziękujemy za zamówienie</h1>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          Wyślemy wiadomość z dalszymi informacjami na adres e-mail podany w zamówieniu. E-book PDF i EPUB dostarczymy po potwierdzeniu płatności.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Link className="inline-flex h-11 items-center rounded-lg bg-emerald-700 px-4 text-sm font-black text-white" href="/">
            Wróć do sklepu
          </Link>
          <a className="inline-flex h-11 items-center gap-2 rounded-lg border border-emerald-900/15 px-4 text-sm font-black text-emerald-900" href="mailto:kontakt@ogrodio.pl">
            <Mail className="h-4 w-4" />
            kontakt@ogrodio.pl
          </a>
        </div>
      </section>
    </main>
  );
}
