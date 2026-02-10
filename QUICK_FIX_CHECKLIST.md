# 🚀 Aerostic Security Audit - Quick Fix Checklist

**Last Updated:** February 11, 2026  
**Status:** 🔴 NEEDS FIXES BEFORE PRODUCTION

---

## ⏱️ Quick Reference: Time Estimates

| Fix | Priority | Time | Status |
|-----|----------|------|--------|
| Fix CORS | 🔴 Critical | 5 min | ⬜ TODO |
| Fix Encryption Key | 🔴 Critical | 5 min | ⬜ TODO |
| Update .gitignore | 🔴 Critical | 2 min | ⬜ TODO |
| Remove Debug Logs | 🟠 High | 15 min | ⬜ TODO |
| Add Validation | 🟠 High | 20 min | ⬜ TODO |
| Add Security Headers | 🟡 Medium | 10 min | ⬜ TODO |
| Hide Secrets in UI | 🟠 High | 20 min | ⬜ TODO |
| Rate Limiting | 🟡 Medium | 15 min | ⬜ TODO |
| DB Logging | 🟡 Medium | 5 min | ⬜ TODO |
| Migration Docs | 🟡 Medium | 15 min | ⬜ TODO |
| **TOTAL** | - | **~107 min** | - |

---

## 🎯 Critical Fixes (Do First)

### Fix #1: CORS Configuration (5 min)
**File:** `apps/backend/src/main.ts`  
**What:** Change `app.enableCors()` to specific origins  
**Why:** Prevent CSRF and API abuse

```diff
- app.enableCors();
+ app.enableCors({
+   origin: process.env.ALLOWED_ORIGINS?.split(','),
+   credentials: true,
+ });
```

**Add to .env:**
```env
ALLOWED_ORIGINS=https://app.aerostic.com,https://admin.aerostic.com
```

✅ **After fixing:** CORS only allows configured domains

---

### Fix #2: Encryption Key (5 min)
**File:** `apps/backend/src/common/encryption.service.ts`  
**What:** Require ENCRYPTION_KEY env var (no hardcoded fallback)  
**Why:** Prevent decryption of all encrypted secrets

```diff
- const secret = this.configService.get<string>('ENCRYPTION_KEY') || 'aerostic-prod-encryption-default-secret';
+ const secret = this.configService.get<string>('ENCRYPTION_KEY');
+ if (!secret) {
+   throw new Error('ENCRYPTION_KEY environment variable is required');
+ }
```

**Generate and add to .env:**
```bash
openssl rand -hex 32  # Copy output to ENCRYPTION_KEY in .env
```

✅ **After fixing:** Encryption key is required and strong

---

### Fix #3: .gitignore (2 min)
**File:** `.gitignore`  
**What:** Explicitly add .env files  
**Why:** Prevent accidental secrets commits

```diff
+ .env
+ .env.local
+ .env.*.local
+ .env.production
```

✅ **After fixing:** .env files protected from git

---

## 🟠 High Priority (Do This Week)

### Fix #4: Remove Debug Logging (15 min)
**Files:** Multiple (search for `console.log`)  
**What:** Replace with NestJS Logger  
**Why:** Prevent sensitive data in logs

```diff
- console.log(`User login attempt: ${email}`);
+ this.logger.debug('User login attempt'); // Only in dev
```

✅ **After fixing:** No sensitive data in production logs

---

### Fix #5: Add Input Validation (20 min)
**Files:** Auth, Admin endpoints  
**What:** Use class-validator DTOs  
**Why:** Prevent injection attacks

```typescript
// Create DTOs
export class LoginDto {
  @IsEmail()
  email: string;
  
  @MinLength(8)
  password: string;
}

// Enable globally in main.ts
app.useGlobalPipes(new ValidationPipe({
  whitelist: true,
  forbidNonWhitelisted: true,
}));
```

✅ **After fixing:** All inputs validated

---

### Fix #6: Hide Admin Secrets (20 min)
**File:** `apps/frontend/app/admin/system/page.tsx`  
**What:** Don't display actual secrets; only allow updates  
**Why:** Prevent accidental exposure

```diff
- {showSecrets[key] ? value : '••••••••'}
+ '••••••••••••••••' // Always masked
+ // Test connection instead of showing secret
```

✅ **After fixing:** Secrets never visible in UI

---

## 🟡 Medium Priority (Do in 2 Weeks)

### Fix #7: Security Headers (10 min)
**File:** `nginx.conf`  
**What:** Add HSTS, CSP, X-Frame-Options  
**Why:** Protect against XSS, clickjacking, downgrade attacks

```nginx
add_header Strict-Transport-Security "max-age=31536000";
add_header X-Content-Type-Options "nosniff";
add_header X-Frame-Options "SAMEORIGIN";
add_header X-XSS-Protection "1; mode=block";
```

