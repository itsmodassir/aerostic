# Copilot Instructions for Aerostic Codebase

>This guide provides essential context and actionable rules for AI coding agents working in the Aerostic WhatsApp Marketing SaaS monorepo.

## 🏗️ Architecture Overview
- **Monorepo Structure:**
  - `backend/`: NestJS microservices (API, webhook, worker), shared modules, and domain logic.
  - `frontend/`: Next.js 14 apps for dashboard, admin panel, and landing page.
  - `database/`: Logical schema layout (PostgreSQL tables by domain).
  - `deployment/`, `infrastructure/`: Scripts and configs for AWS, Docker, Nginx, monitoring.
- **Service Boundaries:**
  - API, webhook, and worker services are decoupled but share code via `backend/shared/`.
  - Data flows through PostgreSQL and Redis queues; see `backend/shared/queue/`.
- **Why:**
  - Designed for multi-tenant SaaS, strict role separation, and scalable automation.

## 🛠️ Developer Workflows
- **Local Dev:**
  - Use `./start.sh` (root) to spin up all services (backend, frontend, DB, Redis) via Docker Compose.
  - Access:
    - Frontend: http://localhost:3000
    - Dashboard: http://localhost:3000/dashboard
    - Admin: http://localhost:3000/admin
    - Backend API: http://localhost:3001
- **Build/Test:**
  - Backend: `cd backend && npm run build` (NestJS)
  - Frontend: `cd frontend/app-dashboard && npm run build` (Next.js)
  - Lint: `cd backend && npm run lint` (uses `eslint.config.mjs`)
- **Deployment:**
  - Use `deployment/deploy_aws.sh` for AWS EC2 setup (see docs_archive/README.md for details).

## 📦 Project-Specific Patterns
- **Backend:**
  - Follows NestJS modular structure; each domain (e.g., `users/`, `campaigns/`) is a feature module.
  - Shared logic in `backend/shared/` (e.g., `mail.service.ts`, `encryption.service.ts`).
  - API endpoints are versioned and grouped by domain.
- **Frontend:**
  - Uses Next.js App Router, Tailwind, and ShadCN UI.
  - Components and hooks are colocated by feature in `frontend/app-dashboard/`.
- **Database:**
  - Logical separation by domain; see `database/` for table structure.
  - No ORM models in this folder—see backend TypeORM entities.
- **Queues:**
  - Redis-backed queues for async jobs; see `queues/` and `backend/shared/queue/`.

## 🔗 Integration & Communication
- **External APIs:**
  - Meta WhatsApp Cloud API, Google Drive, Google Sheets (see backend/ai/ and backend/automation/).
- **Internal Communication:**
  - Services communicate via REST, Redis queues, and shared DB.
  - Use DTOs and interfaces in `backend/shared/` for cross-service contracts.

## 📝 Conventions & Gotchas
- **Env Files:** Never commit real `.env`—use `.env.example`.
- **Subdomains:** In production, apps are served on strict subdomains (see Nginx config in `infrastructure/nginx/`).
- **Role Management:** RBAC is enforced in backend and reflected in frontend routes/components.
- **AI/Automation:** Custom workflow engine in `backend/automation/` and `backend/ai/`—see these for extending automation or AI agent logic.

## 📚 Key References
- docs_archive/README.md — High-level overview, dev workflow, deployment
- backend/shared/ — Common logic, cross-service contracts
- backend/api-service/ — Main API entrypoint
- frontend/app-dashboard/ — Main user dashboard app
- database/ — Logical schema
- deployment/ — Scripts for setup and health checks

---
For more, see docs in `docs_archive/` and comments in key modules. When in doubt, prefer existing patterns and reference shared modules.
