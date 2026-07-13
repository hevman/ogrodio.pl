const fs = require('fs');
const path = require('path');
const { articleToMeiliDocument } = require('./article-content');

const ARTICLES_DIR = path.join(__dirname, '../../content/articles');
const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST || 'http://meilisearch:7700';
const MEILISEARCH_MASTER_KEY = process.env.MEILISEARCH_MASTER_KEY || '';

async function fetchMeili(endpoint, options = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (MEILISEARCH_MASTER_KEY) {
    headers.Authorization = `Bearer ${MEILISEARCH_MASTER_KEY}`;
  }

  const response = await fetch(`${MEILISEARCH_HOST}${endpoint}`, {
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Meilisearch error: ${response.status} - ${await response.text()}`);
  }

  return response.json();
}

function collectJsonFiles(dir) {
  if (!fs.existsSync(dir)) {
    throw new Error(`Brak katalogu artykulow: ${dir}`);
  }

  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) return collectJsonFiles(fullPath);
    return entry.isFile() && entry.name.endsWith('.json') ? [fullPath] : [];
  });
}

async function indexArticles() {
  try {
    const articles = collectJsonFiles(ARTICLES_DIR)
      .map((filePath) => JSON.parse(fs.readFileSync(filePath, 'utf8')))
      .filter((article) => article.status === 'published');

    if (articles.length === 0) {
      console.log('Brak opublikowanych artykulow JSON do indeksowania');
      return;
    }

    const documents = articles.map((article) => articleToMeiliDocument({
      ...article,
      id: article.slug,
    }));

    // PUT replaces the whole index, so deleted source files cannot stay searchable.
    await fetchMeili('/indexes/articles/documents', {
      method: 'PUT',
      body: JSON.stringify(documents),
    });

    console.log(`Zindeksowano ${documents.length} artykulow JSON w Meilisearch`);
  } catch (error) {
    console.error('Blad podczas indeksowania artykulow:', error.message);
    process.exit(1);
  }
}

indexArticles();
