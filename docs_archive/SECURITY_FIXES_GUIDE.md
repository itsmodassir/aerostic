# Aerostic Security Fixes - Implementation Guide

## 🎯 Priority Order (Fix in this order)

1. CORS Configuration (5 min)
2. Encryption Key (5 min)
3. Debug Logging (15 min)
4. Gitignore (2 min)
5. Security Headers (10 min)
6. Input Validation (20 min)
7. Rate Limiting (15 min)
8. Database Logging (5 min)

---

## 1. CORS Configuration Fix ⚠️ CRITICAL

**File:** `apps/backend/src/main.ts`

**Current:**
```typescript
app.enableCors();
```

**Fixed:**
```typescript
app.enableCors({
  origin: (origin, callback) => {
    const allowedOrigins = process.env.ALLOWED_ORIGINS?.split(',') || [
      'https://app.aimstore.in',
      'https://admin.aimstore.in',
      'https://aimstore.in'
    ];
    
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('CORS policy violation'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
  exposedHeaders: ['X-Total-Count', 'X-Page-Number'],
  maxAge: 3600,
  preflightContinue: false,
});
```

**Add to `.env.example` and `.env.production.example`:**
```env
ALLOWED_ORIGINS=https://app.aimstore.in,https://admin.aimstore.in,https://aimstore.in
```

---

## 2. Encryption Key Fix 🔴 CRITICAL

**File:** `apps/backend/src/common/encryption.service.ts`

**Current:**
```typescript
const secret = this.configService.get<string>('ENCRYPTION_KEY') || 'aerostic-prod-encryption-default-secret';
```

**Fixed:**
```typescript
const secret = this.configService.get<string>('ENCRYPTION_KEY');
if (!secret) {
  throw new Error(
    'CRITICAL: ENCRYPTION_KEY environment variable is required. ' +
    'Generate one with: openssl rand -hex 32'
  );
}
```

**Generate and add to `.env`:**
```bash
# Run this in terminal
openssl rand -hex 32
# Output: e.g., 7f3c8a2b1d9e5f4c6a8b2e1f3d5c7a9b1e3f5d7c9a1b3e5f7a9c1d3e5f7a9b

# Add to .env
ENCRYPTION_KEY=7f3c8a2b1d9e5f4c6a8b2e1f3d5c7a9b1e3f5d7c9a1b3e5f7a9c1d3e5f7a9b
```

---

## 3. Remove Debug Logging 📊 HIGH

**Files to check and clean:**
- `apps/backend/src/auth/auth.service.ts`
- `src/hooks/useChat.tsx`
- `src/hooks/useProjectManager.ts`
- `src/components/blog/BlogEditorForm.tsx`
- And all other files with `console.log`

**Example Fix - Auth Service:**

**Current:**
```typescript
async validateUser(email: string, pass: string): Promise<any> {
  console.log(`[AuthDebug] Attempting login for: ${email}`);
  const user = await this.usersService.findOneByEmail(email);
  if (!user) {
    console.log('[AuthDebug] User not found in DB');
    return null;
  }
  console.log(`[AuthDebug] User found in DB: ID=${user.id}, Email=${user.email}, Role=${user.role}`);
  // ... more logs
}
```

**Fixed:**
```typescript
constructor(
  private usersService: UsersService,
  private jwtService: JwtService,
  private logger = new Logger(AuthService.name)
) {}

async validateUser(email: string, pass: string): Promise<any> {
  // Development-only logging
  if (process.env.NODE_ENV === 'development') {
    this.logger.debug(`Login attempt for user`, { email });
  }
  
  const user = await this.usersService.findOneByEmail(email);
  if (!user) {
    this.logger.warn(`Authentication failed: user not found`, { email });
    return null;
  }

  const isMatch = await bcrypt.compare(pass, user.passwordHash);
  if (isMatch) {
    this.logger.log(`User authenticated successfully`, { userId: user.id });
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
    };
  }
  
  this.logger.warn(`Authentication failed: password mismatch`, { email });
  return null;
}
```

---

## 4. Fix .gitignore 🔐 CRITICAL

**File:** `.gitignore`

