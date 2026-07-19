import { Controller, Get, OnModuleInit, Logger, Query } from '@nestjs/common';
import { existsSync, readdirSync, readFileSync } from 'fs';
import { join } from 'path';
import { MeilisearchService } from './meilisearch.service';

/**
 * Publiczny kontroler roślin.
 * Dane ładowane z frontend/src/content/plants/*.json (te same pliki co Next.js).
 * Indeksowane w Meilisearch przy starcie.
 */
@Controller('api/plants')
export class PlantsController implements OnModuleInit {
  private readonly logger = new Logger(PlantsController.name);
  private plants: any[] = [];

  constructor(private readonly meili: MeilisearchService) {}

  onModuleInit() {
    this.plants = this.loadPlants();
    this.meili.indexPlants(this.plants).then(() => {
      this.logger.log(`Auto-indexed ${this.plants.length} plants in Meilisearch`);
    }).catch((err: any) => {
      this.logger.warn(`Plant auto-indexing failed: ${err.message}`);
    });
  }

  @Get()
  list() {
    return this.plants;
  }

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('group') group?: string,
    @Query('limit') limit?: string,
  ) {
    if (!q?.trim()) return { hits: [], total: 0 };
    const max = limit ? Number(limit) : 20;
    const result = await this.meili.searchPlants(q, {
      group,
      limit: max,
    });

    if (Array.isArray(result.hits) && result.hits.length > 0) {
      return result;
    }

    return this.searchLocalPlants(q, group, max);
  }

  private loadPlants(): any[] {
    // W kontenerze Docker: /app/content/plants (skopiowane przez Dockerfile)
    // W dev lokalnie: ../frontend/src/content/plants
    const candidates = [
      join(process.cwd(), 'content/plants'),
      join(process.cwd(), '../frontend/src/content/plants'),
    ];

    const dir = candidates.find(existsSync);
    if (!dir) {
      this.logger.warn(`Plants directory not found, searched: ${candidates.join(', ')}`);
      return [];
    }

    return readdirSync(dir)
      .filter(f => f.endsWith('.json'))
      .map(f => {
        try {
          return JSON.parse(readFileSync(join(dir, f), 'utf8'));
        } catch {
          this.logger.warn(`Failed to parse plant file: ${f}`);
          return null;
        }
      })
      .filter(Boolean);
  }

  private searchLocalPlants(query: string, group?: string, limit = 20) {
    const terms = this.normalize(query).split(/\s+/).filter(Boolean);
    if (!terms.length) return { hits: [], total: 0 };

    const matches = this.plants
      .filter((plant) => !group || plant.group === group)
      .map((plant) => ({ plant, score: this.scorePlant(plant, terms) }))
      .filter(({ score }) => score > 0)
      .sort((a, b) => b.score - a.score || String(a.plant.name).localeCompare(String(b.plant.name), 'pl'));

    return {
      hits: matches.slice(0, Math.min(Math.max(limit, 1), 50)).map(({ plant }) => plant),
      total: matches.length,
    };
  }

  private scorePlant(plant: any, terms: string[]) {
    const name = this.normalize(String(plant.name || ''));
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
    return value
      .toLocaleLowerCase('pl')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');
  }
}
