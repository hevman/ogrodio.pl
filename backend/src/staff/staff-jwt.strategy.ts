import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import type { Request } from 'express';

function staffCookieExtractor(req: Request) {
  return req?.cookies?.panel_access || null;
}

@Injectable()
export class StaffJwtStrategy extends PassportStrategy(Strategy, 'staff-jwt') {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([staffCookieExtractor, ExtractJwt.fromAuthHeaderAsBearerToken()]),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'garden-dev-secret-change-me',
    });
  }

  validate(payload: any) {
    if (payload?.type !== 'staff_access') {
      throw new Error('Invalid token type');
    }
    return {
      id: Number(payload.sub),
      email: String(payload.email),
      name: String(payload.name),
      role: String(payload.role),
    };
  }
}
