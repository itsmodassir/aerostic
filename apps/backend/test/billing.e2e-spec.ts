import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { BillingModule } from '../src/billing/billing.module';
import { BillingService } from '../src/billing/billing.service';
import { MockRepoModule } from './mock-repo.module';
import * as crypto from 'crypto';

// Mock TypeOrmModule
jest.mock('@nestjs/typeorm', () => {
  const original = jest.requireActual('@nestjs/typeorm');
  return {
    ...original,
    TypeOrmModule: {
      forRoot: jest
        .fn()
        .mockReturnValue({ module: class {}, providers: [], exports: [] }),
      forRootAsync: jest
        .fn()
        .mockReturnValue({ module: class {}, providers: [], exports: [] }),
      forFeature: jest
        .fn()
        .mockReturnValue({ module: class {}, providers: [], exports: [] }),
    },
  };
});

describe('BillingController (e2e)', () => {
  let app: INestApplication;
  let billingService: BillingService;
  let configService: ConfigService;

  const mockBillingService = {
    handleWebhookEvent: jest.fn().mockResolvedValue({ received: true }), // Correct name and return type
    createSubscription: jest
      .fn()
      .mockResolvedValue({ id: 'sub_123', status: 'created' }),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env.test' }),
        MockRepoModule,
        BillingModule,
      ],
    })
      .overrideProvider(BillingService)
      .useValue(mockBillingService)
      .compile();

    app = moduleFixture.createNestApplication();

    // Enable raw body for webhook verification
    // Logic from main.ts: app = await NestFactory.create(AppModule, { rawBody: true });
    // But in testing module, we use createNestApplication.
    // We need to pass rawBody: true to createNestApplication?
    // Actually, createNestApplication receives adapter, options.
    // But rawBody is an option for the underlying platform.
    // In E2E tests, usually we don't need real rawBody if we mock the Guard or Service?
    // But RazorpayWebhookGuard uses rawBody.
    // So we MUST enable it.
    // const app = moduleFixture.createNestApplication({ rawBody: true });
    // But app is used in beforeEach.
    // Let's try passing options.
    app = moduleFixture.createNestApplication({ rawBody: true });

    await app.init();
    billingService = moduleFixture.get<BillingService>(BillingService);
    configService = moduleFixture.get<ConfigService>(ConfigService);
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/billing/webhooks/razorpay (POST)', () => {
    const secret = 'test_secret';

    // We mock ConfigService to return 'test_secret' for RAZORPAY_WEBHOOK_SECRET
    // Actually ConfigModule.forRoot reads from env or .env.
    // We should ensure process.env.RAZORPAY_WEBHOOK_SECRET is set or mocked.
    // Since we imported ConfigModule.forRoot, it uses real env or default.
    // We can override ConfigService? Or just set process.env before test?
    process.env.RAZORPAY_WEBHOOK_SECRET = secret;

    it('should accept valid signature', async () => {
      const body = JSON.stringify({ event: 'payment.captured' });
      const signature = crypto
        .createHmac('sha256', secret)
        .update(body)
        .digest('hex');

      return (
        request(app.getHttpServer())
          .post('/billing/webhooks/razorpay')
          .set('x-razorpay-signature', signature)
          .send(JSON.parse(body)) // Supertest sends object as JSON, rawBody handles it?
          // Wait, if Guard reads rawBody, supertest must send it correctly.
          // Supertest .send(obj) sends content-type json.
          // NestJS rawBody feature should capture it.
          .expect(200)
      );
    });

    it('should reject invalid signature', async () => {
      const body = JSON.stringify({ event: 'payment.captured' });
      const signature = 'invalid_signature';

      return request(app.getHttpServer())
        .post('/billing/webhooks/razorpay')
        .set('x-razorpay-signature', signature)
        .send(JSON.parse(body))
        .expect(401);
    });
  });
});
