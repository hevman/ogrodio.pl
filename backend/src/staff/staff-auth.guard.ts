import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  ForbiddenException,
  SetMetadata,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Reflector } from '@nestjs/core';
import type { Request } from 'express';
import type { StaffRole } from '../auth/auth.types';
import { hasPermission } from '../auth/auth.types';

export const ROLES_KEY = 'roles';
export const PERMISSIONS_KEY = 'permissions';

/** Dekorator ról: @Roles('ADMIN', 'MANAGER') */
export const Roles = (...roles: StaffRole[]) => SetMetadata(ROLES_KEY, roles);

/** Dekorator uprawnień: @Permission('orders') */
export const Permission = (perm: string) => SetMetadata(PERMISSIONS_KEY, perm);

@Injectable()
export class StaffJwtGuard implements CanActivate {
  constructor(
    private readonly jwt: JwtService,
    private readonly reflector: Reflector,
  ) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();

    // Wyciągnij token z cookie lub Authorization header
    const token =
      req.cookies?.panel_access ||
      (req.headers.authorization?.startsWith('Bearer ')
        ? req.headers.authorization.slice(7)
        : null);

    if (!token) throw new UnauthorizedException('Brak tokenu dostępu');

    let payload: any;
    try {
      payload = this.jwt.verify(token);
    } catch {
      throw new UnauthorizedException('Token wygasł lub jest nieprawidłowy');
    }

    if (payload?.type !== 'staff_access') {
      throw new UnauthorizedException('Nieprawidłowy typ tokenu');
    }

    // Zapisz dane użytkownika w request
    req.staffUser = {
      id: Number(payload.sub),
      email: payload.email,
      name: payload.name,
      role: payload.role as StaffRole,
    };

    // Sprawdź wymagane role
    const requiredRoles = this.reflector.getAllAndOverride<StaffRole[]>(ROLES_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (requiredRoles?.length) {
      const role = req.staffUser.role;
      if (!requiredRoles.includes(role) && role !== 'ADMIN') {
        throw new ForbiddenException('Brak dostępu dla Twojej roli');
      }
    }

    // Sprawdź wymagane uprawnienie
    const requiredPerm = this.reflector.getAllAndOverride<string>(PERMISSIONS_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (requiredPerm) {
      if (!hasPermission(req.staffUser.role, requiredPerm)) {
        throw new ForbiddenException(`Brak uprawnienia: ${requiredPerm}`);
      }
    }

    return true;
  }
}
