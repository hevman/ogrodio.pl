import {
  Body,
  Controller,
  Get,
  Post,
  Put,
  Param,
  Req,
  Res,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { StaffAuthService } from './staff-auth.service';
import { Roles, StaffJwtGuard } from './staff-auth.guard';
import { AuditService } from './audit.service';

@Controller('panel-api/staff/auth')
export class StaffAuthController {
  constructor(
    private readonly staffAuth: StaffAuthService,
    private readonly audit: AuditService,
  ) {}

  /** POST /panel-api/staff/auth/login */
  @Post('login')
  async login(@Body() body: any, @Req() req: Request, @Res() res: Response) {
    const email = String(body?.email || '');
    const password = String(body?.password || '');
    const user = await this.staffAuth.validateStaff(email, password);

    this.staffAuth.setAccessCookie(res, user);
    this.staffAuth.setRefreshCookie(res, user.id);

    await this.audit.log({
      staffId: user.id,
      action: 'auth.login',
      entity: 'staff_user',
      entityId: String(user.id),
      ip: req.ip,
    });

    return res.json({ user });
  }

  /** POST /panel-api/staff/auth/logout */
  @Post('logout')
  @UseGuards(StaffJwtGuard)
  async logout(@Req() req: Request, @Res() res: Response) {
    const user = req.staffUser!;
    this.staffAuth.clearCookies(res);
    await this.audit.log({
      staffId: user.id,
      action: 'auth.logout',
      entity: 'staff_user',
      entityId: String(user.id),
      ip: req.ip,
    });
    return res.json({ ok: true });
  }

  /** POST /panel-api/staff/auth/refresh */
  @Post('refresh')
  async refresh(@Req() req: Request, @Res() res: Response) {
    const refreshToken = req.cookies?.panel_refresh;
    if (!refreshToken) {
      return res.status(401).json({ message: 'Brak refresh tokenu' });
    }
    const payload = this.staffAuth.verifyRefreshToken(refreshToken);
    if (!payload) {
      return res.status(401).json({ message: 'Nieprawidłowy refresh token' });
    }
    const user = await this.staffAuth.findById(payload.sub);
    if (!user) {
      return res.status(401).json({ message: 'Użytkownik nieaktywny' });
    }
    this.staffAuth.setAccessCookie(res, user);
    return res.json({ user });
  }

  /** GET /panel-api/staff/auth/me */
  @Get('me')
  @UseGuards(StaffJwtGuard)
  me(@Req() req: Request) {
    return { user: req.staffUser };
  }

  // ─── Zarządzanie pracownikami (tylko ADMIN) ─────────────────────────────

  /** GET /panel-api/staff/auth/users */
  @Get('users')
  @UseGuards(StaffJwtGuard)
  @Roles('ADMIN')
  listUsers() {
    return this.staffAuth.listStaff();
  }

  /** POST /panel-api/staff/auth/users */
  @Post('users')
  @UseGuards(StaffJwtGuard)
  @Roles('ADMIN')
  createUser(@Body() body: any) {
    return this.staffAuth.createStaff(body);
  }

  /** PUT /panel-api/staff/auth/users/:id */
  @Put('users/:id')
  @UseGuards(StaffJwtGuard)
  @Roles('ADMIN')
  updateUser(@Param('id', ParseIntPipe) id: number, @Body() body: any) {
    return this.staffAuth.updateStaff(id, body);
  }
}
