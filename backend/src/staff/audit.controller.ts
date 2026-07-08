import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuditService } from './audit.service';
import { Roles, StaffJwtGuard } from './staff-auth.guard';

@Controller('panel-api/staff/audit')
@UseGuards(StaffJwtGuard)
@Roles('ADMIN', 'MANAGER')
export class AuditController {
  constructor(private readonly audit: AuditService) {}

  @Get()
  getLogs(
    @Query('entity') entity?: string,
    @Query('entityId') entityId?: string,
    @Query('staffId') staffId?: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
  ) {
    return this.audit.getLogs({
      entity,
      entityId,
      staffId: staffId ? Number(staffId) : undefined,
      limit: limit ? Number(limit) : 50,
      offset: offset ? Number(offset) : 0,
    });
  }
}
