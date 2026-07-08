/**
 * Jednorazowy skrypt do utworzenia pierwszego administratora panelu.
 *
 * Użycie:
 *   npx ts-node scripts/create-admin.ts
 *
 * Lub w Dockerze:
 *   docker exec garden-backend node dist/scripts/create-admin.js
 */

import * as bcrypt from 'bcrypt';
import { Pool } from 'pg';

const pool = new Pool({
  host: process.env.POSTGRES_HOST || 'localhost',
  port: Number(process.env.POSTGRES_PORT || 5432),
  database: process.env.POSTGRES_DB || 'garden_backend',
  user: process.env.POSTGRES_USER || 'garden',
  password: process.env.POSTGRES_PASSWORD || 'garden',
});

async function main() {
  const email = process.env.ADMIN_EMAIL || 'admin@ogrodio.pl';
  const password = process.env.ADMIN_PASSWORD || 'Admin123!';
  const name = process.env.ADMIN_NAME || 'Administrator';

  const hash = await bcrypt.hash(password, 12);

  await pool.query(
    `INSERT INTO staff_users (email, password_hash, name, role, is_active)
     VALUES ($1, $2, $3, 'ADMIN', true)
     ON CONFLICT (email) DO UPDATE
     SET password_hash = EXCLUDED.password_hash,
         role = 'ADMIN',
         is_active = true`,
    [email, hash, name],
  );

  console.log(`✅ Admin utworzony: ${email}`);
  await pool.end();
}

main().catch((err) => {
  console.error('❌ Błąd:', err.message);
  process.exit(1);
});
