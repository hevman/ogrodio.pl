const endpoint = process.env.VENDURE_ADMIN_API_URL || 'http://commerce-server:3000/admin-api';
const username = process.env.VENDURE_SUPERADMIN_USERNAME || 'superadmin';
const password = process.env.VENDURE_SUPERADMIN_PASSWORD || 'superadmin';

const products = [
  {
    name: 'Bazylia Genovese',
    slug: 'bazylia-genovese',
    sku: 'GB-ZIO-BAZ-001',
    category: 'ziola',
    categoryLabel: 'Ziola i warzywa',
    price: 1290,
    stock: 28,
    description: 'Bazylia Genovese w doniczce do kuchni, skrzynki balkonowej i malego warzywnika. Ma duze, miesiste liscie o klasycznym aromacie do pesto, pomidorow i letnich salatek. Najlepiej rosnie w jasnym, cieplym miejscu i wymaga regularnego podlewania bez przelewania.',
  },
  {
    name: 'Mieta marokanska',
    slug: 'mieta-marokanska',
    sku: 'GB-ZIO-MIE-001',
    category: 'ziola',
    categoryLabel: 'Ziola i warzywa',
    price: 1190,
    stock: 22,
    description: 'Mieta marokanska o intensywnym, swiezym zapachu do herbaty, lemoniady i deserow. Dobrze sprawdza sie w donicach na balkonie oraz przy tarasie, gdzie szybko tworzy geste kepy. Lubi polcien i stale lekko wilgotne podloze.',
  },
  {
    name: 'Pomidor koktajlowy sadzonka',
    slug: 'pomidor-koktajlowy-sadzonka',
    sku: 'GB-WAR-POM-001',
    category: 'ziola',
    categoryLabel: 'Ziola i warzywa',
    price: 1590,
    stock: 18,
    description: 'Silna sadzonka pomidora koktajlowego do uprawy w duzej donicy, skrzyni albo w gruncie. Odmiana dobra dla poczatkujacych, plonuje drobnymi owocami idealnymi do przekasek i salatek. Wymaga slonecznego stanowiska, podpory i systematycznego podlewania.',
  },
  {
    name: 'Lawenda waskolistna',
    slug: 'lawenda-waskolistna',
    sku: 'GB-BAL-LAW-001',
    category: 'balkon-i-taras',
    categoryLabel: 'Balkon i taras',
    price: 1890,
    stock: 16,
    description: 'Lawenda waskolistna do slonecznych balkonow, tarasow i rabat przy wejsciu. Tworzy srebrzyste kepy i fioletowe kwiaty przyciagajace zapylacze. Najlepiej czuje sie w przepuszczalnym podlozu, z umiarkowanym podlewaniem i cieciem po kwitnieniu.',
  },
  {
    name: 'Pelargonia czerwona',
    slug: 'pelargonia-czerwona',
    sku: 'GB-BAL-PEL-001',
    category: 'balkon-i-taras',
    categoryLabel: 'Balkon i taras',
    price: 1490,
    stock: 34,
    description: 'Czerwona pelargonia rabatowa do skrzynek balkonowych, donic i sezonowych kompozycji przy wejsciu. Kwitnie obficie przez lato, dobrze znosi slonce i jest latwa w codziennej pielegnacji. Regularne usuwanie przekwitlych kwiatow przedluza kwitnienie.',
  },
  {
    name: 'Zestaw balkonowy start',
    slug: 'zestaw-balkonowy-start',
    sku: 'GB-BAL-ZES-001',
    category: 'balkon-i-taras',
    categoryLabel: 'Balkon i taras',
    price: 4990,
    stock: 7,
    description: 'Zestaw startowy do jednej skrzynki balkonowej: sezonowo dobrane rosliny o podobnych wymaganiach swietlnych i wodnych. Dobry wybor, gdy chcesz szybko wypelnic balkon bez samodzielnego kompletowania gatunkow. Do zamowienia dolaczamy prosta instrukcje sadzenia i pielegnacji.',
  },
  {
    name: 'Sansewieria mini',
    slug: 'sansewieria-mini',
    sku: 'GB-DOM-SAN-001',
    category: 'rosliny-domowe',
    categoryLabel: 'Rosliny domowe',
    price: 2990,
    stock: 12,
    description: 'Sansewieria mini to odporna roslina domowa do mieszkania, biura albo na prezent. Dobrze znosi suche powietrze i rzadsze podlewanie, dlatego sprawdza sie u osob bez duzego doswiadczenia. Najlepiej wyglada w jasnym miejscu z rozproszonym swiatlem.',
  },
  {
    name: 'Zamiokulkas mala doniczka',
    slug: 'zamiokulkas-mala-doniczka',
    sku: 'GB-DOM-ZAM-001',
    category: 'rosliny-domowe',
    categoryLabel: 'Rosliny domowe',
    price: 3490,
    stock: 9,
    description: 'Zamiokulkas w malej doniczce to wytrzymala roslina do domu i biura, tolerujaca slabsze swiatlo oraz przerwy w podlewaniu. Ma blyszczace, ciemnozielone liscie i spokojny, elegancki pokroj. Idealny na start, gdy potrzebna jest zielen bez trudnej pielegnacji.',
  },
  {
    name: 'Ziemia uniwersalna 20 l',
    slug: 'ziemia-uniwersalna-20l',
    sku: 'GB-ZIE-UNI-020',
    category: 'ziemie-i-nawozy',
    categoryLabel: 'Ziemie i nawozy',
    price: 1790,
    stock: 40,
    description: 'Uniwersalne podloze do sadzenia roslin balkonowych, ziol i roslin domowych. Ma lekka strukture, dobrze zatrzymuje wilgoc i ulatwia start po przesadzeniu. Worek 20 l sprawdza sie przy skrzynkach balkonowych, donicach i sezonowym uzupelnianiu rabat.',
  },
  {
    name: 'Nawoz do ziol i warzyw 1 l',
    slug: 'nawoz-do-ziol-i-warzyw-1l',
    sku: 'GB-NAW-ZIO-001',
    category: 'ziemie-i-nawozy',
    categoryLabel: 'Ziemie i nawozy',
    price: 2490,
    stock: 24,
    description: 'Plynny nawoz do ziol, pomidorow i warzyw uprawianych w donicach oraz gruncie. Pomaga utrzymac rownomierny wzrost i dobra kondycje lisci w sezonie. Stosuj zgodnie z dawkowaniem na etykiecie, szczegolnie przy mlodych sadzonkach.',
  },
  {
    name: 'Donica tarasowa grafit 30 cm',
    slug: 'donica-tarasowa-grafit-30cm',
    sku: 'GB-DON-GRA-030',
    category: 'donice-i-oslonki',
    categoryLabel: 'Donice i oslonki',
    price: 3990,
    stock: 15,
    description: 'Grafitowa donica tarasowa do ziol, lawendy, pelargonii i mniejszych roslin ozdobnych. Neutralny kolor pasuje do nowoczesnych balkonow i wejsc do domu. Donica ma stabilna forme oraz miejsce na warstwe drenazu.',
  },
  {
    name: 'Oslonka ceramiczna biala 14 cm',
    slug: 'oslonka-ceramiczna-biala-14cm',
    sku: 'GB-DON-BIA-014',
    category: 'donice-i-oslonki',
    categoryLabel: 'Donice i oslonki',
    price: 2290,
    stock: 20,
    description: 'Biala oslonka ceramiczna do roslin domowych w doniczkach produkcyjnych. Prosty ksztalt dobrze wyglada na parapecie, biurku i komodzie. Pasuje do sansewierii, zamiokulkasa oraz niewielkich roslin lisciastych.',
  },
  {
    name: 'Konewka metalowa 5 l',
    slug: 'konewka-metalowa-5l',
    sku: 'GB-NAW-KON-005',
    category: 'nawadnianie',
    categoryLabel: 'Nawadnianie',
    price: 4490,
    stock: 11,
    description: 'Metalowa konewka 5 l do podlewania roslin balkonowych, rabat i donic przy wejsciu. Dlugie ramie ulatwia precyzyjne podlewanie bez zalewania lisci. Dobra do codziennej pielegnacji tarasu i malego ogrodu.',
  },
  {
    name: 'Zestaw kroplujacy balkonowy',
    slug: 'zestaw-kroplujacy-balkonowy',
    sku: 'GB-NAW-KRO-001',
    category: 'nawadnianie',
    categoryLabel: 'Nawadnianie',
    price: 6990,
    stock: 8,
    description: 'Zestaw kroplujacy do kilku donic lub skrzynek balkonowych. Pomaga utrzymac rownomierna wilgotnosc podloza podczas upalow i wyjazdow. Najlepiej sprawdza sie przy ziolach, pelargoniach i roslinach sezonowych o podobnym zapotrzebowaniu na wode.',
  },
];

