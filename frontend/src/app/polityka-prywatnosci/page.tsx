import type { Metadata } from "next";

const shopUrl = (process.env.NEXT_PUBLIC_SHOP_URL || "https://sklep.ogrodio.pl").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Polityka prywatności | Ogrodio",
  description: "Informacje o przetwarzaniu danych w sklepie, serwisie i aplikacji Ogrodio.",
  alternates: { canonical: `${shopUrl}/polityka-prywatnosci` },
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[#f6f7f2] px-6 py-12 text-slate-950">
      <article className="mx-auto max-w-4xl rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm md:p-10">
        <p className="text-sm font-black uppercase text-emerald-700">Ogrodio</p>
        <h1 className="mt-2 text-4xl font-black">Polityka prywatności</h1>
        <p className="mt-3 text-sm text-slate-500">Wersja 1.2, obowiązuje od 20 lipca 2026 r.</p>

        <div className="mt-8 grid gap-8 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-xl font-black text-slate-950">1. Zakres polityki i administrator</h2>
            <p className="mt-2">
              Polityka dotyczy danych przetwarzanych w serwisie ogrodio.pl, sklepie sklep.ogrodio.pl oraz aplikacji
              app.ogrodio.pl. Jest opublikowana w jednym miejscu w sklepie, aby użytkownik zawsze korzystał z aktualnej wersji.
            </p>
            <p className="mt-2">
              Administratorem danych jest Paweł Kopytko, prowadzący działalność nierejestrowaną pod marką Ogrodio,
              Niedźwiedza 72, 32-854 Porąbka Uszewska, NIP 8692010130. Kontakt w sprawach danych osobowych:{" "}
              <a className="font-bold text-emerald-800" href="mailto:kontakt@ogrodio.pl">kontakt@ogrodio.pl</a>, telefon:{" "}
              <a className="font-bold text-emerald-800" href="tel:+48791172155">+48 791 172 155</a>.
            </p>
            <p className="mt-2">Administrator nie wyznaczył inspektora ochrony danych.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">2. Jakie dane przetwarzamy</h2>
            <p className="mt-2">
              W sklepie przetwarzamy dane podane przy zamówieniu: imię i nazwisko, e-mail, telefon, adres rozliczeniowy
              lub dostawy, dane zamówienia, wybraną metodę płatności, informacje o wpłacie, reklamacjach i odstąpieniu.
              Nie przechowujemy danych logowania do banku ani kodów BLIK.
            </p>
            <p className="mt-2">
              W aplikacji przetwarzamy dane konta i dane wprowadzone przez użytkownika: imię, e-mail, opcjonalny telefon,
              wybraną miejscowość lub lokalizację ogrodu, rośliny, zadania, notatki, wpisy dziennika i przesłane zdjęcia.
              Użytkownik powinien przesyłać wyłącznie materiały, do których ma prawa, i unikać utrwalania osób postronnych.
            </p>
            <p className="mt-2">
              Automatycznie mogą być zapisywane dane techniczne niezbędne do bezpieczeństwa i działania usług, takie jak
              adres IP, czas żądania, typ przeglądarki, identyfikator sesji, informacje o błędach i zdarzeniach bezpieczeństwa.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">3. Cele i podstawy prawne</h2>
            <div className="mt-3 overflow-x-auto">
              <table className="w-full min-w-[680px] border-collapse text-left">
                <thead><tr className="border-b border-slate-200"><th className="p-3">Cel</th><th className="p-3">Podstawa</th><th className="p-3">Zakres</th></tr></thead>
                <tbody>
                  <tr className="border-b border-slate-100"><td className="p-3">Zamówienie, płatność i dostawa</td><td className="p-3">art. 6 ust. 1 lit. b RODO</td><td className="p-3">dane klienta, zamówienia i płatności</td></tr>
                  <tr className="border-b border-slate-100"><td className="p-3">Konto i funkcje aplikacji</td><td className="p-3">art. 6 ust. 1 lit. b RODO</td><td className="p-3">konto, ogród, zadania, notatki i zdjęcia</td></tr>
                  <tr className="border-b border-slate-100"><td className="p-3">Rozliczenia i ewidencja sprzedaży</td><td className="p-3">art. 6 ust. 1 lit. c RODO</td><td className="p-3">dane wymagane przepisami podatkowymi</td></tr>
                  <tr className="border-b border-slate-100"><td className="p-3">Reklamacje i roszczenia</td><td className="p-3">art. 6 ust. 1 lit. b, c i f RODO</td><td className="p-3">korespondencja, zamówienie i dowody</td></tr>
                  <tr className="border-b border-slate-100"><td className="p-3">Bezpieczeństwo i diagnostyka</td><td className="p-3">art. 6 ust. 1 lit. f RODO</td><td className="p-3">logi techniczne i zdarzenia bezpieczeństwa</td></tr>
                  <tr><td className="p-3">Marketing elektroniczny, jeśli zostanie uruchomiony</td><td className="p-3">art. 6 ust. 1 lit. a RODO</td><td className="p-3">e-mail i zapis zgody</td></tr>
                </tbody>
              </table>
            </div>
            <p className="mt-3">
              Prawnie uzasadnionym interesem administratora jest ochrona usług przed nadużyciami, zapewnienie ich
              stabilności oraz ustalenie, dochodzenie lub obrona roszczeń. Zgoda marketingowa, jeśli zostanie udostępniona,
              będzie dobrowolna i oddzielona od zgody na zakup lub założenie konta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">4. Odbiorcy danych</h2>
            <p className="mt-2">
              Dane mogą otrzymać wyłącznie podmioty potrzebne do działania Ogrodio: dostawca hostingu i infrastruktury,
              dostawca poczty elektronicznej, dostawcy utrzymania oprogramowania, księgowość lub doradcy, przewoźnik przy
              produktach fizycznych oraz operator płatności, gdy klient wybierze aktywną płatność automatyczną. Organy
              publiczne otrzymują dane tylko wtedy, gdy wynika to z prawa.
            </p>
            <p className="mt-2">
              Podmioty przetwarzające działają na polecenie administratora i otrzymują dane w zakresie koniecznym do swojej
              roli. Operator płatności i przewoźnik mogą działać także jako odrębni administratorzy zgodnie z własnymi
              obowiązkami prawnymi.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">5. Przekazywanie danych poza EOG</h2>
            <p className="mt-2">
              Podstawowe dane sklepu i aplikacji są przechowywane na infrastrukturze wykorzystywanej przez Ogrodio.
              Niektórzy dostawcy usług sieciowych lub pocztowych mogą przetwarzać dane również poza Europejskim Obszarem
              Gospodarczym. W takim przypadku podstawą transferu jest decyzja Komisji Europejskiej stwierdzająca odpowiedni
              stopień ochrony albo standardowe klauzule umowne i wymagane zabezpieczenia. Informację o zabezpieczeniach
              można uzyskać pod adresem kontakt@ogrodio.pl.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">6. Jak długo przechowujemy dane</h2>
            <ul className="mt-3 list-disc space-y-2 pl-5">
              <li>dane konta i ogrodu — do usunięcia konta, a później tylko w zakresie wymaganym przez prawo lub potrzebnym do obrony roszczeń;</li>
              <li>dane zamówień i rozliczeń — przez okres wymagany przepisami podatkowymi oraz do upływu właściwego okresu przedawnienia roszczeń;</li>
              <li>reklamacje i odstąpienia — przez czas obsługi sprawy i do upływu właściwego okresu przedawnienia;</li>
              <li>logi bezpieczeństwa — co do zasady do 12 miesięcy, a dłużej tylko, gdy są dowodem incydentu lub roszczenia;</li>
              <li>dane przetwarzane na podstawie zgody — do jej wycofania, chyba że istnieje inna podstawa dalszego przetwarzania.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">7. Prawa użytkownika</h2>
            <p className="mt-2">
              Użytkownik ma prawo żądać dostępu do danych, ich sprostowania, usunięcia, ograniczenia przetwarzania i
              przeniesienia danych oraz wnieść sprzeciw wobec przetwarzania opartego na prawnie uzasadnionym interesie.
              Zgodę można wycofać w dowolnym momencie bez wpływu na zgodność wcześniejszego przetwarzania.
            </p>
            <p className="mt-2">
              Żądanie można wysłać na kontakt@ogrodio.pl. Dla ochrony danych administrator może poprosić o potwierdzenie
              tożsamości. Użytkownik może również złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">8. Dobrowolność danych i decyzje automatyczne</h2>
            <p className="mt-2">
              Podanie danych w zamówieniu lub rejestracji jest dobrowolne, ale dane oznaczone jako wymagane są konieczne
              do zawarcia i wykonania odpowiedniej umowy. Bez nich nie będzie można zrealizować zamówienia lub utworzyć konta.
            </p>
            <p className="mt-2">
              Ogrodio nie podejmuje wobec użytkownika decyzji wywołujących skutki prawne wyłącznie w sposób zautomatyzowany.
              Dopasowanie porad i zadań do roślin lub terminu ma charakter pomocniczy i nie jest takim profilowaniem.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">9. Cookie, pamięć przeglądarki i bezpieczeństwo</h2>
            <p className="mt-2">
              Ogrodio używa niezbędnych plików cookie i pamięci przeglądarki do sesji, logowania, koszyka, ustawień i
              ochrony przed nadużyciami. Są one potrzebne do świadczenia usługi i nie służą do reklamy behawioralnej.
              Funkcje analityczne lub marketingowe wymagające zgody nie będą uruchamiane przed jej uzyskaniem.
            </p>
            <p className="mt-2">
              Za zgodą użytkownika Ogrodio może używać Google Analytics 4 do pomiaru odwiedzin, popularności treści,
              źródeł ruchu i podstawowych zdarzeń w serwisie. Google Analytics działa u nas z Google Consent Mode v2:
              przed wyborem użytkownika zgody dla analityki, reklam, danych użytkownika i personalizacji reklam są
              domyślnie ustawione jako odmówione. Skrypt analityczny jest ładowany dopiero po zgodzie na analitykę.
            </p>
            <p className="mt-2">
              Dostawcą Google Analytics jest Google Ireland Limited. W związku z działaniem usług Google dane techniczne
              mogą być przetwarzane także poza Europejskim Obszarem Gospodarczym na zasadach opisanych przez Google.
              Zgodę można w każdej chwili zmienić lub wycofać przyciskiem „Ustawienia cookies” w stopce strony.
            </p>
            <p className="mt-2">
              Użytkownik może usunąć dane lokalne w ustawieniach przeglądarki, ale zablokowanie niezbędnych mechanizmów
              może uniemożliwić logowanie, utrzymanie koszyka lub złożenie zamówienia. Ogrodio stosuje szyfrowanie HTTPS,
              kontrolę dostępu, kopie zapasowe i rozdzielenie zasobów publicznych od plików chronionych.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">10. Zmiany polityki</h2>
            <p className="mt-2">
              Polityka może być aktualizowana po zmianie funkcji, dostawców lub przepisów. Data i numer wersji są podane
              na początku dokumentu. Jeżeli zmiana istotnie wpływa na użytkowników konta, informacja zostanie przekazana
              w aplikacji lub na e-mail przed wejściem zmiany w życie.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
