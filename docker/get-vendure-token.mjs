/**
 * Tworzy API token w Vendure i drukuje go na stdout.
 * Uruchom: docker exec garden-commerce-server node /tmp/get-vendure-token.mjs
 */

import http from 'http';

function gql(query, cookie = '') {
  return new Promise((resolve, reject) => {
    const data = JSON.stringify({ query });
    const req = http.request({
      hostname: 'localhost',
      port: 3000,
      path: '/admin-api',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(data),
        ...(cookie ? { 'Cookie': cookie } : {}),
      },
    }, res => {
      let body = '';
      const setCookie = res.headers['set-cookie']?.[0]?.split(';')[0] ?? '';
      res.on('data', d => body += d);
      res.on('end', () => resolve({ data: JSON.parse(body), cookie: setCookie }));
    });
    req.on('error', reject);
    req.write(data);
    req.end();
  });
}

// 1. Zaloguj
const login = await gql(
  'mutation { login(username: "superadmin", password: "superadmin") { ... on CurrentUser { id identifier } } }',
);
const cookie = login.cookie;
console.log('Zalogowano jako:', login.data?.data?.login?.identifier);

// 2. Utwórz API key
const createKey = await gql(
  `mutation {
    createRole(input: {
      code: "garden-panel-admin",
      description: "Panel Garden - dostep do Admin API",
      permissions: [
        ReadOrder, UpdateOrder, ReadProduct, UpdateProduct,
        ReadCustomer, UpdateCustomer, ReadCatalog, UpdateCatalog,
        ReadPromotion, UpdatePromotion, ReadShipping, UpdateShipping,
        ReadPaymentMethod, ReadStockLocation, ReadTag,
        ReadChannel, ReadAdministrator
      ]
    }) {
      id
      code
    }
  }`,
  cookie,
);
console.log('Rola:', JSON.stringify(createKey.data?.data?.createRole ?? createKey.data?.errors));

// 3. Utwórz administratora z tokenem
const createAdmin = await gql(
  `mutation {
    createAdministrator(input: {
      firstName: "Panel"
      lastName: "Garden"
      emailAddress: "panel@garden.internal"
      password: "PanelGarden2026!"
      roleIds: ["${createKey.data?.data?.createRole?.id ?? '1'}"]
    }) {
      id
      emailAddress
    }
  }`,
  cookie,
);
console.log('Admin:', JSON.stringify(createAdmin.data?.data?.createAdministrator ?? createAdmin.data?.errors));

// 4. Zaloguj jako nowy admin i pobierz token sesji
const adminLogin = await gql(
  'mutation { login(username: "panel@garden.internal", password: "PanelGarden2026!") { ... on CurrentUser { id identifier } ... on InvalidCredentialsError { message } } }',
);
console.log('Login panelu:', JSON.stringify(adminLogin.data));
console.log('');
console.log('=== VENDURE_ADMIN_TOKEN (cookie session) ===');
console.log('Vendure używa cookie auth, nie Bearer token.');
console.log('NestJS musi logować się osobno przez API.');
console.log('');
console.log('Zalecany: użyj superadmin credentials w NestJS env:');
console.log('VENDURE_ADMIN_USER=superadmin');
console.log('VENDURE_ADMIN_PASS=superadmin');
