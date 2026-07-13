import type { Metadata } from "next";
import Link from "next/link";

const shopUrl = (process.env.NEXT_PUBLIC_SHOP_URL || "https://sklep.ogrodio.pl").replace(/\/$/, "");

export const metadata: Metadata = {
  title: "Regulamin sklepu i usług elektronicznych | Ogrodio",
  description: "Zasady zakupów, dostarczania e-booków, reklamacji i korzystania z usług Ogrodio.",
  alternates: { canonical: `${shopUrl}/regulamin` },
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
        <h1 className="mt-2 text-4xl font-black">Regulamin sklepu i usług elektronicznych</h1>
        <p className="mt-3 text-sm text-slate-500">Wersja 1.1, obowiązuje od 13 lipca 2026 r.</p>

        <div className="mt-8 grid gap-8 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-xl font-black text-slate-950">1. Sprzedawca i zakres regulaminu</h2>
            <p className="mt-2">
              Sprzedawcą i usługodawcą jest {seller.name}, prowadzący działalność nierejestrowaną pod marką Ogrodio,
              adres: {seller.address}, NIP: {seller.nip}, e-mail:{" "}
              <a className="font-bold text-emerald-800" href={`mailto:${seller.email}`}>{seller.email}</a>, telefon:{" "}
              <a className="font-bold text-emerald-800" href="tel:+48791172155">{seller.phone}</a>.
            </p>
            <p className="mt-2">
              Regulamin określa zasady sprzedaży w sklepie sklep.ogrodio.pl oraz korzystania z bezpłatnych usług
              elektronicznych Ogrodio, w tym koszyka, formularza zamówienia, konta i aplikacji ogrodowej.
            </p>
            <p className="mt-2">
              Konsumentem jest osoba fizyczna dokonująca czynności niezwiązanej bezpośrednio z jej działalnością
              gospodarczą lub zawodową. Postanowienia dotyczące konsumenta stosuje się również do przedsiębiorcy na
              prawach konsumenta w zakresie wynikającym z przepisów.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">2. Wymagania techniczne</h2>
            <p className="mt-2">
              Do korzystania ze sklepu potrzebne są urządzenie z dostępem do internetu, aktualna przeglądarka z
              włączoną obsługą JavaScript i niezbędnych plików cookie oraz aktywny adres e-mail. Do otwarcia e-booka
              potrzebne jest oprogramowanie obsługujące format wskazany na stronie produktu, na przykład PDF lub EPUB.
            </p>
            <p className="mt-2">
              Użytkownik nie może przekazywać treści bezprawnych, podejmować prób przełamania zabezpieczeń ani używać
              usług w sposób zakłócający ich działanie. Sprzedawca zapewnia pomoc techniczną pod adresem {seller.email}.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">3. Produkty i składanie zamówień</h2>
            <p className="mt-2">
              Informacje na stronie produktu stanowią zaproszenie do zawarcia umowy. Zamówienie składa się przez wybór
              produktu, podanie wymaganych danych, wybór dostępnej dostawy i płatności, akceptację regulaminu oraz użycie
              przycisku „Kupuję i płacę”. Założenie konta nie jest wymagane, chyba że strona produktu wyraźnie stanowi inaczej.
            </p>
            <p className="mt-2">
              Przed złożeniem zamówienia klient widzi główne cechy produktu, cenę końcową, koszty dostawy, sposób i termin
              płatności oraz łączną kwotę. Klient może poprawić dane i zawartość koszyka przed wysłaniem zamówienia.
              Umowa zostaje zawarta z chwilą otrzymania przez klienta potwierdzenia przyjęcia zamówienia na e-mail.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">4. Ceny i płatności</h2>
            <p className="mt-2">
              Ceny są podawane w złotych polskich i są cenami końcowymi. Dostępne sposoby płatności są widoczne przed
              złożeniem zamówienia. Obecnie sklep obsługuje przelew tradycyjny. Płatności Autopay, BLIK lub szybki przelew
              staną się dostępne dopiero po ich aktywowaniu w checkoutcie.
            </p>
            <p className="mt-2">
              Przy przelewie tradycyjnym klient powinien użyć numeru zamówienia jako tytułu przelewu. Zamówienie jest
              opłacone po zaksięgowaniu całej należności. Jeśli płatność nie wpłynie w ciągu 7 dni, sprzedawca może
              anulować zamówienie po uprzednim przypomnieniu wysłanym na e-mail klienta.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">5. Treści cyfrowe</h2>
            <p className="mt-2">
              Format, zakres, kompatybilność i funkcjonalność e-booka są podane na stronie produktu. E-book nie wymaga
              stałego połączenia z internetem po pobraniu i nie zawiera technicznych zabezpieczeń ograniczających liczbę
              urządzeń, chyba że opis produktu wyraźnie wskazuje inaczej.
            </p>
            <p className="mt-2">
              Po zaksięgowaniu płatności e-book jest wysyłany na podany adres e-mail lub udostępniany przez link do
              pobrania, nie później niż w ciągu 2 dni roboczych. Plik jest przeznaczony do osobistego użytku klienta.
              Klient nie może go publicznie udostępniać, odsprzedawać ani rozpowszechniać z naruszeniem praw autorskich.
            </p>
            <p className="mt-2">
              Dostarczenie odpłatnej treści cyfrowej przed upływem 14 dni następuje po wyraźnej zgodzie klienta i po
              przyjęciu przez niego do wiadomości, że z chwilą spełnienia świadczenia utraci prawo odstąpienia od umowy.
              Potwierdzenie tej zgody jest przekazywane wraz z potwierdzeniem umowy na trwałym nośniku.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">6. Dostawa rzeczy</h2>
            <p className="mt-2">
              Dla produktów fizycznych sposób, koszt i przewidywany termin dostawy są wskazywane przed złożeniem
              zamówienia. Jeżeli nie uzgodniono innego terminu, rzecz zostanie wydana nie później niż w ciągu 30 dni od
              zawarcia umowy. Ryzyko utraty lub uszkodzenia przechodzi na konsumenta dopiero z chwilą wydania mu rzeczy.
            </p>
            <p className="mt-2">
              Brak protokołu szkody sporządzonego z przewoźnikiem nie odbiera klientowi prawa do reklamacji, choć taki
              protokół może ułatwić wyjaśnienie uszkodzenia w transporcie.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">7. Odstąpienie od umowy</h2>
            <p className="mt-2">
              Konsument może odstąpić od umowy zawartej na odległość w ciągu 14 dni bez podawania przyczyny, z wyjątkami
              przewidzianymi w ustawie. Dla rzeczy termin biegnie co do zasady od jej otrzymania. Oświadczenie można
              wysłać pocztą na adres sprzedawcy albo na {seller.email}. Wystarczy wysłanie go przed upływem terminu.
            </p>
            <p className="mt-2">
              Sprzedawca zwraca należne płatności nie później niż w ciągu 14 dni od otrzymania oświadczenia, przy użyciu
              takiego samego sposobu płatności, chyba że konsument zgodzi się na inny bezkosztowy sposób. Przy zwrocie
              rzeczy konsument ponosi bezpośredni koszt jej odesłania. Sprzedawca może wstrzymać zwrot płatności do chwili
              otrzymania rzeczy lub dowodu jej odesłania.
            </p>
            <p className="mt-2">
              Prawo odstąpienia od odpłatnej treści cyfrowej niedostarczanej na nośniku materialnym wygasa dopiero po
              rozpoczęciu jej dostarczania za uprzednią i wyraźną zgodą konsumenta, po poinformowaniu go o utracie prawa i
              przekazaniu potwierdzenia umowy. Szczegóły i wzór formularza są na stronie{" "}
              <Link className="font-bold text-emerald-800" href="/zwroty">Odstąpienie od umowy</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">8. Reklamacje i zgodność z umową</h2>
            <p className="mt-2">
              Sprzedawca odpowiada za zgodność rzeczy, treści cyfrowej i usługi cyfrowej z umową na zasadach wynikających
              z prawa. Reklamację można złożyć na {seller.email} lub listownie. Warto podać numer zamówienia, opis problemu,
              żądanie i dane kontaktowe; brak tych informacji nie powoduje automatycznego odrzucenia reklamacji.
            </p>
            <p className="mt-2">
              Przy niezgodnej treści cyfrowej konsument może żądać doprowadzenia jej do zgodności z umową. W przypadkach
              określonych ustawą może następnie żądać obniżenia ceny albo odstąpić od umowy. Przy niezgodnej rzeczy może
              żądać naprawy lub wymiany, a w przypadkach ustawowych obniżenia ceny albo odstąpienia od umowy. Uprawnienia
              te nie są ograniczane przez regulamin.
            </p>
            <p className="mt-2">
              Sprzedawca odpowiada na reklamację konsumenta w ciągu 14 dni. Szczegółowa procedura znajduje się na stronie{" "}
              <Link className="font-bold text-emerald-800" href="/reklamacje">Reklamacje</Link>.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">9. Konto i bezpłatne usługi Ogrodio</h2>
            <p className="mt-2">
              Umowa o konto zostaje zawarta podczas rejestracji na czas nieoznaczony i jest bezpłatna. Użytkownik może w
              każdej chwili zrezygnować z konta, wysyłając dyspozycję na {seller.email}. Usunięcie konta nie wpływa na dane,
              które muszą być dalej przechowywane z powodu zamówień, rozliczeń lub roszczeń.
            </p>
            <p className="mt-2">
              Sprzedawca może zawiesić konto, gdy jest używane bezprawnie, narusza bezpieczeństwo albo prawa innych osób,
              po wezwaniu do zaprzestania naruszeń, chyba że natychmiastowe działanie jest konieczne dla bezpieczeństwa.
              Decyzja nie ogranicza praw konsumenta dotyczących wcześniej zawartych umów.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">10. Dane osobowe</h2>
            <p className="mt-2">
              Zasady przetwarzania danych w sklepie, serwisie i aplikacji opisuje{" "}
              <Link className="font-bold text-emerald-800" href="/polityka-prywatnosci">Polityka prywatności Ogrodio</Link>.
              Dane wymagane do realizacji umowy należy podać zgodnie z prawdą.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">11. Pozasądowe rozwiązywanie sporów</h2>
            <p className="mt-2">
              Konsument może skorzystać z bezpłatnej pomocy miejskiego lub powiatowego rzecznika konsumentów oraz z
              informacji na prawakonsumenta.uokik.gov.pl. Może też zwrócić się do właściwego Wojewódzkiego Inspektoratu
              Inspekcji Handlowej z wnioskiem o mediację lub rozpatrzenie sprawy przez stały sąd polubowny. Skorzystanie z
              tych metod jest dobrowolne i wymaga zgody obu stron.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">12. Postanowienia końcowe</h2>
            <p className="mt-2">
              Do umów stosuje się prawo polskie, z zachowaniem bezwzględnie obowiązujących praw konsumenta. Właściwość
              sądu ustala się według obowiązujących przepisów; regulamin nie narzuca konsumentowi sądu właściwego dla
              sprzedawcy.
            </p>
            <p className="mt-2">
              Zmiana regulaminu nie narusza praw nabytych ani warunków zamówień złożonych wcześniej. Przy usługach
              ciągłych użytkownik zostanie poinformowany o zmianie z odpowiednim wyprzedzeniem i może zrezygnować z
              usługi przed wejściem zmiany w życie. W sprawach nieuregulowanych stosuje się obowiązujące przepisy.
            </p>
          </section>
        </div>
      </article>
    </main>
  );
}
