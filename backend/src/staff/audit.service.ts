import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../database/database.service';

interface AuditEntry {
  staffId?: number;
  action: string;       // np. 'order.status_changed', 'article.edited', 'complaint.closed'
  entity: string;       // np. 'order', 'article', 'staff_user'
  entityId?: string;
  before?: unknown;
  after?: unknown;
  ip?: string;
  note?: string;
}

@Injectable()
export class AuditService {
  constructor(private readonly db: DatabaseService) {}

  async log(entry: AuditEntry) {
    try {
      await this.db.query(
        `INSERT INTO audit_log (staff_id, action, entity, entity_id, before_data, after_data, ip, note)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
        [
          entry.staffId ?? null,
          entry.action,
          entry.entity,
          entry.entityId ?? null,
          entry.before ? JSON.stringify(entry.before) : null,
          entry.after ? JSON.stringify(entry.after) : null,
          entry.ip ?? null,
          entry.note ?? null,
        ],
      );
    } catch (err) {
      // Audit log nie może blokować głównej operacji
      console.error('[AuditService] Failed to log:', err);
    }
  }

  async getLogs(filters: {
    entity?: string;
    entityId?: string;
    staffId?: number;
    limit?: number;
    offset?: number;
  }) {
    const conditions: string[] = [];
    const values: any[] = [];
    let idx = 1;

    if (filters.entity) { conditions.push(`entity = $${idx++}`); values.push(filters.entity); }
    if (filters.entityId) { conditions.push(`entity_id = $${idx++}`); values.push(filters.entityId); }
    if (filters.staffId) { conditions.push(`staff_id = $${idx++}`); values.push(filters.staffId); }

    const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
    const limit = filters.limit ?? 50;
    const offset = filters.offset ?? 0;
    values.push(limit, offset);

    const result = await this.db.query(
      `SELECT al.id, al.action, al.entity, al.entity_id, al.before_data, al.after_data,
              al.ip, al.note, al.created_at,
              su.name AS staff_name, su.email AS staff_email
       FROM audit_log al
       LEFT JOIN staff_users su ON su.id = al.staff_id
       ${where}
       ORDER BY al.created_at DESC
       LIMIT $${idx++} OFFSET $${idx}`,
      values,
    );
    return result.rows;
  }
}
