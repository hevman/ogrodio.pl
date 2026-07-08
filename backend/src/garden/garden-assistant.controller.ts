import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, Put, Query, Req, UploadedFile, UseGuards, UseInterceptors } from "@nestjs/common";
import { FileInterceptor } from "@nestjs/platform-express";
import type { Request } from "express";
import { memoryStorage } from "multer";
import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { GardenAssistantService } from "./garden-assistant.service";

@Controller("api/garden")
@UseGuards(JwtAuthGuard)
export class GardenAssistantController {
  constructor(private readonly assistant: GardenAssistantService) {}

  @Get("catalog")
  catalog() {
    return this.assistant.catalog();
  }

  @Get("organization")
  organization(@Req() req: Request) {
    const user = req.user as any;
    return this.assistant.organization(user.id);
  }

  @Patch("organization")
  updateOrganization(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;
    return this.assistant.updateOrganization(user.id, body);
  }

  @Get("organization/members")
  async members(@Req() req: Request) {
    const user = req.user as any;
    return { members: await this.assistant.members(user.id) };
  }

  @Post("organization/members")
  async addMember(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;
    return { member: await this.assistant.addMember(user.id, body) };
  }

  @Patch("organization/members/:memberId")
  async updateMember(@Req() req: Request, @Param("memberId", ParseIntPipe) memberId: number, @Body() body: any) {
    const user = req.user as any;
    return { member: await this.assistant.updateMember(user.id, memberId, body) };
  }

  @Delete("organization/members/:memberId")
  async removeMember(@Req() req: Request, @Param("memberId", ParseIntPipe) memberId: number) {
    const user = req.user as any;
    return this.assistant.removeMember(user.id, memberId);
  }

  @Get("organization/invitations")
  async invitations(@Req() req: Request) {
    const user = req.user as any;
    return { invitations: await this.assistant.invitations(user.id) };
  }

  @Post("organization/invitations")
  async createInvitation(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;
    return { invitation: await this.assistant.createInvitation(user.id, body) };
  }

  @Post("organization/invitations/:id/cancel")
  async cancelInvitation(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    const user = req.user as any;
    return { invitation: await this.assistant.cancelInvitation(user.id, id) };
  }

  @Get("invitations")
  async myInvitations(@Req() req: Request) {
    const user = req.user as any;
    return { invitations: await this.assistant.myInvitations(user.id) };
  }

  @Post("invitations/:id/accept")
  async acceptInvitation(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    const user = req.user as any;
    return { invitation: await this.assistant.acceptInvitation(user.id, id) };
  }

  @Get("notifications")
  async notifications(@Req() req: Request) {
    const user = req.user as any;
    return this.assistant.notifications(user.id);
  }

  @Get("recommendations")
  recommendations(@Req() req: Request) {
    const user = req.user as any;
    return this.assistant.recommendations(user.id);
  }

  @Get("profile")
  profile(@Req() req: Request) {
    const user = req.user as any;
    return this.assistant.profile(user.id);
  }

  @Put("profile")
  updateProfile(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;
    return this.assistant.updateProfile(user.id, body);
  }

  @Get("weather")
  weather(@Req() req: Request) {
    const user = req.user as any;
    return this.assistant.weather(user.id);
  }

  @Get("weather/locations")
  async searchWeatherLocations(@Query("q") query?: string) {
    const locations = await this.assistant.searchWeatherLocations(query || "");
    return { locations };
  }

  @Get("plants")
  async plants(@Req() req: Request) {
    const user = req.user as any;
    return { plants: await this.assistant.plants(user.id) };
  }

  @Post("plants")
  async addPlant(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;
    return { plant: await this.assistant.addPlant(user.id, body) };
  }

  @Get("plants/:id")
  async plant(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    const user = req.user as any;
    return { plant: await this.assistant.plant(user.id, id) };
  }

  @Patch("plants/:id")
  async updatePlant(@Req() req: Request, @Param("id", ParseIntPipe) id: number, @Body() body: any) {
    const user = req.user as any;
    return { plant: await this.assistant.updatePlant(user.id, id, body) };
  }

  @Delete("plants/:id")
  removePlant(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    const user = req.user as any;
    return this.assistant.removePlant(user.id, id);
  }

  @Get("tasks")
  tasks(@Req() req: Request, @Query("month") month?: string) {
    const user = req.user as any;
    const selectedMonth = month ? Number(month) : undefined;
    return this.assistant.tasks(user.id, selectedMonth);
  }

  @Post("tasks")
  async addTask(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;
    return { task: await this.assistant.addTask(user.id, body) };
  }

  @Post("tasks/seasonal")
  async acceptSeasonalTask(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;
    return { task: await this.assistant.acceptSeasonalTask(user.id, body) };
  }

  @Get("tasks/:id")
  async task(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    const user = req.user as any;
    return { task: await this.assistant.task(user.id, id) };
  }

  @Put("tasks/:id")
  updateTask(@Req() req: Request, @Param("id", ParseIntPipe) id: number, @Body() body: any) {
    const user = req.user as any;
    return this.assistant.updateTask(user.id, id, body);
  }

  @Get("locations")
  async locations(@Req() req: Request) {
    const user = req.user as any;
    return { locations: await this.assistant.locations(user.id) };
  }

  @Post("locations")
  async addLocation(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;
    return { location: await this.assistant.addLocation(user.id, body) };
  }

  @Get("journal")
  async journal(@Req() req: Request) {
    const user = req.user as any;
    return { entries: await this.assistant.journal(user.id) };
  }

  @Get("journal/:id")
  async journalEntry(@Req() req: Request, @Param("id", ParseIntPipe) id: number) {
    const user = req.user as any;
    return { entry: await this.assistant.journalEntry(user.id, id) };
  }

  @Post("journal")
  async addJournalEntry(@Req() req: Request, @Body() body: any) {
    const user = req.user as any;
    return { entry: await this.assistant.addJournalEntry(user.id, body) };
  }

  @Post("media/journal")
  @UseInterceptors(FileInterceptor("file", {
    storage: memoryStorage(),
    limits: { fileSize: 8 * 1024 * 1024 },
  }))
  async uploadJournalImage(@Req() req: Request, @UploadedFile() file?: Express.Multer.File) {
    const user = req.user as any;
    return this.assistant.uploadJournalImage(user.id, file);
  }
}
