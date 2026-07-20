import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync, watch, FSWatcher } from 'fs';
import { join } from 'path';

export type ContentAlertSignal = {
  year: number;
  month: string;
  sourceDate: string;
  sourceTitle: string;
  sourceUrl: string;
  region: string;
  observedOn: string;
  interpretation: string;
};

export type ContentAlert = Record<string, any> & {
  slug: string;
  title: string;
  threatType: string;
  organism: string;
  status: string;
  severity: string;
  confidence: string;
  plantSlugs: string[];
  plantNames: string[];
  typicalMonths: string[];
  signals: ContentAlertSignal[];
  symptoms: string[];
  gardenAction: string;
  whatNotToDo: string;
  articleHref: string | null;
  updated_at: string;
};

@Injectable()
export class AlertContentService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(AlertContentService.name);
  private readonly root = join(process.cwd(), 'content/alerts');
  private alerts: ContentAlert[] = [];
  private watcher: FSWatcher | null = null;
  private reloadTimer: NodeJS.Timeout | null = null;

  constructor() {
    this.reload();
  }

  onModuleInit() {
    this.startWatching();
  }

  onModuleDestroy() {
    if (this.reloadTimer) clearTimeout(this.reloadTimer);
    this.watcher?.close();
  }

  list(filters: { year?: number; month?: string; plantSlug?: string } = {}) {
    return this.alerts.filter((alert) => {
      if (filters.plantSlug && !alert.plantSlugs.includes(filters.plantSlug)) return false;
      if (filters.year && !alert.signals.some((signal) => signal.year === filters.year)) return false;
      if (filters.month && !alert.signals.some((signal) => signal.month === filters.month)) return false;
      return true;
    });
  }

  byPlant(plantSlug: string, filters: { year?: number; month?: string } = {}) {
    return this.list({ ...filters, plantSlug });
  }

  current(date = new Date()) {
    const year = date.getFullYear();
    const month = this.romanMonth(date.getMonth());
    return this.list({ year, month });
  }

  private startWatching() {
    if (!existsSync(this.root)) return;
    try {
      this.watcher = watch(this.root, (event, fileName) => {
        if (fileName && fileName.endsWith('.json')) this.scheduleReload();
      });
      this.logger.log(`Watching alert content: ${this.root}`);
    } catch (err: any) {
      this.logger.warn(`Cannot watch alert content directory: ${err.message}`);
    }
  }

  private scheduleReload() {
    if (this.reloadTimer) clearTimeout(this.reloadTimer);
    this.reloadTimer = setTimeout(() => {
      this.reloadTimer = null;
      const previousCount = this.alerts.length;
      this.reload();
      this.logger.log(`Alerts reloaded: ${previousCount} -> ${this.alerts.length}`);
    }, 300);
  }

  private reload() {
    if (!existsSync(this.root)) {
      this.logger.warn(`Missing alert content directory: ${this.root}`);
      this.alerts = [];
      return;
    }

    const slugs = new Set<string>();
    const loaded: ContentAlert[] = [];
    for (const file of readdirSync(this.root).filter((entry) => entry.endsWith('.json')).sort()) {
      const filePath = join(this.root, file);
      try {
        const alert = JSON.parse(readFileSync(filePath, 'utf8')) as ContentAlert;
        if (!this.isValid(alert) || slugs.has(alert.slug)) {
          this.logger.warn(`Skipped invalid seasonal alert: ${file}`);
          continue;
        }
        slugs.add(alert.slug);
        loaded.push(alert);
      } catch (err: any) {
        this.logger.warn(`Skipped broken alert file ${file}: ${err.message}`);
      }
    }

    this.alerts = loaded
      .filter((alert) => alert.status === 'published')
      .sort((a, b) => this.latestSourceDate(b).localeCompare(this.latestSourceDate(a)));
  }

  private isValid(alert: ContentAlert) {
    return Boolean(
      alert.slug &&
      alert.title &&
      alert.threatType &&
      alert.organism &&
      Array.isArray(alert.plantSlugs) &&
      Array.isArray(alert.typicalMonths) &&
      Array.isArray(alert.signals) &&
      alert.signals.every((signal) => signal.year && signal.month && signal.sourceDate && signal.sourceUrl),
    );
  }

  private latestSourceDate(alert: ContentAlert) {
    return alert.signals
      .map((signal) => signal.sourceDate)
      .sort()
      .at(-1) || '';
  }

  private romanMonth(index: number) {
    return ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'][index];
  }
}
