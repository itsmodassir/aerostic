# 🚀 Production Deployment & Migration Guide

This document outlines the standard procedures for deploying changes to production, ensuring data integrity and minimal downtime.

## ✅ Pre-Deployment Checklist

1. **Verify Security Fixes:** Ensure all critical security patches are applied (CORS, Encryption, etc.).
2. **Run Tests:** `npm run test` (if available) or manual verification.
3. **Backup Database:** Recommended before major schema changes.

## 📦 Deployment Steps

### 1. Pull Latest Changes
```bash
git pull origin main
```

### 2. Install Dependencies
```bash
npm ci --production
```

### 3. Build Application
```bash
npm run build
```

### 4. Run Database Migrations
**Critical Step:** Apply pending database schema changes.
```bash
npm run migration:run
```
*If this fails, check database connection and logs.*

### 5. Restart Services
Use PM2 or Docker Compose to restart the application.
```bash
pm2 restart all
# OR
docker-compose up -d --build
```

### 6. Verify Health
Check if the application is running and healthy.
```bash
curl -I https://app.aerostic.com/health
```

## 🔄 Rollback Procedure

If deployment fails:

1. **Revert Code:** `git checkout <previous-commit-hash>`
2. **Revert Migrations:** `npm run migration:revert` (Use with caution!)
3. **Rebuild & Restart:** Repeat steps 2-5.

## 📝 Configuration Management

- **Environment Variables:** Update `.env` file on the server if new variables were added.
- **System Config:** Update `system_config` table via Admin UI for runtime settings.

---
**Last Updated:** February 11, 2026
