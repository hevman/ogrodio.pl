import { NestFactory } from "@nestjs/core";
import { AppModule } from "../app.module";
import { GardenDigestService } from "../garden/garden-digest.service";

async function main() {
  const app = await NestFactory.createApplicationContext(AppModule, { logger: ["error", "warn", "log"] });
  try {
    const digest = app.get(GardenDigestService);
    const result = await digest.sendWeeklyDigestForAllUsers();
    console.log(JSON.stringify(result));
  } finally {
    await app.close();
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
