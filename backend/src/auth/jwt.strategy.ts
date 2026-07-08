import { Injectable } from "@nestjs/common";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import type { Request } from "express";

function cookieExtractor(req: Request) {
  return req?.cookies?.garden_access || null;
}

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([cookieExtractor, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || "garden-dev-secret-change-me",
    });
  }

  validate(payload: any) {
    return {
      id: Number(payload.id),
      email: String(payload.email),
      name: String(payload.name),
      phone: String(payload.phone || ""),
    };
  }
}
