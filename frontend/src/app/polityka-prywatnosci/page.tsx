import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Polityka prywatności | Ogrodio",
  description: "Informacje o przetwarzaniu danych osobowych klientów sklepu Ogrodio.",
};

export default function PrivacyPolicyPage() {
  return (
    <main className="bg-[#f6f7f2] px-6 py-12 text-slate-950">
      <article className="mx-auto max-w-4xl rounded-lg border border-emerald-900/10 bg-white p-6 shadow-sm md:p-10">
        <p className="text-sm font-black uppercase text-emerald-700">Ogrodio</p>
        <h1 className="mt-2 text-4xl font-black">Polityka prywatności</h1>
        <p className="mt-3 text-sm text-slate-500">Obowiązuje od 10 lipca 2026 r.</p>

        <div className="mt-8 grid gap-8 text-sm leading-7 text-slate-700">
          <section>
            <h2 className="text-xl font-black text-slate-950">Administrator danych</h2>
            <p className="mt-2">Administratorem danych jest Paweł Kopytko, prowadzący działalność nierejestrowaną pod marką Ogrodio, Niedźwiedza 72, 32-854 Porąbka Uszewska, NIP 8692010130. Kontakt w sprawach danych osobowych: <a className="font-bold text-emerald-800" href="mailto:kontakt@ogrodio.pl">kontakt@ogrodio.pl</a>, telefon: <a className="font-bold text-emerald-800" href="tel:+48791172155">+48 791 172 155</a>.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">Jakie dane i w jakim celu przetwarzamy</h2>
            <p className="mt-2">Przetwarzamy dane podane przy zamówieniu, w szczególności imię i nazwisko, e-mail, telefon, adres, dane zamówienia i płatności. Dane są używane do zawarcia i wykonania umowy, obsługi płatności, dostarczenia produktu, kontaktu, reklamacji, zwrotów, prowadzenia ewidencji sprzedaży oraz wykonania obowiązków podatkowych.</p>
            <p className="mt-2">Podstawą przetwarzania jest wykonanie umowy lub działania przed jej zawarciem, obowiązek prawny administratora oraz prawnie uzasadniony interes polegający na zabezpieczeniu roszczeń, zapobieganiu nadużyciom i zapewnieniu bezpieczeństwa serwisu. Marketing elektroniczny wymaga odrębnej zgody, jeżeli taka funkcja zostanie udostępniona.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">Odbiorcy danych</h2>
            <p className="mt-2">Dane mogą otrzymać podmioty niezbędne do działania sklepu: dostawcy hostingu i poczty elektronicznej, dostawcy oprogramowania sklepu, księgowość, przewoźnicy w przypadku produktów fizycznych oraz operator płatności, jeżeli kupujący wybierze aktywną płatność automatyczną. Każdy odbiorca otrzymuje dane wyłącznie w zakresie koniecznym do swojej roli.</p>
            <p className="mt-2">Przy przelewie tradycyjnym sprzedawca przetwarza informacje potrzebne do przypisania wpłaty do zamówienia. Przy płatnościach automatycznych dane płatnicze są przetwarzane przez operatora płatności zgodnie z jego własnymi obowiązkami prawnymi. Sklep nie przechowuje kodów BLIK ani danych logowania bankowego.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">Okres przechowywania</h2>
            <p className="mt-2">Dane zamówień przechowujemy przez okres wymagany przepisami podatkowymi i rachunkowymi, a następnie do upływu terminów przedawnienia możliwych roszczeń. Dane dotyczące reklamacji przechowujemy przez czas jej obsługi i właściwy okres przedawnienia. Dane przetwarzane na podstawie zgody są przechowywane do jej wycofania, chyba że istnieje inna podstawa prawna.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">Twoje prawa</h2>
            <p className="mt-2">Masz prawo żądać dostępu do danych, ich sprostowania, usunięcia lub ograniczenia przetwarzania, przeniesienia danych oraz wnieść sprzeciw, gdy podstawą jest prawnie uzasadniony interes. Zgodę można wycofać w dowolnym momencie bez wpływu na zgodność wcześniejszego przetwarzania.</p>
            <p className="mt-2">Masz również prawo złożyć skargę do Prezesa Urzędu Ochrony Danych Osobowych. Podanie danych wymaganych w checkoutcie jest dobrowolne, ale konieczne do zawarcia i wykonania umowy.</p>
          </section>

          <section>
            <h2 className="text-xl font-black text-slate-950">Pliki cookie i bezpieczeństwo</h2>
            <p className="mt-2">Sklep wykorzystuje niezbędne pliki cookie i pamięć przeglądarki do utrzymania sesji, koszyka, logowania oraz zabezpieczenia działania serwisu. Funkcje analityczne lub marketingowe, które nie są niezbędne, powinny być uruchamiane dopiero po uzyskaniu wymaganej zgody użytkownika.</p>
            <p className="mt-2">Stosujemy środki techniczne i organizacyjne odpowiednie do ryzyka, w tym szyfrowane połączenie HTTPS, ograniczenie dostępu oraz rozdzielenie publicznych zasobów od chronionych plików cyfrowych.</p>
          </section>
        </div>
      </article>
    </main>
  );
}
