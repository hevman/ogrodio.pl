export type CategoryHub = {
  categorySlug: string;
  slug: string;
  linkLabel: string;
};

export type CategoryIntro = {
  paragraphs: string[];
  hub?: CategoryHub;
};

/** Wstęp SEO na stronach /porady/{kategoria} — 2–3 akapity + opcjonalny artykuł-hub. */
export const categoryIntros: Partial<Record<string, CategoryIntro>> = {
  trawnik: {
    paragraphs: [
      "Trawnik to jeden z najbardziej wymagających elementów ogrodu — wygląda prosto, ale wymaga planu: dobra gleba na starcie, regularne koszenie, nawożenie sezonowe i od czasu do czasu aeracja lub wertykulacja. W polskim klimacie większość problemów (filc, mchy, żółknięcie, susza) da się opanować, jeśli wiesz, co robić i kiedy.",
      "Poniżej zebraliśmy poradniki o zakładaniu murawy, pierwszych tygodniach po siewie lub roli, jesiennej pielęgnacji, nawadnianiu, nawożeniu i koszeniu. Każdy artykuł opisuje konkretne sytuacje ogrodnika — nie ogólniki z podręcznika.",
      "Jeśli dopiero planujesz trawnik albo regenerujesz stary, zacznij od hubu kategorii: [Przygotowanie gleby pod trawnik](/porady/trawnik/przygotowanie-gleby-pod-trawnik). To etap, który decyduje o sukcesie lub porażce na lata — reszta pielęgnacji jest łatwiejsza, gdy podłoże jest dobrze zrobione.",
    ],
    hub: {
      categorySlug: "trawnik",
      slug: "przygotowanie-gleby-pod-trawnik",
      linkLabel: "Przygotowanie gleby pod trawnik — od wykopu do siewu",
    },
  },
  warzywnik: {
    paragraphs: [
      "Warzywnik w ogrodzie przydomowym to najszybsza droga do świeżych plonów — sałata, rzodkiewka, marchew czy buraki rosną w kilka tygodni, a sezon można planować od marca do października. Klucz to słońce (minimum 6–8 h), dobra gleba i rotacja upraw, żeby nie ciągnąć tych samych chorób co roku.",
      "W tej kategorii znajdziesz poradniki o zakładaniu warzywnika od zera, uprawie pojedynczych warzyw krok po kroku oraz łączeniu siewów, żeby mieć stałe zbiory. Treści są pisane pod polski klimat — terminy, przymrozki i typowe błędy początkujących.",
      "Nowy warzywnik? Zacznij od [Jak założyć warzywnik w ogrodzie](/porady/warzywnik/jak-zalozyc-warzywnik-w-ogrodzie) — wybór miejsca, układ grządek, plan sezonu i od czego zacząć jako początkujący. Potem dobierz poradnik o konkretnym warzywie, które chcesz siać w tym miesiącu.",
    ],
    hub: {
      categorySlug: "warzywnik",
      slug: "jak-zalozyc-warzywnik-w-ogrodzie",
      linkLabel: "Jak założyć warzywnik w ogrodzie — plan od A do Z",
    },
  },
  "oczko-wodne": {
    paragraphs: [
      "Oczko wodne w ogrodzie to kilka dni pracy i lata przyjemności — woda przyciąga owady pożyteczne, żaby i ptaki, a rośliny wodne stabilizują ekosystem lepiej niż pusta misa. W polskim klimacie małe oczko (2–6 m²) zamarza co zimę — to normalne, o ile przygotujesz rośliny, sprzęt i brzeg jesienią.",
      "Poradniki w tej kategorii obejmują zakładanie oczka od wykopu i folii, dobór roślin wodnych, walkę z glonami, dobór filtra i pompę oraz jesienną pielęgnację przed mrozami. Opisujemy też model „naturalnego” oczka bez prądu i wariant z rybami.",
      "Planujesz pierwsze oczko? Hub kategorii to [Jak założyć oczko wodne w ogrodzie](/porady/oczko-wodne/jak-zalozyc-oczko-wodne-w-ogrodzie) — miejsce, wykop, folia EPDM, brzeg i pierwsze rośliny. Po uruchomieniu zajrzyj do artykułu o [roślinach wodnych](/porady/oczko-wodne/rosliny-wodne-w-oczku-uprawa) i jesiennej konserwacji.",
    ],
    hub: {
      categorySlug: "oczko-wodne",
      slug: "jak-zalozyc-oczko-wodne-w-ogrodzie",
      linkLabel: "Jak założyć oczko wodne — wykop, folia, brzeg",
    },
  },
  "wysiew-nasion-i-sadzenie": {
    paragraphs: [
      "Kalendarz siewu to szkielet całego sezonu ogrodniczego — w polskim klimacie termin ma znaczenie: marchew w zimnej glebie kiełkuje wolno, pomidory w maju przed 15. giną od przymrozków, a jesienne siewy szpinaku dają plony do listopada. Mamy osobny poradnik na każdy miesiąc, od stycznia do grudnia.",
      "Artykuły łączą siew bezpośredni do gruntu, rozsadę w domu, hartowanie sadzonek i sadzenie cebul kwiatowych. Przy warzywach linkujemy do szczegółowych poradników — [marchew](/porady/warzywnik/marchew-uprawa-siew-zbiory), [burak](/porady/warzywnik/burak-uprawa-i-pielegnacja), [rzodkiewka](/porady/warzywnik/rzodkiewka-siew-kiedy-i-jak) i [sałata](/porady/warzywnik/salata-lisciowa-uprawa-zbiory).",
      "Wiosną zacznij od [Co siejemy w kwietniu](/porady/wysiew-nasion-i-sadzenie/co-siejemy-w-kwietniu) — to najintensywniejszy miesiąc siewów do gruntu. Planujesz warzywnik od zera? Połącz kalendarz z [Jak założyć warzywnik](/porady/warzywnik/jak-zalozyc-warzywnik-w-ogrodzie).",
    ],
    hub: {
      categorySlug: "wysiew-nasion-i-sadzenie",
      slug: "co-siejemy-w-kwietniu",
      linkLabel: "Co siejemy w kwietniu — kalendarz siewu",
    },
  },
  "owoce-w-ogrodzie": {
    paragraphs: [
      "Owoce w ogrodzie przydomowym to borówki, porzeczki, maliny, jabłonie, truskawki czy winorośl — każde ma inny termin cięcia, nawożenia i zbioru. W polskim klimacie kluczowe są mrozoodporność odmiany, kwaśne podłoże dla borówki i regularne cięcie u krzewów owocowych, żeby co roku mieć plon, a nie tylko gęsty las gałęzi.",
      "W tej kategorii znajdziesz poradniki o uprawie konkretnych gatunków, doborze odmian wczesnych i późnych, pielęgnacji po posadzeniu oraz problemach sezonowych — od plam na liściach młodej borówki po zapylanie jagody kamczackiej wiosną.",
      "Zacznij od hubu borówki amerykańskiej — [Odmiany borówki i terminy dojrzewania](/porady/owoce-w-ogrodzie/odmiany-borowki-terminy-dojrzewania) — to najczęstszy owoc w polskich ogrodach i dobry punkt wyjścia do reszty krzewów. Potem dobierz poradnik o porzeczce, malinie lub winorośli, które masz na działce.",
    ],
    hub: {
      categorySlug: "owoce-w-ogrodzie",
      slug: "odmiany-borowki-terminy-dojrzewania",
      linkLabel: "Odmiany borówki amerykańskiej — terminy dojrzewania",
    },
  },
  "choroby-i-szkodniki": {
    paragraphs: [
      "Choroby i szkodniki w ogrodzie rzadko znikają same — żółte liście, brązowe plamy, bąble na porzeczce czy mszyce to sygnały, które warto rozpoznać zanim problem obją cały krzew. W polskim klimacie najczęściej spotkasz stres wodny mylony z chorobą, poparzenia słoneczne, choroby grzybowe po wilgotnej wiosnie i szkodniki ssące latem.",
      "Poradniki w tej kategorii opisują objawy na zdjęciach, różnicują podobne problemy (np. mozaika wirusowa vs chloroza borówki) i podpowiadają, kiedy wystarczy pielęgnacja, a kiedy trzeba działać preparatem zgodnie z etykietą.",
      "Nie wiesz od czego zacząć diagnozę? Hub kategorii to [Choroby liści borówki — diagnoza](/porady/choroby-i-szkodniki/borowka-choroby-lisci-diagnoza) — nauczysz się odróżniać typowe objawy i unikasz leczenia „w ciemno”. Podobne zasady obserwacji stosuj też przy porzeczce, śliwce i innych roślinach.",
    ],
    hub: {
      categorySlug: "choroby-i-szkodniki",
      slug: "borowka-choroby-lisci-diagnoza",
      linkLabel: "Choroby liści borówki — jak rozpoznać objawy",
    },
  },
  pielegnacja: {
    paragraphs: [
      "Pielęgnacja ogrodu to cięcia, nawożenie, mulczowanie, przygotowanie na wiosnę i zabiegi po kwitnieniu — niezależnie od tego, czy uprawiasz lawendę, hortensję, różę pnącą, zielnik czy borówkę. W polskim klimacie termin zabiegu bywa ważniejszy niż sam produkt: za wczesne cięcie róży, zbyt głębokie wapnowanie lawendy czy nawóz azotowy jesienią potrafią zepsuć efekt na cały sezon.",
      "W tej kategorii zebraliśmy praktyczne poradniki sezonowe i gatunkowe: od [przygotowania ogrodu na wiosnę](/porady/pielegnacja/jak-przygotowac-ogrod-na-wiosne), przez lawendę i hortensję, po tymianek z rozmarynem i zielnik ziołowy.",
      "Nowy sezon? Zacznij od checklisty [Jak przygotować ogród na wiosnę](/porady/pielegnacja/jak-przygotowac-ogrod-na-wiosne) — uporządkujesz prace od marca do maja, zanim ruszą siewy i pierwsze nawożenia. Potem wracaj do poradnika o konkretnej roślinie, którą właśnie pielęgnujesz.",
    ],
    hub: {
      categorySlug: "pielegnacja",
      slug: "jak-przygotowac-ogrod-na-wiosne",
      linkLabel: "Jak przygotować ogród na wiosnę — checklista",
    },
  },
  "przyroda-w-ogrodzie": {
    paragraphs: [
      "Ogród to nie tylko rośliny uprawne — jeże, bzygowate, koniki polne, mrówki i ptaki wpływają na zapylanie, kontrolę szkodników i równowagę ekosystemu. W polskim ogrodzie przydomowym coraz częściej łączymy uprawę warzyw i owoców z miejscami dla pożytecznych zwierząt: stosy liści, oczko wodne, kwitnące drzewa i ograniczenie chemii.",
      "Poradniki opisują, jak rozpoznać pożyteczne owady od szkodników, jak chronić rośliny przed sarnami bez niszczenia przyrody, co zrobić z gniazdem mrówek i dlaczego wierzba przyciąga zapylacze ważniejsze niż ul.",
      "Chcesz ogrod przyjazny zapylaczom i ptakom? Hub kategorii to [Wierzba i bzygowate w ogrodzie](/porady/przyroda-w-ogrodzie/wierzba-bzygowate-ogrod) — wyjaśnia, dlaczego te drzewa są kluczowe dla bioróżnorodności. Uzupełnij o [jeża w ogrodzie](/porady/przyroda-w-ogrodzie/jez-w-ogrodzie), jeśli chcesz naturalną kontrolę ślimaków i owadów.",
    ],
    hub: {
      categorySlug: "przyroda-w-ogrodzie",
      slug: "wierzba-bzygowate-ogrod",
      linkLabel: "Wierzba i bzygowate — zapylacze w ogrodzie",
    },
  },
  "rosliny-ozdobne": {
    paragraphs: [
      "Rośliny ozdobne nadają ogrodowi strukturę przez cały rok — trawy ozdobne, liściaste krzewy, byliny i egzotyczne akcenty jak paulownia czy albicja. W polskim klimacie przy wyborze gatunku liczy się mrozoodporność, stanowisko (słońce vs półcień) i to, czy roślina ma zimozielone liście, czy chowa się na zimę.",
      "W kategorii znajdziesz poradniki o uprawie konkretnych gatunków: hortensji, lilii azjatyckich, traw ozdobnych, sosny mugo na skalniaku, tuja z żółtymi „szyszkami” czy oliwki w donicy na tarasie.",
      "Szukasz uniwersalnego startu? Zacznij od [Hortensji w ogrodzie](/porady/rosliny-ozdobne/hortensja-uprawa-pielegnacja) — popularna, wdzięczna i dobrze ilustruje zasady nawożenia, cięcia i wpływu gleby na kolor kwiatów. Potem przejdź do traw ozdobnych lub lilii, jeśli planujesz rabatę sezonową.",
    ],
    hub: {
      categorySlug: "rosliny-ozdobne",
      slug: "hortensja-uprawa-pielegnacja",
      linkLabel: "Hortensja w ogrodzie — uprawa i pielęgnacja",
    },
  },
  "rosliny-domowe-i-balkonowe": {
    paragraphs: [
      "Rośliny domowe i balkonowe to donice na tarasie, sukulenty w mieszkaniu, dracena w salonie czy pomidory koktajlowe na balustradzie — każde ma inne wymagania co do światła, podlewania i przesadzania. W polskim klimacie balkon bywa ekstremalny: majowe przymrozki, lipcowe upały i szybkie wysychanie donic.",
      "Poradniki opisują uprawę od nasiona (awokado, figa), kompozycje kaktusów, pielęgnację palm i dracen w domu oraz warzywa w donicy — np. pomidory koktajlowe, które dają plon na małej powierzchni.",
      "Balkon lub parapet? Hub kategorii to [Pomidory koktajlowe w donicy](/porady/warzywnik/pomidory-koktajlowe-w-donicy) — praktyczny przewodnik dla małej przestrzeni z realnym plonem. Do domu zajrzyj też do [palmy i draceny](/porady/rosliny-domowe-i-balkonowe/palma-i-dracena-w-domu) albo [kompozycji kaktusów](/porady/rosliny-domowe-i-balkonowe/kaktusy-kompozycja-w-misce).",
    ],
    hub: {
      categorySlug: "rosliny-domowe-i-balkonowe",
      slug: "palma-i-dracena-w-domu",
      linkLabel: "Palma i dracena w domu — uprawa i pielęgnacja",
    },
  },
};

export function getCategoryIntro(categorySlug: string): CategoryIntro | null {
  return categoryIntros[categorySlug] ?? null;
}
