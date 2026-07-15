import { Injectable, Logger, NotFoundException, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync, statSync, watch, FSWatcher } from 'fs';
import { join } from 'path';
import { MeilisearchService } from './meilisearch.service';

type ContentArticle = Record<string, any> & {
  slug: string;
  title: string;
  topic: string;
  status: string;
};

@Injectable()
export class ArticleContentService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(ArticleContentService.name);
  private articles: ContentArticle[] = [];
  private bySlug: Map<string, ContentArticle> = new Map();
  private readonly root = join(process.cwd(), 'content/articles');
  private watchers: FSWatcher[] = [];
  private reloadTimer: NodeJS.Timeout | null = null;

  constructor(private readonly meili: MeilisearchService) {
    this.reload();
  }

  async onModuleInit() {
    await this.indexMeili();
    this.startWatching();
  }

  onModuleDestroy() {
    if (this.reloadTimer) clearTimeout(this.reloadTimer);
    for (const watcher of this.watchers) watcher.close();
    this.watchers = [];
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

  // ── Watching ────────────────────────────────────────────────────────────────

  private startWatching() {
    if (!existsSync(this.root)) return;

    // Watch root + every immediate subdirectory (calendar, sowing, guides, …)
    const dirs = [this.root];
    for (const entry of readdirSync(this.root, { withFileTypes: true })) {
      if (entry.isDirectory()) dirs.push(join(this.root, entry.name));
    }

    for (const dir of dirs) {
      try {
        const watcher = watch(dir, (event, filename) => {
          if (filename && filename.endsWith('.json')) {
            this.scheduleReload();
          }
        });
        this.watchers.push(watcher);
      } catch (err: any) {
        this.logger.warn(`Nie można obserwować katalogu ${dir}: ${err.message}`);
      }
    }

    this.logger.log(`Watching ${dirs.length} director${dirs.length === 1 ? 'y' : 'ies'} for article changes`);
  }

  /** Debounce — czekamy 300 ms po ostatniej zmianie żeby edytor zdążył zapisać plik */
  private scheduleReload() {
    if (this.reloadTimer) clearTimeout(this.reloadTimer);
    this.reloadTimer = setTimeout(async () => {
      this.reloadTimer = null;
      const prev = this.articles.length;
      this.reload();
      this.logger.log(`Articles reloaded: ${prev} → ${this.articles.length}`);
      await this.indexMeili();
    }, 300);
  }

  // ── Data loading ─────────────────────────────────────────────────────────────

  private reload() {
    if (!existsSync(this.root)) {
      this.logger.error(`Brak katalogu z artykulami: ${this.root}`);
      return;
    }

    try {
      const files = this.collectJsonFiles(this.root);
      const slugs = new Set<string>();
      const loaded: ContentArticle[] = [];

      for (const filePath of files) {
        try {
          const article = JSON.parse(readFileSync(filePath, 'utf8')) as ContentArticle;

          if (!article.slug || !article.title || !article.topic) {
            this.logger.warn(`Pominięto nieprawidłowy artykuł (brak slug/title/topic): ${filePath}`);
            continue;
          }
          if (slugs.has(article.slug)) {
            this.logger.warn(`Pominięto powtórzony slug "${article.slug}": ${filePath}`);
            continue;
          }
          slugs.add(article.slug);

          const fileDate = statSync(filePath).mtime.toISOString();
          loaded.push({
            ...article,
            status: article.status ?? 'published',
            created_at: article.created_at ?? article.published_at ?? fileDate,
            updated_at: article.updated_at ?? article.published_at ?? fileDate,
          });
        } catch (err: any) {
          this.logger.warn(`Pominięto uszkodzony plik JSON: ${filePath} — ${err.message}`);
        }
      }

      const published = loaded
        .filter((a) => a.status === 'published')
        .sort((a, b) => b.updated_at.localeCompare(a.updated_at));

      this.articles = published;
      this.bySlug = new Map(published.map((a) => [a.slug, a]));
    } catch (err: any) {
      this.logger.error(`Błąd podczas ładowania artykułów: ${err.message}`);
    }
  }

  private async indexMeili() {
    try {
      await this.meili.indexArticles(this.articles);
      this.logger.log(`Meilisearch: zaindeksowano ${this.articles.length} artykułów`);
    } catch (err: any) {
      this.logger.warn(`Meilisearch indexing failed: ${err.message}`);
    }
  }

  private collectJsonFiles(dir: string): string[] {
    return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
      const fullPath = join(dir, entry.name);
      if (entry.isDirectory()) return this.collectJsonFiles(fullPath);
      return entry.isFile() && entry.name.endsWith('.json') ? [fullPath] : [];
    });
  }

  // ── Search helpers ───────────────────────────────────────────────────────────

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
