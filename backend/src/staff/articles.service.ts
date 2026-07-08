import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { DatabaseService } from '../database/database.service';
import { AuditService } from './audit.service';
import { MeilisearchService } from './meilisearch.service';

export interface ArticleRow {
  id: number;
  slug: string;
  title: string;
  topic: string;
  summary: string;
  reading_minutes: number;
  cover_image: string;
  cover_alt: string;
  sections: any[];
  faq: any[];
  tips: any[];
  related_services: string[];
  related_articles: string[];
  related_product_ids: string[];
  seo_title: string;
  seo_description: string;
  seo_keywords: string[];
  discover: any | null;
  status: string;
  published_at: string | null;
  created_at: string;
  updated_at: string;
}

@Injectable()
export class ArticlesService {
  constructor(
    private readonly db: DatabaseService,
    private readonly audit: AuditService,
    private readonly meilisearch: MeilisearchService,
  ) {}

  // ─── Publiczne (frontend) ──────────────────────────────────────────────────

  async findPublished(slug?: string) {
    if (slug) {
      const result = await this.db.query(
        `SELECT * FROM articles WHERE slug = $1 AND status = 'published' LIMIT 1`,
        [slug],
      );
      if (!result.rows[0]) throw new NotFoundException(`Artykuł "${slug}" nie znaleziony`);
      return this.format(result.rows[0]);
    }
    const result = await this.db.query(
      `SELECT * FROM articles WHERE status = 'published' ORDER BY updated_at DESC`,
    );
    return result.rows.map(r => this.format(r));
  }

  async findByTopic(topic: string) {
    const result = await this.db.query(
      `SELECT * FROM articles WHERE status = 'published' AND topic = $1 ORDER BY updated_at DESC`,
      [topic],
    );
    return result.rows.map(r => this.format(r));
  }

  async listTopics(): Promise<{ topic: string; count: number }[]> {
    const result = await this.db.query(
      `SELECT topic, COUNT(*)::int as count FROM articles WHERE status = 'published' GROUP BY topic ORDER BY count DESC`,
    );
    return result.rows;
  }

  // ─── Panel staff ───────────────────────────────────────────────────────────

  async list(params: { page?: number; status?: string; q?: string; topic?: string }) {
    const limit = 20;
    const offset = ((params.page ?? 1) - 1) * limit;
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (params.status) {
      conditions.push(`status = $${idx++}`);
      values.push(params.status);
    }
    if (params.topic) {
      conditions.push(`topic = $${idx++}`);
      values.push(params.topic);
    }
    if (params.q) {
      conditions.push(`(title ILIKE $${idx++} OR summary ILIKE $${idx++})`);
      values.push(`%${params.q}%`, `%${params.q}%`);
      idx++;
    }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    values.push(limit, offset);

    const [rows, count] = await Promise.all([
      this.db.query(
        `SELECT id, slug, title, topic, summary, reading_minutes, cover_image,
                status, published_at, created_at, updated_at
         FROM articles ${where}
         ORDER BY updated_at DESC
         LIMIT $${idx++} OFFSET $${idx}`,
        values,
      ),
      this.db.query(
        `SELECT COUNT(*) FROM articles ${where}`,
        values.slice(0, -2),
      ),
    ]);

    return {
      total: Number(count.rows[0].count),
      page: params.page ?? 1,
      items: rows.rows,
    };
  }

  async findById(id: number) {
    const result = await this.db.query(
      `SELECT * FROM articles WHERE id = $1 LIMIT 1`,
      [id],
    );
    if (!result.rows[0]) throw new NotFoundException(`Artykuł #${id} nie znaleziony`);
    return this.format(result.rows[0]);
  }

  async findBySlug(slug: string) {
    const result = await this.db.query(
      `SELECT * FROM articles WHERE slug = $1 LIMIT 1`,
      [slug],
    );
    if (!result.rows[0]) throw new NotFoundException(`Artykuł "${slug}" nie znaleziony`);
    return this.format(result.rows[0]);
  }

  async create(body: any, staffId: number) {
    this.validate(body);
    const slug = body.slug || this.generateSlug(body.title);

    try {
      const result = await this.db.query(
        `INSERT INTO articles (
           slug, title, topic, summary, reading_minutes,
           cover_image, cover_alt, sections, faq, tips,
           related_services, related_articles, related_product_ids,
           seo_title, seo_description, seo_keywords,
           discover, status, published_at, created_by, updated_by
         ) VALUES (
           $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,$20,$20
         ) RETURNING *`,
        [
          slug,
          body.title,
          body.topic || '',
          body.summary || '',
          body.readingMinutes ?? body.reading_minutes ?? 5,
          body.coverImage ?? body.cover_image ?? '',
          body.coverAlt ?? body.cover_alt ?? '',
          JSON.stringify(body.sections ?? []),
          JSON.stringify(body.faq ?? []),
          JSON.stringify(this.normalizeTips(body.tips)),
          JSON.stringify(body.relatedServices ?? body.related_services ?? []),
          JSON.stringify(body.relatedArticles ?? body.related_articles ?? []),
          JSON.stringify(body.relatedProductIds ?? body.related_product_ids ?? []),
          body.seo?.title ?? body.seoTitle ?? body.seo_title ?? '',
          body.seo?.description ?? body.seoDescription ?? body.seo_description ?? '',
          JSON.stringify(body.seo?.keywords ?? body.seoKeywords ?? body.seo_keywords ?? []),
          JSON.stringify(body.discover ?? null),
          body.status ?? 'published',
          body.publishedAt ?? body.published_at ?? new Date().toISOString(),
          staffId,
        ],
      );

      await this.audit.log({
        staffId,
        action: 'article.created',
        entity: 'article',
        entityId: String(result.rows[0].id),
        after: { slug, title: body.title },
      });

      // Index in Meilisearch if published
      if (result.rows[0].status === 'published') {
        await this.meilisearch.indexArticle(result.rows[0]);
      }

      return this.format(result.rows[0]);
    } catch (err: any) {
      if (err.code === '23505') {
        throw new BadRequestException(`Artykuł ze slugiem "${slug}" już istnieje`);
      }
      throw err;
    }
  }

