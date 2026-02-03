# Task: Investigate Full Website

- [x] Investigate project root structure <!-- id: 0 -->
- [x] Investigate `apps` directory to identify frontend/backend components <!-- id: 1 -->
    - [x] Investigate `apps/backend` <!-- id: 1.1 -->
    - [x] Investigate `apps/frontend` <!-- id: 1.2 -->
- [x] Check `docker-compose.yml` for service orchestration <!-- id: 1.3 -->
- [x] Investigate `packages` directory (does not exist) <!-- id: 2 -->
- [x] Check `apps/frontend/app` for route structure <!-- id: 4 -->
- [x] Read `AWS_DEPLOY.md` for deployment context <!-- id: 5 -->
- [x] Summarize findings to the user <!-- id: 4 -->

# Task: Investigate AWS Config

- [x] Analyze `deploy_aws.sh` for connection details <!-- id: 6 -->
- [x] Check `.env` for `NEXT_PUBLIC_API_URL` or instance IP <!-- id: 7 -->
- [x] Verify AWS key accessibility <!-- id: 8 -->
- [x] Search codebase for hardcoded IPs or EC2 hostnames <!-- id: 8.5 -->
- [x] Attempt to verify server status (IP: 13.53.217.6) <!-- id: 9 -->

# Task: Verify Admin Access

- [x] Identify User table schema <!-- id: 10 -->
- [x] Query remote database for admin users <!-- id: 11 -->
- [x] Create/Update admin user if necessary <!-- id: 12 -->

# Task: Separate Admin Route

- [x] Analyze current login flow (`apps/frontend/app/login/page.tsx`) <!-- id: 13 -->
- [x] Check route protection mechanism (middleware or layout) <!-- id: 14 -->
- [x] Create Implementation Plan for Admin separation <!-- id: 15 -->
- [x] Implement separate Admin Login page <!-- id: 16 -->
- [x] Apply stricter route protection for `/admin` <!-- id: 17 -->

# Task: Migrate Admin to Subdomain

- [x] Check Backend CORS settings (`apps/backend/src/main.ts`) <!-- id: 18 -->
- [x] Check/Create Frontend Middleware (`apps/frontend/middleware.ts`) <!-- id: 19 -->
- [x] Create Implementation Plan for Subdomain Migration <!-- id: 20 -->
- [x] Configure Nginx for `admin.aerostic.com` <!-- id: 21 -->
- [x] Implement Frontend subdomain routing logic <!-- id: 22 -->
- [x] Verify CORS and Cross-Domain API calls <!-- id: 23 -->

# Task: Resolve Admin Access Issue

- [x] Check Git status and push changes <!-- id: 24 -->
- [x] SSH to server and pull/deploy changes <!-- id: 25 -->
- [x] Sync files via SCP and manual rebuild <!-- id: 25.1 -->
- [x] Guide user to fix DNS (NXDOMAIN) <!-- id: 26 -->
- [x] Verify middleware routing locally (Host header check) <!-- id: 27 -->
- [x] Fix Redirect Protocol/Port issues <!-- id: 28 -->
- [ ] Final redirect verification <!-- id: 29 -->
- [x] Rebuild frontend container (2nd attempt) <!-- id: 30 -->
- [x] Debug server file state <!-- id: 31 -->
- [x] Force Rebuild (No Cache) <!-- id: 32 -->
- [x] Check Dockerfile and .dockerignore <!-- id: 33 -->
- [x] Check next.config.ts <!-- id: 34 -->
- [x] Nuke and Rebuild Frontend <!-- id: 35 -->
- [x] Final redirect verification <!-- id: 29 -->
- [/] Fix SSL Certificate (Certbot) <!-- id: 36 -->
- [x] Implement Clean Admin URLs (/login) <!-- id: 37 -->
- [x] Deploy Clean URL Fix <!-- id: 38 -->
- [x] Check server file content <!-- id: 41 -->
- [x] Refactor Admin Routes (Route Groups) <!-- id: 42 -->
  - [x] Create (protected) route group
  - [x] Move layout and page to (protected)
  - [x] Clean up protected layout
  - [x] Move all protected pages to (protected)
  - [x] Deploy refactored structure
- [x] Fix missing login page <!-- id: 43 -->
- [x] Deploy Layout Fix <!-- id: 40 -->
- [x] Update Logo and Favicon Everywhere <!-- id: 44 -->
- [x] Deploy Branding Update <!-- id: 45 -->
- [x] Strict Subdomain Routing Fix (Landing vs App vs Admin) <!-- id: 46 -->
    - [x] Update Middleware logic for all 3 zones
    - [x] Fix internal link redirections
    - [x] Deploy and verify live
- [x] Update Documentation <!-- id: 47 -->
    - [x] Refine README.md for new domain structure
    - [x] Update BLUEPRINT.md with latest architecture and Meta API details
- [x] Push Changes to Git <!-- id: 48 -->
    - [x] Stage, commit, and push all recent improvements
