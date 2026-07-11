import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Regulamin sklepu | Ogrodio",
  description: "Zasady zakupów, płatności, dostarczania treści cyfrowych i reklamacji w sklepie Ogrodio.",
};

const seller = {
  name: "Paweł Kopytko",
  address: "Niedźwiedza 72, 32-854 Porąbka Uszewska",
  nip: "8692010130",
  email: "kontakt@ogrodio.pl",
  phone: "+48 791 172 155",
};

export default function TermsPage() {
  return (
    <main className="bg-[#f6f7f2] px-6 py-12 text-slate-950">
      <article className="mx-auto max-w-4xl rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm md:p-10">
        <p className="text-sm font-black uppercase text-emerald-700">Sklep Ogrodio</p>
        <h1 className="mt-2 text-4xl font-black">Regulamin sklepu internetowego</h1>
        <p className="mt-3 text-sm text-slate-500">Obowiązuje od 10 lipca 2026 r.</p>

        <div className="mt-8 grid gap-8 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-xl font-black text-slate-950">1. Sprzedawca i kontakt</h2>
            <p className="mt-2">Sprzedawcą jest {seller.name}, prowadzący działalność nierejestrowaną pod marką Ogrodio, adres: {seller.address}, NIP: {seller.nip}, e-mail: <a className="font-bold text-emerald-800" href={`mailto:${seller.email}`}>{seller.email}</a>, telefon: <a className="font-bold text-emerald-800" href="tel:+48791172155">{seller.phone}</a>.</p>
            <p className="mt-2">Regulamin określa zasady sprzedaży produktów fizycznych oraz treści cyfrowych za pośrednictwem sklepu pod adresem sklep.ogrodio.pl. Kupującym może być konsument, przedsiębiorca na prawach konsumenta albo inny podmiot.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">2. Składanie zamówienia</h2>
            <p className="mt-2">Informacje na stronie produktu stanowią zaproszenie do zawarcia umowy. Zamówienie składa się przez dodanie produktu do koszyka, podanie wymaganych danych, wybór płatności, zaakceptowanie regulaminu i użycie przycisku oznaczającego obowiązek zapłaty.</p>
            <p className="mt-2">Przed zapłatą sklep pokazuje główne cechy produktu, cenę brutto, ewentualny koszt dostawy i łączną kwotę. Potwierdzenie zamówienia jest wysyłane na podany adres e-mail. Umowa zostaje zawarta po przyjęciu zamówienia przez sklep.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">3. Ceny i płatności</h2>
            <p className="mt-2">Ceny są podawane w złotych polskich i są cenami końcowymi. Sklep obsługuje płatność przelewem tradycyjnym, a płatności automatyczne Autopay, w tym BLIK i szybkie przelewy, są przygotowane jako kolejna metoda i zostaną aktywowane po uruchomieniu operatora płatności. Aktualnie dostępne metody są zawsze widoczne w checkoutcie.</p>
            <p className="mt-2">Zamówienie jest uznawane za opłacone po zaksięgowaniu przelewu na rachunku sprzedawcy albo po otrzymaniu poprawnego potwierdzenia płatności od operatora, jeżeli dana metoda została aktywowana w sklepie. Realizacja zamówienia następuje po skutecznej zapłacie.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">4. Treści cyfrowe</h2>
            <p className="mt-2">E-book jest dostarczany w formatach wskazanych na stronie produktu, w szczególności PDF i EPUB. Do odczytu potrzebne jest urządzenie i oprogramowanie obsługujące dany format. Plik jest przeznaczony do osobistego użytku kupującego. Nie wolno go publicznie udostępniać, odsprzedawać ani rozpowszechniać.</p>
            <p className="mt-2">Po potwierdzeniu płatności kupujący otrzymuje na podany adres e-mail potwierdzenie umowy oraz dostęp do plików. Jeśli wiadomość nie dotrze, należy sprawdzić folder spam i skontaktować się ze sprzedawcą.</p>
            <p className="mt-2">Dostarczenie e-booka przed upływem 14 dni następuje wyłącznie po wyraźnej zgodzie kupującego i przyjęciu przez niego do wiadomości, że po spełnieniu świadczenia utraci prawo odstąpienia od umowy.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">5. Dostawa produktów fizycznych</h2>
            <p className="mt-2">Sposób, koszt i przewidywany termin dostawy produktu fizycznego są wskazywane przed złożeniem zamówienia. Ryzyko przypadkowej utraty lub uszkodzenia przechodzi na konsumenta z chwilą wydania mu produktu przez przewoźnika.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">6. Odstąpienie od umowy</h2>
            <p className="mt-2">Konsument może odstąpić od umowy zawartej na odległość w terminie 14 dni, o ile ustawa nie przewiduje wyjątku. Oświadczenie można wysłać na adres sprzedawcy lub e-mail. Wystarczy jednoznaczne oświadczenie zawierające dane kupującego i zamówienia.</p>
            <p className="mt-2">Prawo odstąpienia nie przysługuje w odniesieniu do odpłatnej treści cyfrowej niedostarczanej na nośniku materialnym, jeżeli jej dostarczanie rozpoczęto za uprzednią i wyraźną zgodą konsumenta, po poinformowaniu go o utracie prawa odstąpienia i przekazaniu potwierdzenia umowy.</p>
            <p className="mt-2">Informacje dotyczące zwrotów znajdują się także na stronie <Link className="font-bold text-emerald-800" href="/zwroty">Zwroty i reklamacje</Link>.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">7. Reklamacje</h2>
            <p className="mt-2">Sprzedawca odpowiada za zgodność produktu, treści cyfrowej lub usługi cyfrowej z umową na zasadach wynikających z obowiązujących przepisów. Reklamację można wysłać na {seller.email}. Należy opisać problem, podać numer zamówienia i oczekiwany sposób rozwiązania.</p>
            <p className="mt-2">Sprzedawca odpowiada na reklamację konsumenta w terminie 14 dni. W przypadku niedziałającego linku lub uszkodzonego pliku w pierwszej kolejności zapewni ponowny, bezpłatny dostęp do prawidłowej treści.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">8. Dane osobowe i postanowienia końcowe</h2>
            <p className="mt-2">Zasady przetwarzania danych opisuje <Link className="font-bold text-emerald-800" href="/polityka-prywatnosci">Polityka prywatności</Link>. Do umów stosuje się prawo polskie, z zachowaniem bezwzględnie obowiązujących praw konsumenta.</p>
            <p className="mt-2">Konsument może skorzystać z bezpłatnej pomocy miejskiego lub powiatowego rzecznika konsumentów albo informacji dostępnych na prawakonsumenta.uokik.gov.pl. Spory mogą być rozwiązywane polubownie za zgodą obu stron.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
