import { Injectable, Logger } from '@nestjs/common';
import { articleToMeiliDocument } from './article-content';

@Injectable()
export class MeilisearchService {
  private readonly logger = new Logger(MeilisearchService.name);
  private readonly host: string;
  private readonly apiKey: string;
  private readonly articlesIndex = 'articles';

  constructor() {
    this.host = process.env.MEILISEARCH_HOST || 'http://localhost:7700';
    this.apiKey = process.env.MEILISEARCH_MASTER_KEY || '';
    this.initializeIndex();
  }

  private async fetchMeili(endpoint: string, options: any = {}) {
    const url = `${this.host}${endpoint}`;
    const headers: any = {
      'Content-Type': 'application/json',
    };
    
    if (this.apiKey) {
      headers['Authorization'] = `Bearer ${this.apiKey}`;
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

  private async initializeIndex() {
    try {
      // Create index if not exists
      await this.fetchMeili(`/indexes`, {
        method: 'POST',
        body: JSON.stringify({
          uid: this.articlesIndex,
          primaryKey: 'id',
        }),
      });

      // Update settings
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
      this.logger.error(`Failed to initialize Meilisearch index: ${error.message}`);
    }
  }

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

  async searchArticles(query: string, options: any = {}) {
    try {
      const searchParams: any = {
        q: query,
        limit: options.limit || 20,
        filter: 'status = published',
      };

      if (options.topic) {
        searchParams.filter += ` AND topic = "${options.topic}"`;
      }

      const results = await this.fetchMeili(
        `/indexes/${this.articlesIndex}/search`,
        {
          method: 'POST',
          body: JSON.stringify(searchParams),
        },
      );
      return results;
    } catch (error: any) {
      this.logger.error(`Failed to search articles: ${error.message}`);
      return { hits: [], total: 0 };
    }
  }

  async deleteArticle(id: number) {
    try {
      await this.fetchMeili(`/indexes/${this.articlesIndex}/documents/${id}`, {
        method: 'DELETE',
      });
      this.logger.log(`Deleted article from index: ${id}`);
    } catch (error: any) {
      this.logger.error(`Failed to delete article from index ${id}: ${error.message}`);
    }
  }
}
