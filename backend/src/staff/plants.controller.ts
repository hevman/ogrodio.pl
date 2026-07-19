import { Controller, Get, Query } from '@nestjs/common';
import { MeilisearchService } from './meilisearch.service';
import { PlantContentService } from './plant-content.service';

@Controller('api/plants')
export class PlantsController {
  constructor(
    private readonly content: PlantContentService,
    private readonly meilisearch: MeilisearchService,
  ) {}

  @Get()
  list() {
    return this.content.list();
  }

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('group') group?: string,
    @Query('limit') limit?: string,
  ) {
    if (!q?.trim()) return { hits: [], total: 0 };
    const max = limit ? Number(limit) : 20;
    const result = await this.meilisearch.searchPlants(q, { group, limit: max });
    return Array.isArray(result.hits) && result.hits.length
      ? result
      : this.content.search(q, group, max);
  }
}
