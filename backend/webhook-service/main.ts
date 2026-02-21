import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    rawBody: true, // Essential for webhook signature verification
  });

  // Dedicated sub-path for webhooks if needed, but here we just listen on a different port
  // and Nginx will route webhook.aimstore.in to this port.

  const port = process.env.PORT || 3003;
  await app.listen(port, "0.0.0.0");
  console.log(`Webhook Service is running on: http://0.0.0.0:${port}`);
}
bootstrap();
