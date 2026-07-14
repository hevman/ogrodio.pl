import { Injectable, Logger } from '@nestjs/common';
import { articleToMeiliDocument } from './article-content';

@Injectable()
export class MeilisearchService {
  private readonly logger = new Logger(MeilisearchService.name);
  private readonly host: string;
  private readonly apiKey: string;
  private readonly articlesIndex = 'articles';
  private readonly plantsIndex = 'plants';

  constructor() {
    this.host = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
    this.apiKey = process.env.MEILISEARCH_MASTER_KEY || '';
    this.initializeIndexes();
  }

  private async fetchMeili(endpoint: string, options: any = {}) {
    const url = `${this.host}${endpoint}`;
    const headers: any = { 'Content-Type': 'application/json' };
    if (this.apiKey) headers['Authorization'] = `Bearer ${this.apiKey}`;

    const response = await fetch(url, { ...options, headers });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`Meilisearch error: ${response.status} - ${errorText}`);
    }
    return response.json();
  }

  private async initializeIndexes() {
    await this.initArticlesIndex();
    await this.initPlantsIndex();
  }

  private async initArticlesIndex() {
    try {
      await this.fetchMeili(`/indexes`, {
        method: 'POST',
        body: JSON.stringify({ uid: this.articlesIndex, primaryKey: 'id' }),
      });
      await this.fetchMeili(`/indexes/${this.articlesIndex}/settings`, {
        method: 'PATCH',
        body: JSON.stringify({
          searchableAttributes: ['title', 'summary', 'content', 'topic', 'seo_description', 'seo_keywords'],
          filterableAttributes: ['topic', 'status'],
          sortableAttributes: ['updated_at'],
          rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
        }),
      });
      this.logger.log(`Meilisearch index "${this.articlesIndex}" initialized`);
    } catch (error: any) {
      this.logger.error(`Failed to initialize articles index: ${error.message}`);
    }
  }

  private async initPlantsIndex() {
    try {
      await this.fetchMeili(`/indexes`, {
        method: 'POST',
        body: JSON.stringify({ uid: this.plantsIndex, primaryKey: 'slug' }),
      });
      await this.fetchMeili(`/indexes/${this.plantsIndex}/settings`, {
        method: 'PATCH',
        body: JSON.stringify({
          searchableAttributes: ['name', 'latinName', 'summary', 'group', 'tags', 'searchIntents'],
          filterableAttributes: ['group'],
          rankingRules: ['words', 'typo', 'proximity', 'attribute', 'sort', 'exactness'],
        }),
      });
      this.logger.log(`Meilisearch index "${this.plantsIndex}" initialized`);
    } catch (error: any) {
      this.logger.error(`Failed to initialize plants index: ${error.message}`);
    }
  }

  // ─── Articles ────────────────────────────────────────────────────────────────

  async indexArticle(article: any) {
    try {
      await this.fetchMeili(`/indexes/${this.articlesIndex}/documents`, {
        method: 'POST',
        body: JSON.stringify([articleToMeiliDocument(article)]),
      });
      this.logger.log(`Indexed article: ${article.slug}`);
    } catch (error: any) {
      this.logger.error(`Failed to index article ${article.slug}: ${error.message}`);
    }
  }

  async indexArticles(articles: any[]) {
    try {
      const documents = articles.map(article => articleToMeiliDocument(article));
      await this.fetchMeili(`/indexes/${this.articlesIndex}/documents`, {
        method: 'POST',
        body: JSON.stringify(documents),
      });
      this.logger.log(`Indexed ${articles.length} articles`);
    } catch (error: any) {
      this.logger.error(`Failed to index articles: ${error.message}`);
    }
  }

  async searchArticles(query: string, options: { topic?: string; limit?: number } = {}) {
    try {
      const searchParams: any = {
        q: query,
        limit: options.limit || 20,
        filter: 'status = published',
      };
      if (options.topic) {
        searchParams.filter += ` AND topic = "${options.topic}"`;
      }
      return await this.fetchMeili(`/indexes/${this.articlesIndex}/search`, {
        method: 'POST',
        body: JSON.stringify(searchParams),
      });
    } catch (error: any) {
      this.logger.error(`Failed to search articles: ${error.message}`);
      return { hits: [], total: 0 };
    }
  }

  async deleteArticle(id: number) {
    try {
      await this.fetchMeili(`/indexes/${this.articlesIndex}/documents/${id}`, { method: 'DELETE' });
      this.logger.log(`Deleted article from index: ${id}`);
    } catch (error: any) {
      this.logger.error(`Failed to delete article from index ${id}: ${error.message}`);
    }
  }

  // ─── Plants ──────────────────────────────────────────────────────────────────

  async indexPlants(plants: any[]) {
    try {
      const documents = plants.map(p => ({
        slug: p.slug,
        name: p.name,
        latinName: p.latinName ?? '',
        summary: p.summary ?? '',
        group: p.group ?? '',
        image: p.image ?? '',
        imageAlt: p.imageAlt ?? '',
        difficulty: p.difficulty ?? '',
        harvest: p.harvest ?? '',
        tags: Array.isArray(p.tags) ? p.tags : [],
        searchIntents: Array.isArray(p.searchIntents) ? p.searchIntents : [],
      }));
      await this.fetchMeili(`/indexes/${this.plantsIndex}/documents`, {
        method: 'POST',
        body: JSON.stringify(documents),
      });
      this.logger.log(`Indexed ${documents.length} plants`);
    } catch (error: any) {
      this.logger.error(`Failed to index plants: ${error.message}`);
    }
  }

  async searchPlants(query: string, options: { group?: string; limit?: number } = {}) {
    try {
      const searchParams: any = {
        q: query,
        limit: options.limit || 20,
      };
      if (options.group) {
        searchParams.filter = `group = "${options.group}"`;
      }
      return await this.fetchMeili(`/indexes/${this.plantsIndex}/search`, {
        method: 'POST',
        body: JSON.stringify(searchParams),
      });
    } catch (error: any) {
      this.logger.error(`Failed to search plants: ${error.message}`);
      return { hits: [], total: 0 };
    }
  }
}
