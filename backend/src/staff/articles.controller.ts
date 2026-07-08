import {
  Body,
  BadRequestException,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Put,
  Query,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import type { Request } from 'express';
import { memoryStorage } from 'multer';
import { ArticleMediaService } from './article-media.service';
import { ArticlesService } from './articles.service';
import { MeilisearchService } from './meilisearch.service';
import { Permission, StaffJwtGuard } from './staff-auth.guard';

@Controller('api/articles')
export class ArticlesPublicController {
  constructor(
    private readonly articles: ArticlesService,
    private readonly meilisearch: MeilisearchService,
  ) {}

  @Get()
  listPublished() {
    return this.articles.findPublished();
  }

  @Get('topics')
  listTopics() {
    return this.articles.listTopics();
  }

  @Get('topic/:topic')
  getByTopic(@Param('topic') topic: string) {
    return this.articles.findByTopic(decodeURIComponent(topic));
  }

  @Get('search')
  async search(
    @Query('q') q: string,
    @Query('topic') topic?: string,
    @Query('limit') limit?: string,
  ) {
    if (!q) {
      return { hits: [], total: 0 };
    }
    return this.meilisearch.searchArticles(q, { topic, limit: limit ? Number(limit) : 20 });
  }

  @Get(':slug')
  getPublished(@Param('slug') slug: string) {
    return this.articles.findPublished(slug);
  }
}

@Controller('panel-api/staff/articles')
@UseGuards(StaffJwtGuard)
@Permission('articles')
export class ArticlesController {
  constructor(
    private readonly articles: ArticlesService,
    private readonly meilisearch: MeilisearchService,
    private readonly media: ArticleMediaService,
  ) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('status') status?: string,
    @Query('q') q?: string,
    @Query('topic') topic?: string,
  ) {
    return this.articles.list({
      page: page ? Number(page) : 1,
      status,
      q,
      topic,
    });
  }

  @Get(':id')
  getOne(@Param('id', ParseIntPipe) id: number) {
    return this.articles.findById(id);
  }

  @Post()
  create(@Body() body: any, @Req() req: Request) {
    return this.articles.create(body, req.staffUser!.id);
  }

  @Put(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
    @Req() req: Request,
  ) {
    return this.articles.update(id, body, req.staffUser!.id);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number, @Req() req: Request) {
    return this.articles.delete(id, req.staffUser!.id);
  }

  @Post('import')
  import(@Body() body: any, @Req() req: Request) {
    return this.articles.importFromJson(body, req.staffUser!.id);
  }

  @Post('media')
  @UseInterceptors(FileInterceptor('file', {
    storage: memoryStorage(),
    limits: { fileSize: 12 * 1024 * 1024 },
  }))
  uploadMedia(
    @UploadedFile() file: Express.Multer.File | undefined,
    @Body('name') name?: string,
  ) {
    if (!file) {
      throw new BadRequestException('Brak pliku w polu "file"');
    }

    return this.media.saveArticleImage(file, name);
  }

  @Post('index-all')
  async indexAll() {
    const articles = await this.articles.findPublished() as any[];
    await this.meilisearch.indexArticles(articles);
    return { success: true, indexed: articles.length };
  }
}
