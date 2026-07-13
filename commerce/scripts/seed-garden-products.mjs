const endpoint = process.env.VENDURE_ADMIN_API_URL || 'http://commerce-server:3000/admin-api';
const username = process.env.VENDURE_SUPERADMIN_USERNAME || process.env.SUPERADMIN_USERNAME || 'superadmin';
const password = process.env.VENDURE_SUPERADMIN_PASSWORD || process.env.SUPERADMIN_PASSWORD || 'superadmin';
const vendureHost = process.env.VENDURE_SHOP_HOST || 'sklep.ogrodio.localhost';

const products = [
  {
    name: 'Borówki bez błędów - e-book PDF + EPUB',
    slug: 'borowki-bez-bledow-ebook',
    sku: 'OG-EBK-BOR-001',
    category: 'ebooki',
    categoryLabel: 'E-booki',
    price: 3900,
    stock: 9999,
    description: 'Borówki bez błędów to praktyczny e-book dla osób, które chcą posadzić borówkę, poprawić kwaśną glebę albo uratować słaby krzew bez zgadywania. W środku znajdziesz plan przygotowania stanowiska, kontrolę pH, sadzenie, podlewanie, nawożenie, cięcie, diagnozę najczęstszych problemów oraz checklisty do pracy w ogrodzie. Otrzymujesz PDF do druku i EPUB na czytnik. Pliki wysyłamy po potwierdzeniu płatności.',
  },
  {
    name: 'Pomidory bez błędów - e-book PDF + EPUB',
    slug: 'pomidory-bez-bledow-ebook',
    sku: 'OG-EBK-POM-001',
    category: 'ebooki',
    categoryLabel: 'E-booki',
    price: 3900,
    stock: 9999,
    description: 'Pomidory bez błędów to 45-stronicowy praktyczny e-book dla osób uprawiających pomidory w gruncie, tunelu lub donicy. Prowadzi od wyboru odmiany i rozsady przez sadzenie, podlewanie, nawożenie oraz prowadzenie rośliny aż po zbiory. W środku są trzy gotowe plany uprawy, kalendarz sezonu, diagnostyka liści, kwiatów, owoców i korzeni oraz karty ratunkowe na najczęstsze problemy. Otrzymujesz PDF do druku i EPUB na czytnik. Pliki wysyłamy po potwierdzeniu płatności.',
  },
];

async function gql(query, variables = {}, token) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      host: vendureHost,
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
    { code: 'kurier-pl', name: 'Kurier - cała Polska', description: 'Dostawa produktów fizycznych pod wskazany adres.', rate: 1899 },
    { code: 'dostawa-cyfrowa', name: 'Dostawa cyfrowa', description: 'PDF i EPUB po potwierdzeniu płatności.', rate: 0 },
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
    { code: 'payment-on-confirmation', name: 'Przelew tradycyjny', description: 'Po złożeniu zamówienia otrzymasz dane do przelewu. E-book wysyłamy po zaksięgowaniu płatności.' },
  ];
  for (const method of methods) {
    const current = existing.payload.data.paymentMethods.items.find(item => item.code === method.code);
    if (current) {
      await gql(`
        mutation UpdatePaymentMethod($input: UpdatePaymentMethodInput!) {
          updatePaymentMethod(input: $input) {
            id
            code
          }
        }
      `, {
        input: {
          id: current.id,
          code: method.code,
          enabled: true,
          handler: {
            code: 'manual-bank-transfer-handler',
            arguments: [],
          },
          translations: [{
            languageCode: 'en',
            name: method.name,
            description: method.description,
          }],
        },
      }, token);
      console.log(`Updated payment method ${method.name}`);
      continue;
    }
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
          code: 'manual-bank-transfer-handler',
          arguments: [],
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