**Add these lines:**
```
# Environment variables - CRITICAL
.env
.env.local
.env.*.local
.env.production
.env.production.local
.env.staging
.env.test.local

# OS and IDE
.DS_Store
.vscode/settings.json
.idea/
*.swp
*.swo

# Secrets and credentials
*.pem
*.key
*.crt
*.p12
secrets/
.credentials

# Build outputs
build/
dist/
*.tsbuildinfo

# Logs
logs/
*.log
npm-debug.log*
yarn-debug.log*

# Dependencies
node_modules/
package-lock.json
yarn.lock
```

---

## 5. Add Security Headers to Nginx 🛡️ MEDIUM

**File:** `nginx.conf`

**Complete secure version:**
```nginx
server {
  listen 80;
  listen [::]:80;
  server_name _;

  # Redirect HTTP to HTTPS in production
  return 301 https://$host$request_uri;
}

server {
  listen 443 ssl http2;
  listen [::]:443 ssl http2;
  server_name _;

  # SSL Configuration
  ssl_certificate /etc/letsencrypt/live/aimstore.in/fullchain.pem;
  ssl_certificate_key /etc/letsencrypt/live/aimstore.in/privkey.pem;
  ssl_protocols TLSv1.2 TLSv1.3;
  ssl_ciphers HIGH:!aNULL:!MD5;
  ssl_prefer_server_ciphers on;

  root /usr/share/nginx/html;
  index index.html;

  # Security Headers
  add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
  add_header X-Content-Type-Options "nosniff" always;
  add_header X-Frame-Options "SAMEORIGIN" always;
  add_header X-XSS-Protection "1; mode=block" always;
  add_header Referrer-Policy "strict-origin-when-cross-origin" always;
  add_header Permissions-Policy "accelerometer=(), camera=(), microphone=(), geolocation=()" always;
  add_header Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline' https:; style-src 'self' 'unsafe-inline' https:; img-src 'self' data: https:; font-src 'self' data: https:; connect-src 'self' https:; frame-ancestors 'self';" always;

  # Caching
  location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$ {
    add_header Cache-Control "public, immutable, max-age=31536000";
    expires 365d;
  }

  # API proxy (example)
  location /api/ {
    proxy_pass http://backend:3001/api/;
    proxy_http_version 1.1;
    proxy_set_header Upgrade $http_upgrade;
    proxy_set_header Connection 'upgrade';
    proxy_set_header Host $host;
    proxy_cache_bypass $http_upgrade;
    proxy_set_header X-Real-IP $remote_addr;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto $scheme;
  }

  # Frontend routes
  location / {
    try_files $uri /index.html;
  }

  # Robots and sitemap
  location = /robots.txt {
    try_files $uri /robots.txt;
  }
}
```

---

## 6. Add Input Validation 📝 HIGH

**Create:** `apps/backend/src/auth/dto/login.dto.ts`

```typescript
import { IsEmail, MinLength, MaxLength, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @MaxLength(128, { message: 'Password is too long' })
  password: string;
}
```

**Create:** `apps/backend/src/admin/dto/update-config.dto.ts`

```typescript
import { IsString, Matches, ValidateIf, MinLength, MaxLength } from 'class-validator';

export class UpdateConfigDto {
  @IsString()
  @Matches(/^[a-z]+\.[a-z_]+$/, { message: 'Invalid config key format' })
  key: string;

  @IsString()
  @MinLength(1)
  @MaxLength(2000)
  value: string;
}
```

**Update:** `apps/backend/src/auth/auth.controller.ts`

```typescript
import { Controller, Post, Body, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }
}
```

**Enable validation globally in `main.ts`:**
```typescript
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Global validation
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Strip unknown properties
      forbidNonWhitelisted: true, // Reject unknown properties
      transform: true, // Auto-transform to correct types
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  
  // ... rest of config
}
```

---

## 7. Implement Endpoint-Specific Rate Limiting 🚦 MEDIUM

**Create:** `apps/backend/src/common/decorators/rate-limit.decorator.ts`

```typescript
import { SetMetadata } from '@nestjs/common';

export const RateLimit = (limit: number, ttl: number) =>
  SetMetadata('rateLimit', { limit, ttl });
```

**Update:** `apps/backend/src/app.module.ts`

