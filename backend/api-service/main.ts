import { NestFactory, HttpAdapterHost } from "@nestjs/core";
import { AppModule } from "./app.module";
import { ValidationPipe } from "@nestjs/common";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import * as Sentry from "@sentry/nestjs";
import { nodeProfilingIntegration } from "@sentry/profiling-node";
import { SentryExceptionFilter } from "@shared/filters/sentry-exception.filter";

async function bootstrap() {
  console.log("🚀 [Bootstrap] Starting Aimstors API...");
  
  try {
    if (process.env.SENTRY_DSN) {
      console.log("🔍 [Bootstrap] Initializing Sentry...");
      Sentry.init({
        dsn: process.env.SENTRY_DSN,
        integrations: [nodeProfilingIntegration()],
        tracesSampleRate: 1.0,
        profilesSampleRate: 1.0,
        environment: process.env.NODE_ENV || "development",
      });
      console.log("✅ [Bootstrap] Sentry Initialized.");
    } else {
      console.log("⚠️ [Bootstrap] Sentry DSN missing, skipping...");
    }
  } catch (err) {
    console.error("❌ [Bootstrap] Sentry Init Failed", err);
  }

  console.log("📦 [Bootstrap] Creating Nest Application...");
  const app = await NestFactory.create(AppModule, {
    rawBody: true,
  });
  console.log("✅ [Bootstrap] Nest Application Created.");

  // API Versioning
  app.setGlobalPrefix("api/v1");

  // Developer API Documentation Setup
  const config = new DocumentBuilder()
    .setTitle('Aimstors API')
    .setDescription('The official REST API documentation for the Aimstors Platform. Connect external components securely.')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'access-token', // Used for API keys or Tokens
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document, {
    customSiteTitle: 'Aimstors Developer API Documentation',
  });

  // CORS Configuration
  const baseDomain = process.env.BASE_DOMAIN || "aimstore.in";
  const allowedOriginsEnv = process.env.ALLOWED_ORIGINS;
  const allowedOrigins = allowedOriginsEnv
    ? allowedOriginsEnv.split(",")
    : [
        "https://aimstore.in",
        "https://app.aimstore.in",
        "https://admin.aimstore.in",
        "https://reseller.aimstore.in",
        "http://localhost:3000",
        "http://localhost:3001",
        "http://localhost:3002",
        "http://localhost:3004",
      ];

  const isTrustedSubdomain = (origin?: string) => {
    if (!origin) return true;

    try {
      const parsed = new URL(origin);
      const hostname = parsed.hostname.toLowerCase();
      const normalizedBaseDomain = baseDomain.toLowerCase();
      return hostname === normalizedBaseDomain || hostname.endsWith(`.${normalizedBaseDomain}`);
    } catch {
      return false;
    }
  };

  app.enableCors({
    origin: (
      origin: string,
      callback: (err: Error | null, allow?: boolean) => void,
    ) => {
      // Allow requests with no origin (like mobile apps or curl requests)
      if (
        !origin ||
        allowedOrigins.includes("*") ||
        allowedOrigins.includes(origin) ||
        isTrustedSubdomain(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: [
      "Content-Type",
      "Authorization",
      "x-requested-with",
      "x-tenant-id",
      "x-workspace-id",
    ],
    maxAge: 3600,
  });

  // Security middleware (Hardened for Phase 1)
  app.use((req: any, res: any, next: any) => {
    // Prevent clickjacking
    res.setHeader("X-Frame-Options", "SAMEORIGIN");
    // Prevent MIME type sniffing
    res.setHeader("X-Content-Type-Options", "nosniff");
    // Enable XSS filter
    res.setHeader("X-XSS-Protection", "1; mode=block");
    // HSTS (Strict-Transport-Security) - 1 year
    res.setHeader(
      "Strict-Transport-Security",
      "max-age=31536000; includeSubDomains; preload",
    );
    // Referrer Policy
    res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");
    next();
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const { httpAdapter } = app.get(HttpAdapterHost);
  app.useGlobalFilters(new SentryExceptionFilter({ httpAdapter } as any));

  await app.listen(process.env.PORT ?? 3001, "0.0.0.0");
}
bootstrap();
