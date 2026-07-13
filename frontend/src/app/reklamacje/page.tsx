import type { Metadata } from "next";
import Link from "next/link";

const shopUrl = (process.env.NEXT_PUBLIC_SHOP_URL || "https://sklep.ogrodio.pl").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Reklamacje | Ogrodio",
  description: "Jak zgłosić reklamację e-booka lub produktu kupionego w sklepie Ogrodio.",
  alternates: { canonical: `${shopUrl}/reklamacje` },
};

export default function ComplaintPage() {
  return (
    <main className="bg-[#f6f7f2] px-6 py-12 text-slate-950">
      <article className="mx-auto max-w-4xl rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm md:p-10">
        <p className="text-sm font-black uppercase text-emerald-700">Pomoc po zakupie</p>
        <h1 className="mt-2 text-4xl font-black">Reklamacje</h1>
        <p className="mt-4 leading-7 text-slate-600">Sprzedawca odpowiada za zgodność produktu z umową. Regulamin nie ogranicza ustawowych praw klienta.</p>

        <div className="mt-8 grid gap-8 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-xl font-black text-slate-950">Jak zgłosić problem</h2>
            <p className="mt-2">
              Wyślij reklamację na <a className="font-bold text-emerald-800" href="mailto:kontakt@ogrodio.pl">kontakt@ogrodio.pl</a>
              {" "}albo listownie na adres: Paweł Kopytko, Niedźwiedza 72, 32-854 Porąbka Uszewska. Podaj, jeśli to możliwe,
              numer zamówienia, opis problemu, oczekiwane rozwiązanie oraz dane do odpowiedzi. Paragon nie jest jedynym
              dopuszczalnym dowodem zakupu, a niepełne zgłoszenie nie jest automatycznie odrzucane.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">E-book lub inna treść cyfrowa</h2>
            <p className="mt-2">
              Jeśli link nie działa, plik jest uszkodzony, ma inny format lub zakres niż obiecany albo nie daje się
              prawidłowo używać na wskazanym zgodnym urządzeniu, możesz żądać doprowadzenia treści do zgodności z umową.
              Zrobimy to w rozsądnym czasie, bez nadmiernych niedogodności i bez kosztów po Twojej stronie.
            </p>
            <p className="mt-2">
              W przypadkach przewidzianych ustawą, między innymi gdy doprowadzenie do zgodności jest niemożliwe, odmówione,
              nieskuteczne albo niezgodność jest istotna, możesz żądać obniżenia ceny lub odstąpić od umowy.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">Produkt fizyczny</h2>
            <p className="mt-2">
              W razie niezgodności rzeczy z umową możesz żądać naprawy albo wymiany. W sytuacjach określonych prawem
              możesz żądać obniżenia ceny albo odstąpić od umowy. Koszty odebrania, transportu, naprawy lub wymiany rzeczy
              niezgodnej z umową ponosi sprzedawca.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">Termin odpowiedzi</h2>
            <p className="mt-2">
              Odpowiemy na reklamację konsumenta w ciągu 14 dni od jej otrzymania, na papierze lub innym trwałym nośniku.
              Jeżeli do rozpatrzenia sprawy potrzebujemy dodatkowych informacji, poprosimy tylko o dane rzeczywiście potrzebne.
            </p>
          </section>

          <p>
            Chcesz zrezygnować z prawidłowego produktu bez podawania przyczyny? Zobacz{" "}
            <Link className="font-bold text-emerald-800" href="/zwroty">odstąpienie od umowy</Link>.
          </p>
        </div>
      </article>
    </main>
  );
}
