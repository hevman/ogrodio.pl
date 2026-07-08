import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { JwtService } from "@nestjs/jwt";
import * as bcrypt from "bcrypt";
import type { CookieOptions } from "express";
import type { Response } from "express";
import { DatabaseService } from "../database/database.service";
import type { ShopUser } from "./auth.types";

@Injectable()
export class AuthService {
  private readonly accessCookieName = "garden_access";
  private readonly accessCookieMaxAge = 7 * 24 * 60 * 60 * 1000;

  constructor(
    private readonly db: DatabaseService,
    private readonly jwt: JwtService,
  ) {}

  publicUser(row: any): ShopUser {
    return {
      id: Number(row.id),
      email: String(row.email),
      name: String(row.name),
      phone: String(row.phone || ""),
    };
  }

  private cookieOptions(): CookieOptions {
    const domain = process.env.AUTH_COOKIE_DOMAIN?.trim();
    return {
      domain: domain || undefined,
      httpOnly: true,
      maxAge: this.accessCookieMaxAge,
      path: "/",
      sameSite: "lax",
      secure: process.env.AUTH_COOKIE_SECURE === "true",
    };
  }

  setCookie(res: Response, user: ShopUser) {
    res.cookie(this.accessCookieName, this.jwt.sign(user), this.cookieOptions());
  }

  verifyToken(token: string): ShopUser | null {
    try {
      const payload = this.jwt.verify(token);
      return {
        id: Number(payload.id),
        email: String(payload.email),
        name: String(payload.name),
        phone: String(payload.phone || ""),
      };
    } catch {
      return null;
    }
  }

  clearCookie(res: Response) {
    const { maxAge, ...options } = this.cookieOptions();
    res.clearCookie(this.accessCookieName, options);
    res.clearCookie(this.accessCookieName, { path: "/" });
  }

  async register(body: any) {
    const email = String(body?.email || "").trim().toLowerCase();
    const password = String(body?.password || "");
    const name = String(body?.name || "").trim();
    const phone = String(body?.phone || "").trim();
    if (!email || !name || password.length < 8) {
      throw new BadRequestException("Podaj email, imie i haslo min. 8 znakow");
    }
    const passwordHash = await bcrypt.hash(password, 12);
    try {
      const result = await this.db.query(
        `INSERT INTO shop_users (email, password_hash, name, phone) VALUES ($1, $2, $3, $4)
         RETURNING id, email, name, phone`,
        [email, passwordHash, name, phone],
      );
      return this.publicUser(result.rows[0]);
    } catch {
      throw new BadRequestException("Uzytkownik z tym adresem juz istnieje");
    }
  }

  async validateUser(email: string, password: string) {
    const result = await this.db.query(
      `SELECT id, email, name, phone, password_hash FROM shop_users WHERE email = $1 LIMIT 1`,
      [String(email || "").trim().toLowerCase()],
    );
    const row = result.rows[0];
    if (!row || !(await bcrypt.compare(password, row.password_hash))) {
      throw new UnauthorizedException("Nieprawidlowy email lub haslo");
    }
    return this.publicUser(row);
  }
}
