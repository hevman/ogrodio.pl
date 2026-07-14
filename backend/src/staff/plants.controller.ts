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
    return this.meili.searchPlants(q, {
      group,
      limit: limit ? Number(limit) : 20,
    });
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
}
