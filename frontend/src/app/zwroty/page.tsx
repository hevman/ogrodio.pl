import type { Metadata } from "next";
import Link from "next/link";

const shopUrl = (process.env.NEXT_PUBLIC_SHOP_URL || "https://sklep.ogrodio.pl").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Odstąpienie od umowy i zwroty | Ogrodio",
  description: "Zasady odstąpienia od umowy, zwrotu rzeczy i dostarczania treści cyfrowych w sklepie Ogrodio.",
  alternates: { canonical: `${shopUrl}/zwroty` },
};

export default function ReturnsPage() {
  return (
    <main className="bg-[#f6f7f2] px-6 py-12 text-slate-950">
      <article className="mx-auto max-w-4xl rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm md:p-10">
        <p className="text-sm font-black uppercase text-emerald-700">Pomoc po zakupie</p>
        <h1 className="mt-2 text-4xl font-black">Odstąpienie od umowy i zwroty</h1>

        <div className="mt-8 grid gap-8 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-xl font-black text-slate-950">14 dni na decyzję</h2>
            <p className="mt-2">
              Konsument może odstąpić od umowy zawartej przez internet w ciągu 14 dni bez podawania przyczyny. Przy
              zakupie rzeczy termin co do zasady biegnie od jej otrzymania. Oświadczenie wyślij przed upływem terminu na
              kontakt@ogrodio.pl albo pocztą na adres: Paweł Kopytko, Niedźwiedza 72, 32-854 Porąbka Uszewska.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">E-book i utrata prawa odstąpienia</h2>
            <p className="mt-2">
              Samo złożenie zamówienia nie odbiera prawa odstąpienia. Prawo wygasa dopiero po rozpoczęciu dostarczania
              odpłatnego e-booka, jeżeli wcześniej wyrazisz wyraźną zgodę na dostarczenie przed upływem 14 dni, przyjmiesz
              do wiadomości utratę prawa oraz otrzymasz potwierdzenie umowy. Jeżeli plik jest niezgodny z umową, nadal
              przysługują Ci ustawowe prawa reklamacyjne.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">Zwrot rzeczy i pieniędzy</h2>
            <p className="mt-2">
              Rzecz odeślij nie później niż w ciągu 14 dni od odstąpienia. Bezpośredni koszt odesłania ponosi konsument.
              Zwrot płatności następuje nie później niż w ciągu 14 dni od otrzymania oświadczenia, tym samym sposobem,
              chyba że uzgodnimy inny bezkosztowy sposób. Możemy wstrzymać zwrot do otrzymania rzeczy lub dowodu jej nadania.
            </p>
            <p className="mt-2">
              Oryginalne opakowanie ani paragon nie są warunkiem odstąpienia. Konsument odpowiada jedynie za zmniejszenie
              wartości rzeczy wynikające z korzystania z niej szerzej, niż było to konieczne do sprawdzenia jej charakteru,
              cech i działania.
            </p>
          </section>

          <section className="rounded-lg border border-emerald-900/10 bg-emerald-50 p-5">
            <h2 className="text-xl font-black text-slate-950">Wzór formularza odstąpienia</h2>
            <p className="mt-2">Formularz jest opcjonalny. Możesz wysłać również własne jednoznaczne oświadczenie.</p>
            <div className="mt-4 whitespace-pre-line rounded-lg bg-white p-5 font-mono text-xs leading-6 text-slate-700">
              {`Adresat: Paweł Kopytko, Niedźwiedza 72, 32-854 Porąbka Uszewska, kontakt@ogrodio.pl

Ja/My (*) informuję/informujemy (*) o odstąpieniu od umowy sprzedaży następujących rzeczy / dostarczenia następującej treści cyfrowej (*):

Numer zamówienia:
Data zawarcia umowy / odbioru (*):
Imię i nazwisko konsumenta(-ów):
Adres konsumenta(-ów):
Data:
Podpis (tylko dla formularza papierowego):

(*) Niepotrzebne skreślić.`}
            </div>
          </section>

          <p>
            Reklamacja wadliwego produktu jest czymś innym niż odstąpienie. Zobacz{" "}
            <Link className="font-bold text-emerald-800" href="/reklamacje">zasady reklamacji</Link>.
          </p>
        </div>
      </article>
    </main>
  );
}
