import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Query,
  Req,
  UseGuards,
} from '@nestjs/common';
import type { Request } from 'express';
import { OrdersService } from './orders.service';
import { Permission, StaffJwtGuard } from './staff-auth.guard';

@Controller('panel-api/staff/orders')
@UseGuards(StaffJwtGuard)
@Permission('orders')
export class OrdersController {
  constructor(private readonly orders: OrdersService) {}

  @Get()
  list(
    @Query('page') page?: string,
    @Query('perPage') perPage?: string,
    @Query('state') state?: string,
  ) {
    return this.orders.listOrders({
      page: page ? Number(page) : 1,
      perPage: perPage ? Number(perPage) : 20,
      state,
    });
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.orders.getOrder(id);
  }

  @Post(':id/note')
  addNote(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    const user = req.staffUser!;
    return this.orders.addOrderNote(id, String(body.note || ''), user.id, user.name);
  }

  @Post(':id/state')
  changeState(@Param('id') id: string, @Body() body: any, @Req() req: Request) {
    const user = req.staffUser!;
    return this.orders.updateOrderState(id, String(body.state || ''), user.id, user.name);
  }
}
