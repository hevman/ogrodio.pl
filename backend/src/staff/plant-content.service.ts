import { Injectable, Logger, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync, watch, FSWatcher } from 'fs';
import { join } from 'path';
import { MeilisearchService } from './meilisearch.service';

export type ContentPlant = Record<string, any> & {
  slug: string;
  name: string;
  group: string;
};

@Injectable()
export class PlantContentService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PlantContentService.name);
  private plants: ContentPlant[] = [];
  private bySlug = new Map<string, ContentPlant>();
  private readonly root = join(process.cwd(), 'content/plants');
  private watcher: FSWatcher | null = null;
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
    this.watcher?.close();
  }

  list() {
    return this.plants;
  }

  find(slug: string) {
    return this.bySlug.get(slug) || null;
  }

  search(query: string, group?: string, limit = 20) {
    const terms = this.normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return { hits: [], total: 0 };

    const matches = this.plants
      .filter((plant) => !group || plant.group === group)
      .map((plant) => ({ plant, score: this.score(plant, terms) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || a.plant.name.localeCompare(b.plant.name, 'pl'));

    return {
      hits: matches.slice(0, Math.min(Math.max(limit, 1), 50)).map(({ plant }) => plant),
      total: matches.length,
    };
  }

  private startWatching() {
    if (!existsSync(this.root)) return;
    try {
      this.watcher = watch(this.root, (event, fileName) => {
        if (fileName && fileName.endsWith('.json')) this.scheduleReload();
      });
      this.logger.log(`Watching plant content: ${this.root}`);
    } catch (err: any) {
      this.logger.warn(`Nie można obserwować katalogu roślin: ${err.message}`);
    }
  }

  private scheduleReload() {
    if (this.reloadTimer) clearTimeout(this.reloadTimer);
    this.reloadTimer = setTimeout(async () => {
      this.reloadTimer = null;
      const previousCount = this.plants.length;
      this.reload();
      this.logger.log(`Plants reloaded: ${previousCount} → ${this.plants.length}`);
      await this.indexMeili();
    }, 300);
  }

  private reload() {
    if (!existsSync(this.root)) {
      this.logger.error(`Brak katalogu roślin: ${this.root}`);
      return;
    }

    const slugs = new Set<string>();
    const loaded: ContentPlant[] = [];
    for (const file of readdirSync(this.root).filter((entry) => entry.endsWith('.json')).sort()) {
      try {
        const plant = JSON.parse(readFileSync(join(this.root, file), 'utf8')) as ContentPlant;
        if (!plant.slug || !plant.name || !plant.group || slugs.has(plant.slug)) {
          this.logger.warn(`Pominięto nieprawidłową kartę rośliny: ${file}`);
          continue;
        }
        slugs.add(plant.slug);
        loaded.push(plant);
      } catch (err: any) {
        this.logger.warn(`Pominięto uszkodzony plik rośliny ${file}: ${err.message}`);
      }
    }

    this.plants = loaded;
    this.bySlug = new Map(loaded.map((plant) => [plant.slug, plant]));
  }

  private async indexMeili() {
    try {
      await this.meili.indexPlants(this.plants);
      this.logger.log(`Meilisearch: zaindeksowano ${this.plants.length} roślin`);
    } catch (err: any) {
      this.logger.warn(`Plant indexing failed: ${err.message}`);
    }
  }

  private score(plant: ContentPlant, terms: string[]) {
    const name = this.normalize(plant.name);
    const text = this.normalize([
      plant.name,
      plant.latinName,
      plant.slug,
      plant.group,
      plant.summary,
      plant.difficulty,
      plant.sun,
      plant.soil,
      plant.water,
      plant.harvest,
      ...(plant.tags || []),
      ...(plant.searchIntents || []),
      ...(plant.problems || []).map((problem: any) => problem.symptom),
      ...(plant.signals || []).flatMap((signal: any) => [signal.title, signal.means, signal.action]),
    ].filter(Boolean).join(' '));
    return terms.reduce((score, term) => score + (name.includes(term) ? 5 : text.includes(term) ? 1 : 0), 0);
  }

  private normalize(value: string) {
    return value.toLocaleLowerCase('pl').normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  }
}
