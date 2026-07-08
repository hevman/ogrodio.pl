import { Body, Controller, Delete, Get, Param, Post, Query, Req, UseGuards } from "@nestjs/common";
import type { Request } from "express";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { ShopService } from "./shop.service";

@Controller("api/shop")
export class ShopController {
  constructor(private readonly shop: ShopService) {}

  @Get("products")
  async products(@Query("category") _category?: string) {
    // Produkty są pobierane bezpośrednio z Vendure Shop API przez frontend
    return { products: [] };
  }

  @Post("orders")
  async createOrder(@Req() _req: Request, @Body() _body: any) {
    // Zamówienia są tworzone bezpośrednio przez Vendure Shop API
    return { order: null };
  }

  @Get("favorites")
  @UseGuards(JwtAuthGuard)
  async favorites(@Req() req: Request) {
    const user = req.user as any;
    return { favorites: await this.shop.favorites(user.id) };
  }

  @Post("favorites")
  @UseGuards(JwtAuthGuard)
  async addFavorite(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;
    return { favorite: await this.shop.addFavorite(user.id, body) };
  }

  @Delete("favorites/:productVariantId")
  @UseGuards(JwtAuthGuard)
  async removeFavorite(@Req() req: Request, @Param("productVariantId") productVariantId: string) {
    const user = req.user as any;
    return await this.shop.removeFavorite(user.id, productVariantId);
  }
}
