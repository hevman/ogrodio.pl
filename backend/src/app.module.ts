import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';

// Auth klientów sklepu
import { AuthController } from './auth/auth.controller';
import { AuthService } from './auth/auth.service';
import { JwtStrategy } from './auth/jwt.strategy';
import { LocalStrategy } from './auth/local.strategy';

// Baza danych
import { DatabaseService } from './database/database.service';

// Sklep
import { ShopController } from './shop/shop.controller';
import { ShopService } from './shop/shop.service';
import { GardenAssistantController } from './garden/garden-assistant.controller';
import { GardenAssistantService } from './garden/garden-assistant.service';
import { GardenDigestController } from './garden/garden-digest.controller';
import { GardenDigestService } from './garden/garden-digest.service';
import { GardenMailService } from './garden/garden-mail.service';

// Staff / Panel pracowniczy
import { StaffAuthController } from './staff/staff-auth.controller';
import { StaffAuthService } from './staff/staff-auth.service';
import { AuditService } from './staff/audit.service';
import { AuditController } from './staff/audit.controller';
import { VendureAdminService } from './staff/vendure-admin.service';
import { OrdersService } from './staff/orders.service';
import { OrdersController } from './staff/orders.controller';
import { ProductsController } from './staff/products.controller';
import { ArticlesService } from './staff/articles.service';
import { ArticlesController, ArticlesPublicController } from './staff/articles.controller';
import { ArticleMediaService } from './staff/article-media.service';
import { ArticleContentService } from './staff/article-content.service';
import { PlantsController } from './staff/plants.controller';
import { SyncAuthGuard } from './staff/sync-auth.guard';
import { MeilisearchService } from './staff/meilisearch.service';

@Module({
  imports: [
    PassportModule.register({ session: false }),
    JwtModule.register({
      secret: process.env.JWT_SECRET || 'garden-dev-secret-change-me',
      signOptions: { expiresIn: (process.env.JWT_ACCESS_EXPIRES_IN || '7d') as any },
    }),
  ],
  controllers: [
    // Klienci sklepu
    AuthController,
    ShopController,
    GardenAssistantController,
    GardenDigestController,
    // Panel pracowniczy
    StaffAuthController,
    OrdersController,
    ProductsController,
    ArticlesController,
    ArticlesPublicController,
    PlantsController,
    AuditController,
  ],
  providers: [
    Reflector,
    DatabaseService,
    // Klienci sklepu
    AuthService,
    LocalStrategy,
    JwtStrategy,
    ShopService,
    GardenAssistantService,
    GardenDigestService,
    GardenMailService,
    // Panel pracowniczy
    StaffAuthService,
    AuditService,
    VendureAdminService,
    OrdersService,
    ArticlesService,
    ArticleMediaService,
    ArticleContentService,
    SyncAuthGuard,
    MeilisearchService,
  ],
})
export class AppModule {}
