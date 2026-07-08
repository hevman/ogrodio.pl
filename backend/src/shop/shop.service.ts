import { BadRequestException, Injectable } from "@nestjs/common";
import { DatabaseService } from "../database/database.service";

@Injectable()
export class ShopService {
  constructor(private readonly db: DatabaseService) {}

  async favorites(userId: number) {
    const result = await this.db.query(
      `SELECT product_variant_id AS "productVariantId",
              product_slug AS slug,
              product_name AS name,
              product_image AS image,
              created_at AS "createdAt"
       FROM user_favorites
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }

  async addFavorite(userId: number, body: any) {
    const productVariantId = String(body?.productVariantId || "").trim();
    const slug = String(body?.slug || "").trim();
    const name = String(body?.name || "").trim();
    const image = String(body?.image || "").trim();
    if (!productVariantId || !slug || !name) {
      throw new BadRequestException("Brakuje danych produktu");
    }
    const result = await this.db.query(
      `INSERT INTO user_favorites (user_id, product_variant_id, product_slug, product_name, product_image)
       VALUES ($1, $2, $3, $4, $5)
       ON CONFLICT (user_id, product_variant_id)
       DO UPDATE SET product_slug = EXCLUDED.product_slug,
                     product_name = EXCLUDED.product_name,
                     product_image = EXCLUDED.product_image
       RETURNING product_variant_id AS "productVariantId",
                 product_slug AS slug,
                 product_name AS name,
                 product_image AS image,
                 created_at AS "createdAt"`,
      [userId, productVariantId, slug, name, image],
    );
    return result.rows[0];
  }

  async removeFavorite(userId: number, productVariantId: string) {
    await this.db.query(
      `DELETE FROM user_favorites WHERE user_id = $1 AND product_variant_id = $2`,
      [userId, productVariantId],
    );
    return { ok: true };
  }

  async saveOrderReference(userId: number | undefined, body: any) {
    const code = String(body?.code || "").trim();
    const state = String(body?.state || "").trim();
    const total = Number(body?.total || 0);
    if (!code) {
      throw new BadRequestException("Brakuje numeru zamowienia Vendure");
    }
    const result = await this.db.query(
      `INSERT INTO user_order_refs (user_id, vendure_order_code, state, total)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (vendure_order_code)
       DO UPDATE SET user_id = COALESCE(EXCLUDED.user_id, user_order_refs.user_id),
                     state = EXCLUDED.state,
                     total = EXCLUDED.total
       RETURNING vendure_order_code AS code, state, total::float, created_at AS "createdAt"`,
      [userId || null, code, state, total],
    );
    return result.rows[0];
  }

  async orderReferences(userId: number) {
    const result = await this.db.query(
      `SELECT vendure_order_code AS code, state, total::float, created_at AS "createdAt"
       FROM user_order_refs
       WHERE user_id = $1
       ORDER BY created_at DESC`,
      [userId],
    );
    return result.rows;
  }
}