- [x] Make User Dashboard Live
    - [x] Enhance backend `AnalyticsService` for real metrics (sent messages, agents, etc.)
    - [x] Secure backend controllers with `JwtAuthGuard`
    - [x] Connect frontend `DashboardPage` to live APIs
    - [x] Connect frontend `BillingPage` to live subscription and usage APIs
    - [x] Update README and Blueprint
- [x] Verify changes on server

# Task: Admin Plan Management
- [x] Analyze current Admin Tenant management UI (`apps/frontend/app/admin/tenants/page.tsx`) <!-- id: 50 -->
- [x] Inspect Backend Tenant and Billing services for plan update logic <!-- id: 51 -->
- [x] Create Implementation Plan for manual upgrades/downgrades <!-- id: 52 -->
- [x] Implement Admin API for force-updating plans <!-- id: 53 -->
- [x] Update Admin UI to allow manual plan selection and status overrides <!-- id: 54 -->
- [x] Verify changes locally and deploy to EC2 <!-- id: 55 -->

# Task: Connect System Health to Real Data
- [x] Investigate `apps/frontend/app/admin/health/page.tsx` and backend health endpoints <!-- id: 56 -->
- [x] Create Implementation Plan for dynamic health monitoring <!-- id: 57 -->
- [x] Implement backend health checks (DB, Redis, API status) <!-- id: 58 -->
- [x] Update frontend to consume live health data <!-- id: 59 -->
- [x] Deploy and verify on EC2 <!-- id: 60 -->

# Task: Fix Persistent Client-side Exception
- [x] Refactor `AdminLayout.tsx` to remove all hook violations (conditional hooks) <!-- id: 65 -->
- [x] Verify `middleware.ts` for potential redirect loops <!-- id: 66 -->
- [x] Check if `localStorage` access is safe for SSR <!-- id: 67 -->
- [x] Deploy and verify live <!-- id: 68 -->

# Task: Diagnose Dashboard Data Loading Issues
- [x] Check backend logs for `/admin/stats` failures <!-- id: 69 -->
- [x] Verify CORS settings in `apps/backend/src/main.ts` <!-- id: 70 -->
- [x] Inspect `AdminService` for potential query failures <!-- id: 71 -->
- [x] Add more granular logging to frontend data fetching <!-- id: 72 -->
- [x] Deploy fixes and verify <!-- id: 73 -->

# Task: Resolve Mock Data and Add Diagnostics
- [x] Implement `getBillingStats` in `AdminService` <!-- id: 74 -->
- [x] Expose `/admin/billing/stats` in `AdminController` <!-- id: 75 -->
- [x] Connect `AdminBillingPage` to live API <!-- id: 76 -->
- [x] Add diagnostic logging to `AdminDashboard` fetch logic <!-- id: 77 -->
- [x] Deploy and verify on EC2 <!-- id: 78 -->

# Task: Resolve Core API 404 Issue
- [x] Diagnose Nginx routing mismatch <!-- id: 79 -->
- [x] Update `nginx.conf` with high-priority `^~ /api/` blocks <!-- id: 80 -->
- [x] Forced Nginx container recreation and volume sync <!-- id: 81 -->
- [x] Verify live dashboard data with new admin credentials <!-- id: 82 -->

# Task: Connect Admin Dashboard to Real Data
- [x] Implement real alerts and top tenants logic in `AdminService.ts` <!-- id: 86 -->
- [x] Update `AdminDashboard` frontend to consume live data <!-- id: 87 -->
- [x] Deploy and verify dashboard real-time activity <!-- id: 88 -->

# Task: Fix Registration Failure
- [x] Standardize frontend API paths to use relative `/api` <!-- id: 89 -->
- [x] Add detailed error logging to backend auth controller <!-- id: 90 -->
- [x] Verify registration flow via Nginx proxy using curl <!-- id: 91 -->
- [x] Verify registration flow via Browser (Full Audit) <!-- id: 91b -->

# Task: Secure User Dashboard
- [x] Implement client-side auth check in `dashboard/layout.tsx` <!-- id: 92 -->
- [x] Deploy and verify redirection for unauthenticated users <!-- id: 93 -->

# Task: System-Wide Audit & Fix
- [ ] Audit Dashboard Navigation & Core Pages <!-- id: 94 -->
    - [ ] Verify "Inbox" page loads and renders <!-- id: 95 -->
    - [ ] Verify "Contacts" page loads and renders <!-- id: 96 -->
    - [ ] Verify "Broadcasts" (Campaigns) page loads and renders <!-- id: 97 -->
    - [ ] Verify "Templates" page loads and renders <!-- id: 98 -->
    - [ ] Verify "Automation" page loads and renders <!-- id: 99 -->
    - [ ] Verify "AI Agent" page loads and renders <!-- id: 100 -->
    - [ ] Verify "Settings" page loads and renders <!-- id: 101 -->
- [ ] Fix identified broken pages/routes <!-- id: 102 -->
- [ ] Verify Landing Page critical elements <!-- id: 103 -->
