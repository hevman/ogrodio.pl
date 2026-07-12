const vendureShopApiUrl = process.env.VENDURE_SHOP_API_URL || 'http://127.0.0.1:8080/shop-api';
const vendureShopHost = process.env.VENDURE_SHOP_HOST || 'sklep.ogrodio.localhost';
const meiliHost = process.env.MEILISEARCH_HOST || 'http://127.0.0.1:7700';
const meiliKey = process.env.MEILISEARCH_MASTER_KEY || 'garden-meili-local-key';
const indexName = 'garden_products';

async function vendureShop(query, variables = {}) {
  const response = await fetch(vendureShopApiUrl, {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      host: vendureShopHost,
    },
    body: JSON.stringify({ query, variables }),
  });
  const payload = await response.json();
  if (!response.ok || payload.errors?.length) {
    throw new Error(payload.errors?.map(error => error.message).join('\n') || response.statusText);
  }
  return payload.data;
}

async function meili(path, options = {}) {
  const response = await fetch(`${meiliHost}${path}`, {
    ...options,
    headers: {
      authorization: `Bearer ${meiliKey}`,
      'content-type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const text = await response.text();
  const payload = text ? JSON.parse(text) : {};
  if (!response.ok) {
    throw new Error(payload.message || text || response.statusText);
  }
  return payload;
}

async function waitForTask(taskUid) {
  for (let index = 0; index < 60; index += 1) {
    const task = await meili(`/tasks/${taskUid}`);
    if (task.status === 'succeeded') return task;
    if (task.status === 'failed') throw new Error(task.error?.message || 'Meilisearch task failed');
    await new Promise(resolve => setTimeout(resolve, 500));
  }
  throw new Error(`Timed out waiting for Meilisearch task ${taskUid}`);
}

function categorySort(category) {
  const order = ['ebooki', 'ziola', 'balkon-i-taras', 'rosliny-domowe', 'ziemie-i-nawozy', 'donice-i-oslonki', 'nawadnianie'];
  const position = order.indexOf(category);
  return position === -1 ? 99 : position;
}

function merchandising(product, variant, category) {
  const rules = {
    'borowki-bez-bledow-ebook': { badge: 'Nowość', isNew: true, bestseller: true },
    'bazylia-genovese': { badge: 'Hit', oldPrice: 1590, bestseller: true },
    'lawenda-waskolistna': { badge: '-15%', oldPrice: 2190, promotion: true },
    'zestaw-balkonowy-start': { badge: 'Bestseller', oldPrice: 5990, bestseller: true, promotion: true },
    'ziemia-uniwersalna-20l': { badge: 'Cena sezonu', oldPrice: 2190, promotion: true },
    'zestaw-kroplujacy-balkonowy': { badge: 'Nowosc', isNew: true },
  };
  const rule = rules[product.slug] || {};
  return {
    brand: category === 'ebooki' ? 'Ogrodio E-booki' : category === 'nawadnianie' || category === 'donice-i-oslonki' ? 'Ogrodio Tools' : 'Ogrodio',
    badge: rule.badge || '',
    oldPrice: rule.oldPrice ? rule.oldPrice / 100 : null,
    isPromotion: Boolean(rule.promotion || rule.oldPrice),
    isNew: Boolean(rule.isNew),
    isBestseller: Boolean(rule.bestseller),
    deliveryTag: category === 'ebooki' ? 'PDF + EPUB po płatności' : category === 'rosliny-domowe' || category === 'donice-i-oslonki' ? 'Kurier 24-48 h' : 'Wysylka po potwierdzeniu',
  };
}

async function indexProducts() {
  const data = await vendureShop(`
    query Products {
      products(options: { take: 100 }) {
        items {
          id
          slug
          name
          description
          featuredAsset {
            preview
          }
          facetValues {
            id
            name
            code
            facet {
              code
              name
            }
          }
          variants {
            id
            name
            sku
            priceWithTax
            stockLevel
          }
        }
      }
    }
  `);

  const documents = data.products.items.flatMap(product => {
    const category = product.facetValues?.find(value => value.facet.code === 'garden-category');
    return product.variants.map(variant => {
      const categoryCode = category?.code || 'produkty';
      return {
        id: variant.id,
        productId: product.id,
        variantId: variant.id,
        slug: product.slug,
        sku: variant.sku,
        name: product.variants.length > 1 ? `${product.name} - ${variant.name}` : product.name,
        description: product.description || 'Produkt dostepny w sklepie Ogrodio.',
        category: categoryCode,
        categoryLabel: category?.name || 'Produkty',
        categorySort: categorySort(categoryCode),
        price: variant.priceWithTax / 100,
        stock: variant.stockLevel,
        image: product.slug === 'borowki-bez-bledow-ebook' ? '/products/ebooks/borowki-bez-bledow/cover.png' : product.featuredAsset?.preview,
        ...merchandising(product, variant, categoryCode),
      };
    });
  });

  await meili(`/indexes/${indexName}`, {
    method: 'PATCH',
    body: JSON.stringify({ primaryKey: 'id' }),
  }).catch(async error => {
    if (!String(error.message).includes('index_not_found')) throw error;
    const task = await meili('/indexes', {
      method: 'POST',
      body: JSON.stringify({ uid: indexName, primaryKey: 'id' }),
    });
    await waitForTask(task.taskUid);
  });

  const settingsTask = await meili(`/indexes/${indexName}/settings`, {
    method: 'PATCH',
    body: JSON.stringify({
      searchableAttributes: ['name', 'description', 'categoryLabel', 'sku'],
      displayedAttributes: ['id', 'productId', 'variantId', 'slug', 'sku', 'name', 'description', 'category', 'categoryLabel', 'price', 'stock', 'image', 'brand', 'badge', 'oldPrice', 'isPromotion', 'isNew', 'isBestseller', 'deliveryTag'],
      filterableAttributes: ['category', 'stock', 'slug', 'price', 'brand', 'isPromotion', 'isNew', 'isBestseller'],
      sortableAttributes: ['categorySort', 'name', 'price'],
      rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
    }),
  });
  await waitForTask(settingsTask.taskUid);

  const deleteTask = await meili(`/indexes/${indexName}/documents`, { method: 'DELETE' });
  await waitForTask(deleteTask.taskUid);

  const addTask = await meili(`/indexes/${indexName}/documents?primaryKey=id`, {
    method: 'POST',
    body: JSON.stringify(documents),
  });
  await waitForTask(addTask.taskUid);

  console.log(`Indexed ${documents.length} products in Meilisearch`);
}

indexProducts().catch(error => {
  console.error(error);
  process.exit(1);
});
