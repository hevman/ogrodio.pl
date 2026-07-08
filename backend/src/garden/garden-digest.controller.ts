import { Controller, Headers, Post, UnauthorizedException } from "@nestjs/common";
import { GardenDigestService } from "./garden-digest.service";

@Controller("api/internal/garden")
export class GardenDigestController {
  constructor(private readonly digest: GardenDigestService) {}

  @Post("weekly-digest")
  async weeklyDigest(@Headers("x-cron-secret") secret?: string) {
    const expected = process.env.DIGEST_CRON_SECRET || "";
    if (!expected || secret !== expected) {
      throw new UnauthorizedException("Brak autoryzacji cron");
    }
    return this.digest.sendWeeklyDigestForAllUsers();
  }
}
