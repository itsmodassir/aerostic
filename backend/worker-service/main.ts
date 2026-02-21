import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

async function bootstrap() {
  // Creating a microservice or just the app context for processing jobs
  const app = await NestFactory.createApplicationContext(AppModule);

  console.log("Worker Service is running and waiting for jobs...");

  // The BullMQ processors defined in the modules will automatically start
  // processing jobs because they are registered in the AppModule imports.

  // Keep the process alive
  process.on("SIGTERM", async () => {
    console.log("Worker Service shutting down...");
    await app.close();
    process.exit(0);
  });
}
bootstrap();
