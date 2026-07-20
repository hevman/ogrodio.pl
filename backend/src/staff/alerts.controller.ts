import { Controller, Get, Param, Query } from '@nestjs/common';
import { AlertContentService } from './alert-content.service';

@Controller('api/alerts')
export class AlertsController {
  constructor(private readonly content: AlertContentService) {}

  @Get()
  list(
    @Query('year') year?: string,
    @Query('month') month?: string,
    @Query('plantSlug') plantSlug?: string,
  ) {
    return this.content.list({
      year: year ? Number(year) : undefined,
      month,
      plantSlug,
    });
  }

  @Get('current')
  current() {
    return this.content.current();
  }

  @Get('plant/:slug')
  byPlant(
    @Param('slug') slug: string,
    @Query('year') year?: string,
    @Query('month') month?: string,
  ) {
    return this.content.byPlant(slug, {
      year: year ? Number(year) : undefined,
      month,
    });
  }
}
