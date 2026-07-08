import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import type { Request, Response } from "express";
import { AuthService } from "./auth.service";
import { JwtAuthGuard } from "./jwt-auth.guard";
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

  @Get("me")
  @UseGuards(JwtAuthGuard)
  me(@Req() req: Request, @Res({ passthrough: true }) res: Response) {
    const user = req.user as any;
    this.auth.setCookie(res, user);
    return { user };
  }
}
