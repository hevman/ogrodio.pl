import { Injectable, OnModuleDestroy, OnModuleInit } from "@nestjs/common";
import * as bcrypt from "bcrypt";
import { Pool, QueryResultRow } from "pg";

@Injectable()
export class DatabaseService implements OnModuleInit, OnModuleDestroy {
  private readonly pool = new Pool({
    host: process.env.POSTGRES_HOST || "postgres",
    port: Number(process.env.POSTGRES_PORT || 5432),
    database: process.env.POSTGRES_DB || "garden",
    user: process.env.POSTGRES_USER || "garden",
    password: process.env.POSTGRES_PASSWORD || "garden",
  });

  query<T extends QueryResultRow = any>(text: string, params: any[] = []) {
    return this.pool.query<T>(text, params);
  }

  async onModuleInit() {
    await this.query(`
      -- ────────────────────────────────────────────────────────
      -- Pracownicy panelu (staff)
      -- ────────────────────────────────────────────────────────
      CREATE TABLE IF NOT EXISTS staff_users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'OBSŁUGA_KLIENTA',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS staff_users_email_idx ON staff_users (email);
      CREATE INDEX IF NOT EXISTS staff_users_role_idx ON staff_users (role);

      -- ────────────────────────────────────────────────────────
      -- Audit log
      -- ────────────────────────────────────────────────────────
      CREATE TABLE IF NOT EXISTS audit_log (
        id BIGSERIAL PRIMARY KEY,
        staff_id INTEGER REFERENCES staff_users(id) ON DELETE SET NULL,
        action TEXT NOT NULL,
        entity TEXT NOT NULL,
        entity_id TEXT,
        before_data JSONB,
        after_data JSONB,
        ip TEXT,
        note TEXT,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS audit_log_entity_idx ON audit_log (entity, entity_id);
      CREATE INDEX IF NOT EXISTS audit_log_staff_idx ON audit_log (staff_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS audit_log_created_idx ON audit_log (created_at DESC);

      -- ────────────────────────────────────────────────────────
      -- Zgłoszenia serwisowe
      -- ────────────────────────────────────────────────────────
      -- ────────────────────────────────────────────────────────
      -- Klienci sklepu (shop_users)
      -- ────────────────────────────────────────────────────────
      CREATE TABLE IF NOT EXISTS shop_users (
        id SERIAL PRIMARY KEY,
        email TEXT UNIQUE NOT NULL,
        password_hash TEXT NOT NULL,
        name TEXT NOT NULL,
        phone TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_favorites (
        user_id INTEGER NOT NULL REFERENCES shop_users(id) ON DELETE CASCADE,
        product_variant_id TEXT NOT NULL,
        product_slug TEXT NOT NULL DEFAULT '',
        product_name TEXT NOT NULL DEFAULT '',
        product_image TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (user_id, product_variant_id)
      );

      CREATE INDEX IF NOT EXISTS user_favorites_user_created_idx
        ON user_favorites (user_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS user_garden_profiles (
        user_id INTEGER PRIMARY KEY REFERENCES shop_users(id) ON DELETE CASCADE,
        city TEXT NOT NULL DEFAULT '',
        region TEXT NOT NULL DEFAULT '',
        climate_zone TEXT NOT NULL DEFAULT '',
        soil_type TEXT NOT NULL DEFAULT '',
        latitude NUMERIC(9,6),
        longitude NUMERIC(9,6),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE user_garden_profiles
        ADD COLUMN IF NOT EXISTS latitude NUMERIC(9,6),
        ADD COLUMN IF NOT EXISTS longitude NUMERIC(9,6),
        ADD COLUMN IF NOT EXISTS weekly_digest_enabled BOOLEAN NOT NULL DEFAULT TRUE;

      CREATE TABLE IF NOT EXISTS user_garden_plants (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES shop_users(id) ON DELETE CASCADE,
        plant_type TEXT NOT NULL,
        display_name TEXT NOT NULL,
        location TEXT NOT NULL DEFAULT '',
        planted_at DATE,
        notes TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS user_garden_plants_user_idx
        ON user_garden_plants (user_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS user_garden_plants_type_idx
        ON user_garden_plants (plant_type);

      CREATE TABLE IF NOT EXISTS garden_organizations (
        id SERIAL PRIMARY KEY,
        owner_user_id INTEGER NOT NULL REFERENCES shop_users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        type TEXT NOT NULL DEFAULT 'private',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS garden_organizations_owner_idx
        ON garden_organizations (owner_user_id, created_at DESC);

      CREATE TABLE IF NOT EXISTS garden_memberships (
        organization_id INTEGER NOT NULL REFERENCES garden_organizations(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL REFERENCES shop_users(id) ON DELETE CASCADE,
        role TEXT NOT NULL DEFAULT 'owner',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        PRIMARY KEY (organization_id, user_id)
      );

      CREATE INDEX IF NOT EXISTS garden_memberships_user_idx
        ON garden_memberships (user_id);

      CREATE TABLE IF NOT EXISTS garden_invitations (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER NOT NULL REFERENCES garden_organizations(id) ON DELETE CASCADE,
        email TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'worker',
        token TEXT UNIQUE NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        invited_by INTEGER REFERENCES shop_users(id) ON DELETE SET NULL,
        accepted_by INTEGER REFERENCES shop_users(id) ON DELETE SET NULL,
        expires_at TIMESTAMPTZ NOT NULL DEFAULT NOW() + INTERVAL '14 days',
        accepted_at TIMESTAMPTZ,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS garden_invitations_org_idx
        ON garden_invitations (organization_id, status, created_at DESC);
      CREATE INDEX IF NOT EXISTS garden_invitations_email_idx
        ON garden_invitations (email, status);

      CREATE TABLE IF NOT EXISTS garden_locations (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER NOT NULL REFERENCES garden_organizations(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        kind TEXT NOT NULL DEFAULT 'garden',
        notes TEXT NOT NULL DEFAULT '',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS garden_locations_org_idx
        ON garden_locations (organization_id, name);

      ALTER TABLE user_garden_plants
        ADD COLUMN IF NOT EXISTS organization_id INTEGER REFERENCES garden_organizations(id) ON DELETE CASCADE,
        ADD COLUMN IF NOT EXISTS location_id INTEGER REFERENCES garden_locations(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS status TEXT NOT NULL DEFAULT 'active',
        ADD COLUMN IF NOT EXISTS quantity INTEGER NOT NULL DEFAULT 1,
        ADD COLUMN IF NOT EXISTS variety TEXT NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS batch_code TEXT NOT NULL DEFAULT '',
        ADD COLUMN IF NOT EXISTS health_status TEXT NOT NULL DEFAULT 'good';

      CREATE INDEX IF NOT EXISTS user_garden_plants_org_idx
        ON user_garden_plants (organization_id, created_at DESC);
      CREATE INDEX IF NOT EXISTS user_garden_plants_location_idx
        ON user_garden_plants (location_id);
      CREATE INDEX IF NOT EXISTS user_garden_plants_health_idx
        ON user_garden_plants (organization_id, health_status);

      CREATE TABLE IF NOT EXISTS garden_tasks (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER NOT NULL REFERENCES garden_organizations(id) ON DELETE CASCADE,
        plant_id INTEGER REFERENCES user_garden_plants(id) ON DELETE SET NULL,
        location_id INTEGER REFERENCES garden_locations(id) ON DELETE SET NULL,
        assigned_user_id INTEGER REFERENCES shop_users(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        description TEXT NOT NULL DEFAULT '',
        article_href TEXT NOT NULL DEFAULT '',
        kind TEXT NOT NULL DEFAULT 'custom',
        priority TEXT NOT NULL DEFAULT 'medium',
        status TEXT NOT NULL DEFAULT 'open',
        due_date DATE,
        repeat_rule TEXT NOT NULL DEFAULT '',
        completed_at TIMESTAMPTZ,
        created_by INTEGER REFERENCES shop_users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS garden_tasks_org_due_idx
        ON garden_tasks (organization_id, due_date, status);
      CREATE INDEX IF NOT EXISTS garden_tasks_plant_idx
        ON garden_tasks (plant_id, due_date);

      ALTER TABLE garden_tasks
        ADD COLUMN IF NOT EXISTS article_href TEXT NOT NULL DEFAULT '';

      CREATE TABLE IF NOT EXISTS garden_journal_entries (
        id SERIAL PRIMARY KEY,
        organization_id INTEGER NOT NULL REFERENCES garden_organizations(id) ON DELETE CASCADE,
        plant_id INTEGER REFERENCES user_garden_plants(id) ON DELETE SET NULL,
        location_id INTEGER REFERENCES garden_locations(id) ON DELETE SET NULL,
        task_id INTEGER REFERENCES garden_tasks(id) ON DELETE SET NULL,
        author_user_id INTEGER REFERENCES shop_users(id) ON DELETE SET NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL DEFAULT '',
        image_url TEXT NOT NULL DEFAULT '',
        happened_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      ALTER TABLE garden_journal_entries
        ADD COLUMN IF NOT EXISTS task_id INTEGER REFERENCES garden_tasks(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS author_user_id INTEGER REFERENCES shop_users(id) ON DELETE SET NULL;

      CREATE INDEX IF NOT EXISTS garden_journal_org_happened_idx
        ON garden_journal_entries (organization_id, happened_at DESC);
      CREATE INDEX IF NOT EXISTS garden_journal_plant_idx
        ON garden_journal_entries (plant_id, happened_at DESC);

      INSERT INTO garden_organizations (owner_user_id, name, type)
      SELECT id, COALESCE(NULLIF(name, ''), email) || ' - ogrod', 'private'
      FROM shop_users users
      WHERE NOT EXISTS (
        SELECT 1 FROM garden_organizations org WHERE org.owner_user_id = users.id
      );

      INSERT INTO garden_memberships (organization_id, user_id, role)
      SELECT org.id, org.owner_user_id, 'owner'
      FROM garden_organizations org
      ON CONFLICT (organization_id, user_id) DO NOTHING;

      UPDATE user_garden_plants plants
      SET organization_id = org.id
      FROM garden_organizations org
      WHERE plants.user_id = org.owner_user_id
        AND plants.organization_id IS NULL;

      CREATE TABLE IF NOT EXISTS contact_inquiries (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        message TEXT NOT NULL,
        source TEXT NOT NULL DEFAULT 'site',
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS quote_requests (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        city TEXT NOT NULL,
        notes TEXT NOT NULL DEFAULT '',
        input JSONB NOT NULL,
        estimate JSONB NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS complaints (
        id SERIAL PRIMARY KEY,
        reference TEXT UNIQUE NOT NULL,
        order_reference TEXT NOT NULL,
        customer_name TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        type TEXT NOT NULL,
        message TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'new',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE TABLE IF NOT EXISTS user_order_refs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES shop_users(id) ON DELETE SET NULL,
        vendure_order_code TEXT UNIQUE NOT NULL,
        state TEXT NOT NULL DEFAULT '',
        total NUMERIC(10,2) NOT NULL DEFAULT 0,
        source TEXT NOT NULL DEFAULT 'vendure',
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS contact_inquiries_created_idx ON contact_inquiries (created_at DESC);
      CREATE INDEX IF NOT EXISTS quote_requests_created_idx ON quote_requests (created_at DESC);
      CREATE INDEX IF NOT EXISTS complaints_order_reference_idx ON complaints (order_reference);
      CREATE INDEX IF NOT EXISTS user_order_refs_user_created_idx ON user_order_refs (user_id, created_at DESC);

      -- ────────────────────────────────────────────────────────
      -- Artykuły / Porady (CMS)
      -- ────────────────────────────────────────────────────────
      CREATE TABLE IF NOT EXISTS articles (
        id SERIAL PRIMARY KEY,
        slug TEXT UNIQUE NOT NULL,
        title TEXT NOT NULL,
        topic TEXT NOT NULL DEFAULT '',
        summary TEXT NOT NULL DEFAULT '',
        reading_minutes INTEGER NOT NULL DEFAULT 5,
        cover_image TEXT NOT NULL DEFAULT '',
        cover_alt TEXT NOT NULL DEFAULT '',
        -- Sekcje, FAQ, tips, powiązane usługi — przechowywane jako JSONB
        sections JSONB NOT NULL DEFAULT '[]',
        faq JSONB NOT NULL DEFAULT '[]',
        tips JSONB NOT NULL DEFAULT '[]',
        related_services JSONB NOT NULL DEFAULT '[]',
        related_articles JSONB NOT NULL DEFAULT '[]',
        related_product_ids JSONB NOT NULL DEFAULT '[]',
        -- SEO
        seo_title TEXT NOT NULL DEFAULT '',
        seo_description TEXT NOT NULL DEFAULT '',
        seo_keywords JSONB NOT NULL DEFAULT '[]',
        inline_image JSONB,
        gantt_chart JSONB,
        variety_table JSONB,
        discover JSONB,
        -- Status
        status TEXT NOT NULL DEFAULT 'published',
        published_at TIMESTAMPTZ,
        created_by INTEGER REFERENCES staff_users(id) ON DELETE SET NULL,
        updated_by INTEGER REFERENCES staff_users(id) ON DELETE SET NULL,
        created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
        updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
      );

      CREATE INDEX IF NOT EXISTS articles_slug_idx ON articles (slug);
      CREATE INDEX IF NOT EXISTS articles_status_idx ON articles (status);
      CREATE INDEX IF NOT EXISTS articles_topic_idx ON articles (topic);
      CREATE INDEX IF NOT EXISTS articles_updated_idx ON articles (updated_at DESC);

      ALTER TABLE articles ADD COLUMN IF NOT EXISTS inline_image JSONB;
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS gantt_chart JSONB;
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS variety_table JSONB;
      ALTER TABLE articles ADD COLUMN IF NOT EXISTS discover JSONB;
    `);

    await this.ensureDefaultAdmin();
  }

  private async ensureDefaultAdmin() {
    const existing = await this.query(`SELECT id FROM staff_users LIMIT 1`);
    if (existing.rows.length) return;

    const email = (process.env.ADMIN_EMAIL || 'admin@ogrodio.pl').trim().toLowerCase();
    const password = process.env.ADMIN_PASSWORD || 'Admin123!';
    const name = process.env.ADMIN_NAME || 'Administrator';
    const passwordHash = await bcrypt.hash(password, 12);

    await this.query(
      `INSERT INTO staff_users (email, password_hash, name, role, is_active)
       VALUES ($1, $2, $3, 'ADMIN', true)
       ON CONFLICT (email) DO NOTHING`,
      [email, passwordHash, name],
    );
  }

  async onModuleDestroy() {
    await this.pool.end();
  }
}