async function gql(query, variables = {}, token) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      host: 'sklep.ogrodio.localhost',
      ...(token ? { authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.map(error => error.message).join('\n') || response.statusText);
  }
  return { payload, response };
}

async function authenticate() {
  const { payload, response } = await gql(`
    mutation Authenticate($username: String!, $password: String!) {
      authenticate(input: { native: { username: $username, password: $password } }) {
        __typename
        ... on CurrentUser {
          id
          identifier
        }
        ... on ErrorResult {
          message
        }
      }
    }
  `, { username, password });
  if (payload.data.authenticate.__typename !== 'CurrentUser') {
    throw new Error(payload.data.authenticate.message || 'Admin authentication failed');
  }
  return response.headers.get('vendure-auth-token');
}

async function ensureTaxCategory(token) {
  const existing = await gql(`query { taxCategories { items { id name } } }`, {}, token);
  const category = existing.payload.data.taxCategories.items.find(item => item.name === 'Standard');
  if (category) return category.id;
  const created = await gql(`
    mutation CreateTaxCategory($input: CreateTaxCategoryInput!) {
      createTaxCategory(input: $input) {
        id
        name
      }
    }
  `, { input: { name: 'Standard', isDefault: true } }, token);
  return created.payload.data.createTaxCategory.id;
}

