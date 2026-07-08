import { DatabaseService } from '../database/database.service';
import { MeilisearchService } from '../staff/meilisearch.service';

async function indexArticles() {
  const db = new DatabaseService();
  const meili = new MeilisearchService();

  try {
    await db.onModuleInit();
    const result = await db.query(
      'SELECT * FROM articles WHERE status = $1',
      ['published']
    );

    const articles = result.rows;
    console.log(`Found ${articles.length} published articles`);

    await meili.indexArticles(articles);
    console.log('Articles indexed successfully');
  } catch (error: any) {
    console.error('Error indexing articles:', error.message);
    process.exit(1);
  } finally {
    await db.onModuleDestroy();
  }
}

indexArticles();
