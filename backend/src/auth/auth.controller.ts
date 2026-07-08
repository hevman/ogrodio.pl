import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { LocalAuthGuard } from "./local-auth.guard";

@Controller("api/auth")
export class AuthController {
  constructor(private readonly auth: AuthService) {}

  @Post("register")
  async register(@Body() body: any, @Res() res: Response) {
    const user = await this.auth.register(body);
    this.auth.setCookie(res, user);
    return res.json({ user });
  }

  @Post("login")
  @UseGuards(LocalAuthGuard)
  login(@Req() req: Request, @Res() res: Response) {
    const user = req.user as any;
    this.auth.setCookie(res, user);
    return res.json({ user });
  }

  @Post("logout")
  logout(@Res() res: Response) {
    this.auth.clearCookie(res);
    return res.json({ ok: true });
  }

  /**
   * Endpoint sesyjny: dla gościa zwraca 200 z user:null zamiast 401,
   * żeby przeglądarka nie logowała błędów na każdej stronie publicznej.
   */
  @Get("me")
  me(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const token =
      req.cookies?.garden_access ||
      (req.headers.authorization?.startsWith("Bearer ") ? req.headers.authorization.slice(7) : null);
    const user = token ? this.auth.verifyToken(token) : null;
    if (user) {
      this.auth.setCookie(res, user);
    }
    return { user };
  }
}
