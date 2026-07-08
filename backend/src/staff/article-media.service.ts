import { BadRequestException, Injectable } from '@nestjs/common';
import * as fs from 'node:fs/promises';
import * as path from 'node:path';

const sharp = require('sharp');

const ARTICLE_IMAGE_URL_PREFIX = '/images/articles/';
const ALLOWED_MIME_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);
const MAX_BASENAME_LENGTH = 90;

@Injectable()
export class ArticleMediaService {
  private readonly mediaDir = process.env.ARTICLE_MEDIA_DIR || path.join(process.cwd(), 'public/images/articles');

  async saveArticleImage(file: Express.Multer.File, requestedName?: string) {
    if (!ALLOWED_MIME_TYPES.has(file.mimetype)) {
      throw new BadRequestException('Dozwolone sa tylko pliki JPG, PNG albo WebP');
    }

    await fs.mkdir(this.mediaDir, { recursive: true });

    const baseName = this.safeBaseName(requestedName || file.originalname);
    const fileName = await this.uniqueFileName(`${baseName}.webp`);
    const thumbName = await this.uniqueFileName(`${baseName}-thumb.webp`);
    const filePath = path.join(this.mediaDir, fileName);
    const thumbPath = path.join(this.mediaDir, thumbName);

    const image = sharp(file.buffer, { failOn: 'warning' }).rotate();
    const metadata = await image.metadata();

    if (!metadata.width || !metadata.height) {
      throw new BadRequestException('Nie mozna odczytac wymiarow obrazu');
    }

    await image
      .clone()
      .resize({ width: 1800, withoutEnlargement: true })
      .webp({ quality: 82, effort: 6 })
      .toFile(filePath);

    await image
      .clone()
      .resize({ width: 720, withoutEnlargement: true })
      .webp({ quality: 78, effort: 6 })
      .toFile(thumbPath);

    return {
      url: `${ARTICLE_IMAGE_URL_PREFIX}${fileName}`,
      thumbnailUrl: `${ARTICLE_IMAGE_URL_PREFIX}${thumbName}`,
      fileName,
      thumbnailFileName: thumbName,
      originalName: file.originalname,
      width: metadata.width,
      height: metadata.height,
      mimeType: 'image/webp',
    };
  }

  private safeBaseName(value: string) {
    const parsed = path.parse(value);
    const withoutExtension = parsed.name || 'article-image';
    const normalized = withoutExtension
      .normalize('NFKD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, MAX_BASENAME_LENGTH);

    return normalized || 'article-image';
  }

  private async uniqueFileName(fileName: string) {
    const parsed = path.parse(fileName);
    let candidate = fileName;
    let counter = 2;

    while (await this.exists(path.join(this.mediaDir, candidate))) {
      candidate = `${parsed.name}-${counter}${parsed.ext}`;
      counter++;
    }

    return candidate;
  }

  private async exists(filePath: string) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}
