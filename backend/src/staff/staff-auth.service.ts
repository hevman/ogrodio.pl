import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import type { Response } from 'express';
import { DatabaseService } from '../database/database.service';
import type { StaffRole, StaffUser } from '../auth/auth.types';

@Injectable()
export class StaffAuthService {
  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
  ) {}

  // ─── Cookie helpers ────────────────────────────────────────────────────────

  setAccessCookie(res: Response, user: StaffUser) {
    const token = this.jwt.sign(
      { sub: user.id, email: user.email, name: user.name, role: user.role, type: 'staff_access' },
      { expiresIn: '15m' },
    );
    res.cookie('panel_access', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.AUTH_COOKIE_SECURE === 'true',
      path: '/',
      maxAge: 15 * 60 * 1000,
    });
    return token;
  }

  setRefreshCookie(res: Response, userId: number) {
    const token = this.jwt.sign(
      { sub: userId, type: 'staff_refresh' },
      { expiresIn: '7d' },
    );
    res.cookie('panel_refresh', token, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.AUTH_COOKIE_SECURE === 'true',
      path: '/panel-api/staff/auth/refresh',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return token;
  }

  clearCookies(res: Response) {
    res.clearCookie('panel_access', { path: '/' });
    res.clearCookie('panel_refresh', { path: '/panel-api/staff/auth/refresh' });
  }

  // ─── Walidacja ─────────────────────────────────────────────────────────────

  async validateStaff(email: string, password: string): Promise<StaffUser> {
    const result = await this.db.query(
      `SELECT id, email, name, role, password_hash
       FROM staff_users
       WHERE email = $1 AND is_active = true
       LIMIT 1`,
      [String(email || '').trim().toLowerCase()],
    );
    const row = result.rows[0];
    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      throw new UnauthorizedException('Nieprawidłowy email lub hasło');
    }
    return { id: Number(row.id), email: row.email, name: row.name, role: row.role as StaffRole };
  }

  async findById(id: number): Promise<StaffUser | null> {
    const result = await this.db.query(
      `SELECT id, email, name, role FROM staff_users WHERE id = $1 AND is_active = true`,
      [id],
    );
    const row = result.rows[0];
    if (!row) return null;
    return { id: Number(row.id), email: row.email, name: row.name, role: row.role as StaffRole };
  }

  // ─── Refresh token ─────────────────────────────────────────────────────────

  verifyRefreshToken(token: string): { sub: number } | null {
    try {
      const payload = this.jwt.verify(token) as any;
      if (payload?.type !== 'staff_refresh') return null;
      return { sub: Number(payload.sub) };
    } catch {
      return null;
    }
  }

  // ─── CRUD pracowników (tylko ADMIN) ────────────────────────────────────────

  async createStaff(body: any) {
    const email = String(body?.email || '').trim().toLowerCase();
    const password = String(body?.password || '');
    const name = String(body?.name || '').trim();
    const role = String(body?.role || '') as StaffRole;
    const validRoles: StaffRole[] = ['ADMIN', 'MANAGER', 'MAGAZYN', 'OBSŁUGA_KLIENTA', 'CONTENT_EDITOR'];
    if (!email || !name || password.length < 8 || !validRoles.includes(role)) {
      throw new BadRequestException('Podaj email, imię, hasło min. 8 znaków i rolę');
    }
    const passwordHash = await bcrypt.hash(password, 12);
    try {
      const result = await this.db.query(
        `INSERT INTO staff_users (email, password_hash, name, role)
         VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, role`,
        [email, passwordHash, name, role],
      );
      return result.rows[0];
    } catch {
      throw new BadRequestException('Pracownik z tym adresem już istnieje');
    }
  }

  async listStaff() {
    const result = await this.db.query(
      `SELECT id, email, name, role, is_active, created_at FROM staff_users ORDER BY name`,
    );
    return result.rows;
  }

  async updateStaff(id: number, body: any) {
    const updates: string[] = [];
    const values: any[] = [];
    let idx = 1;
    if (body.name) { updates.push(`name = $${idx++}`); values.push(body.name); }
    if (body.role) { updates.push(`role = $${idx++}`); values.push(body.role); }
    if (typeof body.isActive === 'boolean') { updates.push(`is_active = $${idx++}`); values.push(body.isActive); }
    if (body.password && body.password.length >= 8) {
      const hash = await bcrypt.hash(body.password, 12);
      updates.push(`password_hash = $${idx++}`);
      values.push(hash);
    }
    if (!updates.length) throw new BadRequestException('Brak danych do aktualizacji');
    values.push(id);
    await this.db.query(
      `UPDATE staff_users SET ${updates.join(', ')}, updated_at = NOW() WHERE id = $${idx}`,
      values,
    );
    return { ok: true };
  }
}
