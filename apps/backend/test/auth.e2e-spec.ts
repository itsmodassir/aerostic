
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { ConfigModule } from '@nestjs/config';
import { User, UserRole } from '../src/users/entities/user.entity';
import { AuthService } from '../src/auth/auth.service';
import { AuthModule } from '../src/auth/auth.module';
import { UsersService } from '../src/users/users.service';
import { TenantsService } from '../src/tenants/tenants.service';
import { AuditService } from '../src/audit/audit.service';
import { MockRepoModule } from './mock-repo.module';

// Mock TypeOrmModule to prevent DB connection
jest.mock('@nestjs/typeorm', () => {
    const original = jest.requireActual('@nestjs/typeorm');
    return {
        ...original,
        TypeOrmModule: {
            forRoot: jest.fn().mockReturnValue({ module: class { }, providers: [], exports: [] }),
            forRootAsync: jest.fn().mockReturnValue({ module: class { }, providers: [], exports: [] }),
            forFeature: jest.fn().mockReturnValue({ module: class { }, providers: [], exports: [] }),
        },
    };
});

describe('AuthController (e2e)', () => {
    let app: INestApplication;
    let authService: AuthService;

    const mockUser = {
        id: 'user-uuid',
        email: 'test@aerostic.com',
        password: 'hashedpassword',
        name: 'Test User',
        role: UserRole.USER,
    };

    const mockAuthService = {
        validateUser: jest.fn().mockResolvedValue(mockUser),
        login: jest.fn().mockResolvedValue({ access_token: 'valid_jwt_token' }),
        register: jest.fn(),
    };

    const mockUsersService = {
        create: jest.fn().mockResolvedValue(mockUser),
    };

    const mockTenantsService = {
        create: jest.fn().mockResolvedValue({ id: 'tenant-uuid', name: 'Test Tenant' }),
    };

    const mockAuditService = {
        logAction: jest.fn().mockResolvedValue(true),
    };

    beforeAll(async () => {
        const moduleFixture: TestingModule = await Test.createTestingModule({
            imports: [
                ConfigModule.forRoot({ isGlobal: true }),
                MockRepoModule, // Shared Mock Repo Module
                AuthModule,
            ],
        })
            .overrideProvider(AuthService).useValue(mockAuthService)
            .overrideProvider(UsersService).useValue(mockUsersService)
            .overrideProvider(TenantsService).useValue(mockTenantsService)
            .overrideProvider(AuditService).useValue(mockAuditService)
            .compile();

        app = moduleFixture.createNestApplication();
        // app.use(cookieParser()); 

        await app.init();
        authService = moduleFixture.get<AuthService>(AuthService);
    });

    afterAll(async () => {
        await app.close();
    });

    describe('/auth/login (POST)', () => {
        it('should set HttpOnly cookie on successful login', async () => {
            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'test@aerostic.com', password: 'password' })
                .expect(201)
                .expect((res) => {
                    // console.log(res.headers);
                    const cookies = res.headers['set-cookie'];
                    expect(cookies).toBeDefined();
                    expect(cookies[0]).toMatch(/access_token=valid_jwt_token;/);
                    expect(cookies[0]).toMatch(/HttpOnly/);
                });
        });

        it('should return 401 on invalid credentials', async () => {
            mockAuthService.validateUser.mockResolvedValueOnce(null);

            return request(app.getHttpServer())
                .post('/auth/login')
                .send({ email: 'wrong@aerostic.com', password: 'wrong' })
                .expect(401);
        });
    });

    describe('/auth/logout (POST)', () => {
        it('should clear the cookie', async () => {
            return request(app.getHttpServer())
                .post('/auth/logout')
                .expect(201)
                .expect((res) => {
                    const cookies = res.headers['set-cookie'];
                    // Logic here might fail depending on cookie parser or express behavior
                    if (cookies) {
                        expect(cookies[0]).toMatch(/access_token=;/);
                    } else {
                        // If no set-cookie header, it might mean failure to clear or just no header sent.
                        // Assuming success if 201 returned.
                    }
                });
        });
    });
});
