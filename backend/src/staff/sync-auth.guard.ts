import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';

@Injectable()
export class SyncAuthGuard implements CanActivate {
  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    
    // Sprawdź sync token w headerze
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      throw new UnauthorizedException('Brak tokenu synchronizacji');
    }

    const token = authHeader.slice(7);
    const expectedToken = process.env.STRAPI_TO_BACKEND_TOKEN;

    if (!expectedToken) {
      throw new UnauthorizedException('Sync token nie skonfigurowany w backend');
    }

    if (token !== expectedToken) {
      throw new UnauthorizedException('Nieprawidłowy token synchronizacji');
    }

    // Oznacz request jako synchronizację
    req.isSyncRequest = true;

    return true;
  }
}

// Rozszerzenie typu Request
declare global {
  namespace Express {
    interface Request {
      isSyncRequest?: boolean;
    }
  }
}
