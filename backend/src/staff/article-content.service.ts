import { Injectable, Logger, NotFoundException, OnModuleInit } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync, statSync } from 'fs';
import { join } from 'path';
import { MeilisearchService } from './meilisearch.service';

type ContentArticle = Record<string, any> & {
  slug: string;
  title: string;
  topic: string;
  status: string;
};

@Injectable()
export class ArticleContentService implements OnModuleInit {
  private readonly logger = new Logger(ArticleContentService.name);
  private readonly articles: ContentArticle[];
  private readonly bySlug: Map<string, ContentArticle>;

  constructor(private readonly meili: MeilisearchService) {
    this.articles = this.loadArticles();
    this.bySlug = new Map(this.articles.map((article) => [article.slug, article]));
  }

  async onModuleInit() {
    // Auto-indeksuj artykuły przy starcie — bez tego Meili search zwraca 0 wyników
    try {
      await this.meili.indexArticles(this.articles);
      this.logger.log(`Auto-indexed ${this.articles.length} articles in Meilisearch`);
    } catch (err: any) {
      this.logger.warn(`Article auto-indexing failed: ${err.message}`);
    }
  }

  listPublished() {
    return this.articles;
  }

  findPublished(slug: string) {
    const article = this.bySlug.get(slug);
    if (!article) throw new NotFoundException(`Artykul "${slug}" nie znaleziony`);
    return article;
  }

  findByTopic(topic: string) {
    return this.articles.filter((article) => article.topic === topic);
  }

  listTopics() {
    const counts = new Map<string, number>();
    for (const article of this.articles) {
      counts.set(article.topic, (counts.get(article.topic) ?? 0) + 1);
    }
    return [...counts]
      .map(([topic, count]) => ({ topic, count }))
      .sort((a, b) => b.count - a.count || a.topic.localeCompare(b.topic, 'pl'));
  }

  search(query: string, topic?: string, limit = 20) {
    const terms = this.normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return { hits: [], total: 0 };

    const matches = this.articles
      .filter((article) => !topic || article.topic === topic)
      .map((article) => ({ article, score: this.score(article, terms) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || b.article.updated_at.localeCompare(a.article.updated_at));

    return {
      hits: matches.slice(0, Math.min(Math.max(limit, 1), 50)).map(({ article }) => article),
      total: matches.length,
    };
  }

  private loadArticles() {
    const root = join(process.cwd(), 'content/articles');
    if (!existsSync(root)) {
      throw new Error(`Brak katalogu z artykulami: ${root}`);
    }

    const files = this.collectJsonFiles(root);
    const slugs = new Set<string>();
    const articles = files.map((filePath) => {
      const article = JSON.parse(readFileSync(filePath, 'utf8')) as ContentArticle;
      if (!article.slug || !article.title || !article.topic) {
        throw new Error(`Nieprawidlowy artykul: ${filePath}`);
      }
      if (slugs.has(article.slug)) {
        throw new Error(`Powtorzony slug artykulu: ${article.slug}`);
      }
      slugs.add(article.slug);

      const fileDate = statSync(filePath).mtime.toISOString();
      return {
        ...article,
        status: article.status ?? 'published',
        created_at: article.created_at ?? article.published_at ?? fileDate,
        updated_at: article.updated_at ?? article.published_at ?? fileDate,
      };
    });

    return articles
      .filter((article) => article.status === 'published')
      .sort((a, b) => b.updated_at.localeCompare(a.updated_at));
  }

  private collectJsonFiles(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) return this.collectJsonFiles(fullPath);
      return entry.isFile() && entry.name.endsWith('.json') ? [fullPath] : [];
    });
  }

  private score(article: ContentArticle, terms: string[]) {
    const title = this.normalize(article.title);
    const text = this.normalize([
      article.title,
      article.summary,
      article.topic,
      article.seo?.title,
      article.seo?.description,
      ...(article.seo?.keywords ?? []),
      ...(article.sections ?? []).flatMap((section: any) => [section.heading, ...(section.paragraphs ?? [])]),
      ...(article.faq ?? []).flatMap((item: any) => [item.question, item.answer]),
    ].filter(Boolean).join(' '));

    return terms.reduce((score, term) => score + (title.includes(term) ? 5 : text.includes(term) ? 1 : 0), 0);
  }

  private normalize(value: string) {
    return value
      .toLocaleLowerCase('pl')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