async function ensureCountryZoneAndTaxRate(token, taxCategoryId) {
  const setup = await gql(`
    query Setup {
      activeChannel {
        id
        defaultTaxZone {
          id
        }
        defaultShippingZone {
          id
        }
      }
      countries {
        items {
          id
          code
        }
      }
      zones {
        items {
          id
          name
        }
      }
      taxRates {
        items {
          id
          name
          category {
            id
          }
          zone {
            id
          }
        }
      }
    }
  `, {}, token);

  let country = setup.payload.data.countries.items.find(item => item.code === 'PL');
  if (!country) {
    const createdCountry = await gql(`
      mutation CreateCountry($input: CreateCountryInput!) {
        createCountry(input: $input) {
          id
          code
        }
      }
    `, {
      input: {
        code: 'PL',
        enabled: true,
        translations: [{ languageCode: 'en', name: 'Poland' }],
      },
    }, token);
    country = createdCountry.payload.data.createCountry;
  }

  let zone = setup.payload.data.zones.items.find(item => item.name === 'Polska');
  if (!zone) {
    const createdZone = await gql(`
      mutation CreateZone($input: CreateZoneInput!) {
        createZone(input: $input) {
          id
          name
        }
      }
    `, {
      input: {
        name: 'Polska',
        memberIds: [country.id],
      },
    }, token);
    zone = createdZone.payload.data.createZone;
  }

  const activeChannel = setup.payload.data.activeChannel;
  if (!activeChannel.defaultTaxZone || !activeChannel.defaultShippingZone) {
    await gql(`
      mutation UpdateChannel($input: UpdateChannelInput!) {
        updateChannel(input: $input) {
          ... on Channel {
            id
          }
          ... on ErrorResult {
            message
          }
        }
      }
    `, {
      input: {
        id: activeChannel.id,
        defaultTaxZoneId: zone.id,
        defaultShippingZoneId: zone.id,
        defaultCurrencyCode: 'PLN',
        availableCurrencyCodes: ['PLN'],
        pricesIncludeTax: true,
      },
    }, token);
  }

  const taxRates = await gql(`
    query TaxRates {
      taxRates {
        items {
          id
          name
          category {
            id
          }
          zone {
            id
          }
        }
      }
    }
  `, {}, token);
  const existingRate = taxRates.payload.data.taxRates.items.find(
    item => item.category.id === taxCategoryId && item.zone.id === zone.id,
  );
  if (!existingRate) {
    await gql(`
      mutation CreateTaxRate($input: CreateTaxRateInput!) {
        createTaxRate(input: $input) {
          id
          name
        }
      }
    `, {
      input: {
        name: 'VAT 0% produkty',
        enabled: true,
        value: 0,
        categoryId: taxCategoryId,
        zoneId: zone.id,
      },
    }, token);
  }
}

