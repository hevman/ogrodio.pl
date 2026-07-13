import type { Metadata } from "next";

const shopUrl = (process.env.NEXT_PUBLIC_SHOP_URL || "https://sklep.ogrodio.pl").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Dostawa i płatność | Ogrodio",
  description: "Dostawa e-booków, produktów fizycznych i dostępne płatności w sklepie Ogrodio.",
  alternates: { canonical: `${shopUrl}/dostawa` },
};

export default function DeliveryPage() {
  return (
    <main className="bg-[#f6f7f2] px-6 py-12 text-slate-950">
      <article className="mx-auto max-w-4xl rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm md:p-10">
        <p className="text-sm font-black uppercase text-emerald-700">Zakupy</p>
        <h1 className="mt-2 text-4xl font-black">Dostawa i płatność</h1>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          <section className="rounded-lg border border-emerald-900/10 p-6">
            <h2 className="text-xl font-black">E-booki</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Dostawa cyfrowa jest bezpłatna. Po zaksięgowaniu płatności pliki wysyłamy na adres e-mail podany w
              zamówieniu albo udostępniamy link do pobrania, nie później niż w ciągu 2 dni roboczych. Dokładne formaty są
              wskazane na stronie produktu.
            </p>
          </section>
          <section className="rounded-lg border border-emerald-900/10 p-6">
            <h2 className="text-xl font-black">Przelew tradycyjny</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Dane rachunku i numer zamówienia do wpisania w tytule otrzymasz w potwierdzeniu. Zamówienie realizujemy po
              zaksięgowaniu pełnej kwoty. Autopay, BLIK i szybkie przelewy nie są dostępne, dopóki nie pojawią się jako
              aktywna metoda w checkoutcie.
            </p>
          </section>
          <section className="rounded-lg border border-emerald-900/10 p-6 md:col-span-2">
            <h2 className="text-xl font-black">Produkty fizyczne</h2>
            <p className="mt-3 text-sm leading-7 text-slate-600">
              Dostępny przewoźnik, koszt i przewidywany termin są wyświetlane przed złożeniem zamówienia. Jeżeli oferta nie
              wskazuje innego terminu, produkt zostanie wydany nie później niż w ciągu 30 dni od zawarcia umowy.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
