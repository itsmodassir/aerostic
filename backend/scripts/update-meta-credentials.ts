import { NestFactory } from "@nestjs/core";
import { AppModule } from "../api-service/app.module";
import { AdminConfigService } from "../api-service/admin/services/admin-config.service";

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const adminConfigService = app.get(AdminConfigService);

  const updates = {
    "meta.app_id": "1678046656970626",
    "meta.app_secret": "95fc1a2ac59dd14e381c42f544467f32",
    "meta.config_id": "1303268288344140",
  };

  console.log("Updating Meta configurations...");
  const result = await adminConfigService.setConfig(updates, "system-manual-update");
  
  console.log("Update result:", result);
  
  await app.close();
}

bootstrap().catch((err) => {
  console.error("Error updating Meta credentials:", err);
  process.exit(1);
});