```typescript
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000,
        limit: 60, // 60 requests per minute
      },
      {
        name: 'strict',
        ttl: 60000,
        limit: 10, // 10 requests per minute for sensitive endpoints
      },
      {
        name: 'auth',
        ttl: 3600000, // 1 hour window
        limit: 5, // 5 login attempts per hour
      },
    ]),
    // ... other imports
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
```

**Apply to auth controller:**
```typescript
import { Controller, Post, Body, UseGuards, Throttle } from '@nestjs/common';

@Controller('auth')
export class AuthController {
  @Post('login')
  @Throttle({ auth: { limit: 5, ttl: 3600000 } })
  async login(@Body() loginDto: LoginDto) {
    // Login endpoint limited to 5 attempts per hour
    return this.authService.login(loginDto);
  }
}
```

---

## 8. Disable SQL Logging in Production 📊 MEDIUM

**Update:** `apps/backend/src/app.module.ts`

```typescript
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        url: configService.get('DATABASE_URL'),
        autoLoadEntities: true,
        synchronize: false,
        // FIX: Only enable logging in development
        logging: process.env.NODE_ENV === 'development' 
          ? ['error', 'warn', 'query']
          : ['error', 'warn'],
        maxQueryExecutionTime: 1000, // Log slow queries only
      }),
      inject: [ConfigService],
    }),
  ],
})
export class AppModule {}
```

---

## 🚀 Testing Checklist

After implementing fixes, test:

- [ ] CORS: Try requests from unauthorized domain (should fail)
- [ ] CORS: Try requests from authorized domain (should succeed)
- [ ] Encryption: Restart backend without ENCRYPTION_KEY (should fail gracefully)
- [ ] Logs: No sensitive data in stdout (use `npm run build && npm start 2>&1 | grep -i password`)
- [ ] Rate limiting: Exceed endpoint limits (should get 429 error)
- [ ] Security headers: Check with curl: `curl -I https://aimstore.in | grep -i "strict\|x-frame\|csp"`
- [ ] Input validation: Send invalid email to login (should get 400 error)

---

## 📝 Environment File Template

**`.env.production.example`:**
```env
# Database
DATABASE_URL=postgresql://postgres:STRONG_PASSWORD@postgres:5432/aerostic
DB_SSL=true

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT & Security
JWT_SECRET=<generate: openssl rand -hex 32>
ENCRYPTION_KEY=<generate: openssl rand -hex 32>

# CORS
ALLOWED_ORIGINS=https://app.aimstore.in,https://admin.aimstore.in,https://aimstore.in

# Meta WhatsApp
META_APP_ID=<from Meta Developers>
META_APP_SECRET=<from Meta Developers>
META_REDIRECT_URI=https://api.aimstore.in/meta/callback
META_WEBHOOK_VERIFY_TOKEN=<generate: openssl rand -hex 16>

# AI Services
GEMINI_API_KEY=<from Google Cloud>
OPENAI_API_KEY=<optional>

# Payment (Razorpay)
RAZORPAY_KEY_ID=<from Razorpay>
RAZORPAY_KEY_SECRET=<from Razorpay>
RAZORPAY_WEBHOOK_SECRET=<from Razorpay>

# Monitoring
SENTRY_DSN=<from Sentry>
NODE_ENV=production

# Frontend
NEXT_PUBLIC_API_URL=https://api.aimstore.in
APP_URL=https://app.aimstore.in
```

---

## 🔄 Deployment Steps

1. **Generate secrets:**
   ```bash
   JWT_SECRET=$(openssl rand -hex 32)
   ENCRYPTION_KEY=$(openssl rand -hex 32)
   WEBHOOK_TOKEN=$(openssl rand -hex 16)
   echo "JWT_SECRET=$JWT_SECRET"
   echo "ENCRYPTION_KEY=$ENCRYPTION_KEY"
   ```

2. **Create production .env:**
   ```bash
   cp .env.production.example .env
   # Edit with real values
   nano .env
   ```

3. **Test locally:**
   ```bash
   docker-compose down && docker-compose up --build
   ```

4. **Verify security:**
   ```bash
   curl -H "Origin: https://evil.com" http://localhost:3001/api/ -v
   # Should return CORS error
   ```

5. **Deploy to AWS:**
   ```bash
   ./deploy_aws.sh
   ```

---

**Questions?** Refer back to the main SECURITY_AUDIT_REPORT.md file.
