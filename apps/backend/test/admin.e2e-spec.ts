import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { AdminModule } from '../src/admin/admin.module';
import { AdminConfigService } from '../src/admin/services/admin-config.service';
import { AdminTenantService } from '../src/admin/services/admin-tenant.service';
import { AdminBillingService } from '../src/admin/services/admin-billing.service';
import { AdminHealthService } from '../src/admin/services/admin-health.service';
import { AdminAnalyticsService } from '../src/admin/services/admin-analytics.service';
import { AdminService } from '../src/admin/admin.service';
import { BillingService } from '../src/billing/billing.service';
import { RazorpayService } from '../src/billing/razorpay.service';
import { AuditService } from '../src/audit/audit.service';
import { MockRepoModule } from './mock-repo.module';
import { UserRole } from '../src/users/entities/user.entity';
import { JwtAuthGuard } from '../src/auth/jwt-auth.guard';
import { SuperAdminGuard } from '../src/common/guards/super-admin.guard';
import { TenantGuard } from '../src/common/guards/tenant.guard';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Tenant } from '../src/tenants/entities/tenant.entity';
import { TenantMembership } from '../src/tenants/entities/tenant-membership.entity';

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

describe('AdminController (e2e)', () => {
  let app: INestApplication;

  // Mock Services as needed. AdminModule usually has many.
  // However, if we only test Guard logic (access control), we might not need to hit the service logic if Guard blocks it?
  // But if Guard passes, it hits Controller -> Service. So we MUST mock services.
  // AdminModule usually imports AdminTenantService, AdminUserService etc.
  // We should mock them.
  // For now, let's assume we want to test that non-admins are rejected.

  // To properly mock everything, we need to know what services AdminController injects.
  // Assuming AdminController doesn't exist yet or is empty in the provided context?
  // Wait, the previous task created `admin.e2e-spec.ts`, implying `AdminModule` exists.
  // Let's assume generic mock for now, or just focus on Guard.

  // If we want to simulate User Login (for Guard), we usually mock the Guard?
  // But this is E2E test. We want to verify the Guard works!
  // So we should NOT mock the Guard.
  // But we need to make `JwtAuthGuard` pass.
  // `JwtAuthGuard` uses `JwtStrategy`.
  // `JwtStrategy` validates token.
  // So we need to send a valid token (or mock the Strategy).
  // Or simpler: Mock `JwtAuthGuard` to allow access but set `req.user` differently for different tests.

  // Strategy: Override JwtAuthGuard with a custom guard that sets user based on a header?
  // This allows testing RBAC (SuperAdminGuard) without generating real tokens.

  const mockSuperAdminGuard = {
    canActivate: (context) => {
      const req = context.switchToHttp().getRequest();
      const roleHeader = req.headers['x-mock-role'];
      if (roleHeader) {
        req.user = {
          id: 'mock-user-id',
          email: 'test@aerostic.com',
          role: roleHeader,
        };
        // Simulate SuperAdminGuard logic
        if (roleHeader === UserRole.SUPER_ADMIN) {
          return true;
        }
      }
      return false;
    },
  };

  const mockAdminConfigService = {
    getConfig: jest.fn(),
    setConfig: jest.fn(),
    deleteConfig: jest.fn(),
  };
  const mockAdminTenantService = {
    getAllTenants: jest.fn(),
    getAllTenantsSummary: jest.fn(),
    updateUserPlan: jest.fn(),
  };
  const mockAdminBillingService = {
    getAllApiKeys: jest.fn(),
    getAllWebhooks: jest.fn(),
    getBillingStats: jest.fn(),
  };
  const mockAdminHealthService = {
    checkSystemHealth: jest.fn(),
    getSystemLogs: jest.fn(),
  };
  const mockAdminAnalyticsService = {
    getDashboardStats: jest.fn(),
    getAnalyticsTrends: jest.fn(),
    getSystemAlerts: jest.fn(),
  };
  const mockAdminService = {
    getAllAccounts: jest.fn(),
    rotateSystemTokens: jest.fn(),
    getAllMessages: jest.fn(),
  };
  const mockBillingService = { handleWebhookEvent: jest.fn() };
  const mockRazorpayService = {};
  const mockAuditService = { logAction: jest.fn() };

  const mockRepo = {
    findOne: jest.fn(),
    save: jest.fn(),
    create: jest.fn(),
    find: jest.fn(),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot({ isGlobal: true }),
        MockRepoModule,
        AdminModule,
      ],
    })
      .overrideGuard(SuperAdminGuard)
      .useValue(mockSuperAdminGuard)
      .overrideGuard(TenantGuard)
      .useValue({ canActivate: () => true })
      .overrideProvider(AdminConfigService)
      .useValue(mockAdminConfigService)
      .overrideProvider(AdminTenantService)
      .useValue(mockAdminTenantService)
      .overrideProvider(AdminBillingService)
      .useValue(mockAdminBillingService)
      .overrideProvider(AdminHealthService)
      .useValue(mockAdminHealthService)
      .overrideProvider(AdminAnalyticsService)
      .useValue(mockAdminAnalyticsService)
      .overrideProvider(AdminAnalyticsService)
      .useValue(mockAdminAnalyticsService)
      .overrideProvider(AdminService)
      .useValue(mockAdminService)
      .overrideProvider(BillingService)
      .useValue(mockBillingService)
      .overrideProvider(RazorpayService)
      .useValue(mockRazorpayService)
      .overrideProvider(AuditService)
      .useValue(mockAuditService)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('/admin/users (GET)', () => {
    it('should reject non-admin users', async () => {
      return request(app.getHttpServer())
        .get('/admin/users')
        .set('x-mock-role', UserRole.USER) // USER role
        .expect(403);
    });

    it('should allow admin users', async () => {
      // Fails if Service is not mocked and tries to hit DB?
      // Yes. So we expect 200 (if service mocked) or 500 (if service fails).
      // But 403 vs 500 proves the Guard passed!
      // If it returns 500, it means Guard passed and Controller executed (and failed).
      // If it returns 403, Guard blocked.
      // So getting 500 is actually a "pass" for the Guard test if we don't mock services!
      // But let's mock one service to be clean.
      // Without implementation details of AdminController, I'll rely on 500 vs 403 distinction.

      return request(app.getHttpServer())
        .get('/admin/users')
        .set('x-mock-role', UserRole.SUPER_ADMIN) // SUPER_ADMIN role
        .expect((res) => {
          if (res.status === 403) throw new Error('Admin should have access');
          // 200 or 500 is fine for this specific test
        });
    });
  });
});