  async update(id: number, body: any, staffId: number) {
    const current = await this.findById(id);
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;

    const fields: Record<string, any> = {
      title: body.title,
      topic: body.topic,
      summary: body.summary,
      reading_minutes: body.readingMinutes ?? body.reading_minutes,
      cover_image: body.coverImage ?? body.cover_image,
      cover_alt: body.coverAlt ?? body.cover_alt,
      sections: body.sections !== undefined ? JSON.stringify(body.sections) : undefined,
      faq: body.faq !== undefined ? JSON.stringify(body.faq) : undefined,
      tips: body.tips !== undefined ? JSON.stringify(this.normalizeTips(body.tips)) : undefined,
      related_services: body.relatedServices ?? body.related_services !== undefined
        ? JSON.stringify(body.relatedServices ?? body.related_services) : undefined,
      related_articles: body.relatedArticles ?? body.related_articles !== undefined
        ? JSON.stringify(body.relatedArticles ?? body.related_articles) : undefined,
      seo_title: body.seo?.title ?? body.seoTitle ?? body.seo_title,
      seo_description: body.seo?.description ?? body.seoDescription ?? body.seo_description,
      seo_keywords: body.seo?.keywords ?? body.seoKeywords ?? body.seo_keywords !== undefined
        ? JSON.stringify(body.seo?.keywords ?? body.seoKeywords ?? body.seo_keywords) : undefined,
      discover: body.discover !== undefined ? JSON.stringify(body.discover) : undefined,
      status: body.status,
      published_at: body.publishedAt ?? body.published_at,
      updated_by: staffId,
    };

    for (const [col, val] of Object.entries(fields)) {
      if (val !== undefined) {
        updates.push(`${col} = $${idx++}`);
        values.push(val);
      }
    }

    if (!updates.length) throw new BadRequestException('Brak danych do aktualizacji');

    updates.push(`updated_at = NOW()`);
    values.push(id);

    const result = await this.db.query(
      `UPDATE articles SET ${updates.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );

    await this.audit.log({
      staffId,
      action: 'article.updated',
      entity: 'article',
      entityId: String(id),
      before: { title: current.title, status: current.status },
      after: { title: body.title ?? current.title, status: body.status ?? current.status },
    });

    // Update Meilisearch index
    if (result.rows[0].status === 'published') {
      await this.meilisearch.indexArticle(result.rows[0]);
    } else if (current.status === 'published' && result.rows[0].status !== 'published') {
      // Article was unpublished, remove from index
      await this.meilisearch.deleteArticle(id);
    }

    return this.format(result.rows[0]);
  }

  async delete(id: number, staffId: number) {
    const article = await this.findById(id);
    await this.db.query(`DELETE FROM articles WHERE id = $1`, [id]);
    await this.audit.log({
      staffId,
      action: 'article.deleted',
      entity: 'article',
      entityId: String(id),
      before: { slug: article.slug, title: article.title },
    });
    
    // Remove from Meilisearch index
    await this.meilisearch.deleteArticle(id);
    
    return { ok: true };
  }

  // ─── Import z JSON (migracja) ──────────────────────────────────────────────

  async importFromJson(data: any, staffId: number) {
    return this.create(data, staffId);
  }

  // ─── Helpers ───────────────────────────────────────────────────────────────

  private validate(body: any) {
    if (!body.title?.trim()) throw new BadRequestException('Tytuł jest wymagany');
  }

  private generateSlug(title: string): string {
    return title
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/ą/g, 'a').replace(/ć/g, 'c').replace(/ę/g, 'e')
      .replace(/ł/g, 'l').replace(/ń/g, 'n').replace(/ó/g, 'o')
      .replace(/ś/g, 's').replace(/ź/g, 'z').replace(/ż/g, 'z')
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  /** tips mogą być tablicą stringów (stary format) lub {tip: string} (nowy) */
  private normalizeTips(tips: any[]): string[] {
    if (!Array.isArray(tips)) return [];
    return tips.map(t => (typeof t === 'string' ? t : t?.tip ?? ''));
  }

  private format(row: any) {
    return {
      id: row.id,
      slug: row.slug,
      title: row.title,
      topic: row.topic,
      summary: row.summary,
      readingMinutes: row.reading_minutes,
      coverImage: row.cover_image,
      coverAlt: row.cover_alt,
      sections: row.sections,
      faq: row.faq,
      tips: row.tips,
      relatedServices: row.related_services,
      relatedArticles: row.related_articles,
      relatedProductIds: row.related_product_ids,
      inlineImage: row.inline_image ?? null,
      ganttChart: row.gantt_chart ?? null,
      varietyTable: row.variety_table ?? null,
      discover: row.discover ?? null,
      seo: {
        title: row.seo_title,
        description: row.seo_description,
        keywords: row.seo_keywords,
      },
      status: row.status,
      publishedAt: row.published_at,
      updatedAt: row.updated_at,
      createdAt: row.created_at,
    };
  }
}
