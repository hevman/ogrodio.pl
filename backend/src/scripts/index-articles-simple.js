const { Pool } = require('pg');
const { articleToMeiliDocument } = require('./article-content');

const pool = new Pool({
  host: process.env.DB_HOST || 'garden-backend-postgres',
  port: parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'garden_backend',
  user: process.env.DB_USER || 'garden',
  password: process.env.DB_PASSWORD || 'garden',
});

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://meilisearch:7700';
const MEILISEARCH_MASTER_KEY = process.env.MEILISEARCH_MASTER_KEY || '';

async function fetchMeili(endpoint, options = {}) {
  const url = `${MEILISEARCH_HOST}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
  };
  
  if (MEILISEARCH_MASTER_KEY) {
    headers['Authorization'] = `Bearer ${MEILISEARCH_MASTER_KEY}`;
  }

  const response = await fetch(url, {
    ...options,
    headers,
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Meilisearch error: ${response.status} - ${errorText}`);
  }

  return response.json();
}

async function indexArticles() {
  try {
    console.log('📊 Pobieram artykuły z bazy danych...');
    
    const result = await pool.query(
      "SELECT * FROM articles WHERE status = 'published'",
    );

    console.log(`📄 Znaleziono ${result.rows.length} opublikowanych artykułów`);

    if (result.rows.length === 0) {
      console.log('⚠️  Brak artykułów do indeksowania');
      return;
    }

    const documents = result.rows.map((article) => articleToMeiliDocument(article));

    console.log('📤 Wysyłam do Meilisearch...');
    
    await fetchMeili('/indexes/articles/documents', {
      method: 'POST',
      body: JSON.stringify(documents),
    });

    console.log(`✅ Zindeksowano ${documents.length} artykułów w Meilisearch`);
  } catch (error) {
    console.error('❌ Błąd podczas indeksowania:', error.message);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

indexArticles();