async function ensureCategoryFacet(token) {
  const existing = await gql(`query { facets { items { id code values { id code name } } } }`, {}, token);
  const facet = existing.payload.data.facets.items.find(item => item.code === 'garden-category');
  const labels = Array.from(new Map(products.map(product => [product.category, product.categoryLabel])).entries());
  if (facet) {
    const missing = labels
      .filter(([code]) => !facet.values.some(value => value.code === code))
      .map(([code, label]) => ({
        facetId: facet.id,
        code,
        translations: [{ languageCode: 'en', name: label }],
      }));
    if (missing.length) {
      await gql(`
        mutation CreateFacetValues($input: [CreateFacetValueInput!]!) {
          createFacetValues(input: $input) {
            id
            code
            name
          }
        }
      `, { input: missing }, token);
    }
    const updates = labels
      .map(([code, label]) => {
        const value = facet.values.find(item => item.code === code);
        return value && value.name !== label
          ? {
              id: value.id,
              code,
              translations: [{ languageCode: 'en', name: label }],
            }
          : null;
      })
      .filter(Boolean);
    if (updates.length) {
      await gql(`
        mutation UpdateFacetValues($input: [UpdateFacetValueInput!]!) {
          updateFacetValues(input: $input) {
            id
            code
            name
          }
        }
      `, { input: updates }, token);
    }
    const refreshed = await gql(`query { facets { items { id code values { id code name } } } }`, {}, token);
    const refreshedFacet = refreshed.payload.data.facets.items.find(item => item.code === 'garden-category');
    return new Map(refreshedFacet.values.map(value => [value.code, value.id]));
  }
  const created = await gql(`
    mutation CreateFacet($input: CreateFacetInput!) {
      createFacet(input: $input) {
        id
        values {
          id
          code
          name
        }
      }
    }
  `, {
    input: {
      code: 'garden-category',
      isPrivate: false,
      translations: [{ languageCode: 'en', name: 'Kategoria' }],
      values: labels.map(([code, label]) => ({
        code,
        translations: [{ languageCode: 'en', name: label }],
      })),
    },
  }, token);
  return new Map(created.payload.data.createFacet.values.map(value => [value.code, value.id]));
}

async function ensureShippingMethods(token) {
  const existing = await gql(`query { shippingMethods { items { id code name } } }`, {}, token);
  const methods = [
    { code: 'kurier-pl', name: 'Kurier - cala Polska', description: 'Dostawa roslin i akcesoriow pod wskazany adres.', rate: 1899 },
  ];
  for (const method of methods) {
    if (existing.payload.data.shippingMethods.items.some(item => item.code === method.code)) continue;
    await gql(`
      mutation CreateShippingMethod($input: CreateShippingMethodInput!) {
        createShippingMethod(input: $input) {
          id
          code
        }
      }
    `, {
      input: {
        code: method.code,
        fulfillmentHandler: 'manual-fulfillment',
        checker: {
          code: 'default-shipping-eligibility-checker',
          arguments: [{ name: 'orderMinimum', value: '0' }],
        },
        calculator: {
          code: 'default-shipping-calculator',
          arguments: [
            { name: 'rate', value: String(method.rate) },
            { name: 'includesTax', value: 'include' },
            { name: 'taxRate', value: '0' },
          ],
        },
        translations: [{
          languageCode: 'en',
          name: method.name,
          description: method.description,
        }],
      },
    }, token);
    console.log(`Created shipping method ${method.name}`);
  }
}