✅ **After fixing:** Security headers present

---

### Fix #8: Rate Limiting (15 min)
**File:** `apps/backend/src/app.module.ts`  
**What:** Add endpoint-specific rate limits  
**Why:** Prevent brute force and abuse

```typescript
@Throttle({ auth: { limit: 5, ttl: 3600000 } })
async login() { /* ... */ }
```

✅ **After fixing:** Login limited to 5 attempts/hour

---

### Fix #9: Database Logging (5 min)
**File:** `apps/backend/src/app.module.ts`  
**What:** Only log in development  
**Why:** Prevent performance impact and data leakage

```diff
- logging: true,
+ logging: process.env.NODE_ENV === 'development' ? ['error', 'warn', 'query'] : ['error'],
```

✅ **After fixing:** No SQL logging in production

---

### Fix #10: Migration Documentation (15 min)
**File:** Create `docs/MIGRATION_GUIDE.md`  
**What:** Document deployment and migration procedures  
**Why:** Prevent deployment failures

```markdown
# Production Deployment
1. Run migrations: npm run migration:run
2. Check schema version
3. Verify all changes
```

✅ **After fixing:** Clear deployment procedures

---

## 🧪 Testing Checklist

After each fix, verify:

### CORS Test
```bash
# Should FAIL (403 CORS error)
curl -H "Origin: https://evil.com" http://localhost:3001/api/

# Should SUCCEED (200 OK)
curl -H "Origin: https://app.aerostic.com" http://localhost:3001/api/
```

### Encryption Key Test
```bash
# Remove ENCRYPTION_KEY from .env and start backend
# Should see error about missing ENCRYPTION_KEY
npm start
```

### Logging Test
```bash
# Should NOT see user emails or passwords
npm run start:prod 2>&1 | grep -i "email\|password"
# Result: (no matches)
```

### Validation Test
```bash
# Send invalid email
curl -X POST http://localhost:3001/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid","password":"pass"}'
# Should return 400 Bad Request
```

### Rate Limiting Test
```bash
# Make 6 login attempts (should fail on 6th)
for i in {1..6}; do
  curl -X POST http://localhost:3001/auth/login \
    -H "Content-Type: application/json" \
    -d '{"email":"test@test.com","password":"password"}'
done
# 6th request should return 429 Too Many Requests
```

### Security Headers Test
```bash
curl -I https://aerostic.com | grep -i "strict\|x-frame\|content-security"
# Should show multiple security headers
```

---

## 📋 Pre-Deployment Verification

- [ ] All 3 critical fixes applied
- [ ] No `console.log()` in production code
- [ ] CORS tested with blocked domain (fails as expected)
- [ ] Encryption key is environment variable (not hardcoded)
- [ ] .env is in .gitignore
- [ ] Security headers present
- [ ] Rate limiting working (429 errors on excessive requests)
- [ ] Input validation working (400 errors on invalid input)
- [ ] Secrets never exposed in admin UI
- [ ] Database logging disabled in production

---

## 🚀 Deployment Steps

1. **Apply all fixes** from this checklist
2. **Run tests** to verify each fix
3. **Deploy to staging:** `./deploy_aws.sh`
4. **Test in staging** with security checklist
5. **Deploy to production:** `./deploy_aws.sh`
6. **Monitor logs** for errors first 24h

---

## 📚 Reference Documents

- **Full Report:** [SECURITY_AUDIT_REPORT.md](SECURITY_AUDIT_REPORT.md)
- **Implementation Guide:** [SECURITY_FIXES_GUIDE.md](SECURITY_FIXES_GUIDE.md)
- **Executive Summary:** [AUDIT_SUMMARY.md](AUDIT_SUMMARY.md)

---

## ❓ FAQ

**Q: Do I need to fix everything before deploying?**  
A: No. Fix all 3 CRITICAL items. Other fixes can be phased in.

**Q: How long will fixes take?**  
A: ~30 minutes for critical fixes, ~2 hours for all high-priority fixes.

**Q: Can I reuse the same ENCRYPTION_KEY?**  
A: Never. Generate a unique 32-character hex string for each environment.

**Q: What if I already deployed without these fixes?**  
A: Apply fixes immediately. For databases with encrypted data:
1. Export data
2. Decrypt with old key
3. Rotate new key
4. Re-encrypt with new key
5. Import data

**Q: How do I generate secrets?**  
A: `openssl rand -hex 32` (JWT secret and encryption key)

---

**Last Updated:** February 11, 2026  
**Audit Status:** 🔴 **FIXES REQUIRED BEFORE PRODUCTION**

✅ Ready to start? Pick Fix #1 (CORS) and get started!
