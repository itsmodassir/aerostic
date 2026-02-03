# Website Investigation Summary

The project is structured as a monorepo containing a modern full-stack application.

## 🏗 Architecture

- **Frontend**: Next.js 16 (App Router) located in `apps/frontend`.
  - **Port**: 3000
  - **Key Routes**:
    - **Marketing**: Landing (`/`), About, Contact, Pricing, Features.
    - **App**: Dashboard, Login, Register, Admin.
    - **Legal**: Privacy, Terms, Refund.
    - **Docs**: Documentation pages.
- **Backend**: NestJS located in `apps/backend`.
  - **Port**: 3001
  - **Database**: PostgreSQL
  - **Cache**: Redis
- **Infra**: Docker Compose orchestrates the services (Frontend, Backend, Postgres, Redis, Nginx).

## 📂 Key Directories

- **`apps/frontend`**: The main web application.
  - `app/`: Contains the App Router pages and layouts.
  - `components/`: UI components (likely shared).
  - `public/`: Static assets.
- **`apps/backend`**: The API service.
  - `src/`: Source code for modules, controllers, and services.
- **`docker-compose.yml`**: Defines how to run the full stack locally or in production.
- **`AWS_DEPLOY.md`**: Guide for deploying to AWS EC2 using the provided `deploy_aws.sh` script.

## 🔍 Observations

- **Root Confusion**: The root `package.json` is named `vite_react_shadcn_ts`. This appears to be a legacy artifact or a specific configuration for mobile/PWA builds (Capacitor is present), distinct from the main Next.js web app.
- **Deployment**: The system is designed to be deployed as a set of Docker containers behind an Nginx reverse proxy.