async function ensurePaymentMethods(token) {
  const existing = await gql(`query { paymentMethods { items { id code name } } }`, {}, token);
  const methods = [
    { code: 'payment-on-confirmation', name: 'Platnosc po potwierdzeniu', description: 'Potwierdzimy dostepnosc, dostawe i platnosc po zlozeniu zamowienia.' },
  ];
  for (const method of methods) {
    if (existing.payload.data.paymentMethods.items.some(item => item.code === method.code)) continue;
    await gql(`
      mutation CreatePaymentMethod($input: CreatePaymentMethodInput!) {
        createPaymentMethod(input: $input) {
          id
          code
        }
      }
    `, {
      input: {
        code: method.code,
        enabled: true,
        handler: {
          code: 'dummy-payment-handler',
          arguments: [{ name: 'automaticSettle', value: 'true' }],
        },
        translations: [{
          languageCode: 'en',
          name: method.name,
          description: method.description,
        }],
      },
    }, token);
    console.log(`Created payment method ${method.name}`);
  }
}

async function seed() {
  const token = await authenticate();
  const taxCategoryId = await ensureTaxCategory(token);
  await ensureCountryZoneAndTaxRate(token, taxCategoryId);
  const categoryFacetValues = await ensureCategoryFacet(token);
  await ensureShippingMethods(token);
  await ensurePaymentMethods(token);

  for (const product of products) {
    const existing = await gql(`
      query Product($slug: String!) {
        product(slug: $slug) {
          id
          slug
          variants {
            id
            sku
          }
        }
      }
    `, { slug: product.slug }, token);

    const facetValueId = categoryFacetValues.get(product.category);
    let productId = existing.payload.data.product?.id;
    const hasVariant = existing.payload.data.product?.variants?.some(variant => variant.sku === product.sku);

    if (!productId) {
      const createdProduct = await gql(`
        mutation CreateProduct($input: CreateProductInput!) {
          createProduct(input: $input) {
            id
            name
          }
        }
      `, {
        input: {
          enabled: true,
          facetValueIds: facetValueId ? [facetValueId] : [],
          translations: [{
            languageCode: 'en',
            name: product.name,
            slug: product.slug,
            description: product.description,
          }],
        },
      }, token);
      productId = createdProduct.payload.data.createProduct.id;
      console.log(`Created ${product.name}`);
    } else {
      await gql(`
        mutation UpdateProduct($input: UpdateProductInput!) {
          updateProduct(input: $input) {
            id
            name
          }
        }
      `, {
        input: {
          id: productId,
          enabled: true,
          facetValueIds: facetValueId ? [facetValueId] : [],
          translations: [{
            languageCode: 'en',
            name: product.name,
            slug: product.slug,
            description: product.description,
          }],
        },
      }, token);
      console.log(`Updated ${product.name}`);
    }

    if (hasVariant) {
      console.log(`Skipping variant ${product.name}`);
      continue;
    }

    await gql(`
      mutation CreateProductVariants($input: [CreateProductVariantInput!]!) {
        createProductVariants(input: $input) {
          id
          name
          sku
        }
      }
    `, {
      input: [{
        productId,
        enabled: true,
        sku: product.sku,
        price: product.price,
        taxCategoryId,
        stockOnHand: product.stock,
        trackInventory: 'TRUE',
        translations: [{ languageCode: 'en', name: product.name }],
      }],
    }, token);

    console.log(`Created variant ${product.name}`);
  }
}

seed().catch(error => {
  console.error(error);
  process.exit(1);
});
