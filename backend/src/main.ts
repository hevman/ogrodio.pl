import 'reflect-metadata';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join } from 'path';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Globalny prefix — wszystkie kontrolery
  // Klienci sklepu:  /api/auth/*, /api/shop/*
  // Panel staff:     /panel-api/staff/*
  // Prefix jest ustawiony w dekoratorach @Controller(), więc tu nie ustawiamy globalnego
  app.use(cookieParser());
  app.use('/uploads', express.static(join(process.cwd(), 'uploads'), {
    immutable: true,
    maxAge: '30d',
  }));
  app.enableCors({
    origin: [
      'http://ogrodio.localhost',
      'http://app.ogrodio.localhost',
      'http://sklep.ogrodio.localhost',
      'http://panel.ogrodio.localhost',
      'https://ogrodio.pl',
      'https://www.ogrodio.pl',
      'https://app.ogrodio.pl',
      'https://www.app.ogrodio.pl',
      'https://sklep.ogrodio.pl',
      'https://www.sklep.ogrodio.pl',
      'https://panel.ogrodio.pl',
      'https://api.ogrodio.pl',
      'http://localhost',
      'http://localhost:3001',
    ],
    credentials: true,
  });
  await app.listen(Number(process.env.PORT || 3000), '0.0.0.0');
}

bootstrap();
