# 🏗️ AEROSTIC – SYSTEM BLUEPRINT

**(Multi-tenant WhatsApp SaaS, Meta-compliant)**

---

## 1️⃣ ARCHITECTURE OVERVIEW

```text
                        CLOUDFLARE (WAF + DNS)
                                  │
                        META (WhatsApp Cloud API)
                                  │
                                  │ Webhooks
                                  ▼
                        ┌─────────────────────┐
                        │  NGINX Reverse Proxy│
                        │  (Docker + Certbot) │
                        └─────────────────────┘
                                  │ (Subdomain Routing)
                ┌─────────────────┼─────────────────┐
                ▼                 ▼                 ▼
       ┌─────────────────┐ ┌─────────────────┐ ┌──────────────────┐
       │ Frontend App    │ │ Backend API     │ │ Webhook Handler  │
       │ aerostic.com    │ │ api.aerostic.com│ │ (Async Processing)│
       │ app.aerostic.com│ └─────────────────┘ └──────────────────┘
       │ admin.aerostic.com│       │                 │
       └─────────────────┘         │                 │
                │                  ▼                 ▼
                │       ┌────────────────────────────────────────────────┐
                │       │              PostgreSQL 15 (TypeORM)           │
                │       │         (Managed via Versioned Migrations)     │
                │       └────────────────────────────────────────────────┘
                ▼                  │
       ┌─────────────────┐         ▼
       │ Redis 7 (Queues)│  ┌─────────────────────────┐
       │ BullMQ Workers  │  │ AI & Automation Engine  │
       │ Broadcasts      │  │ Google Gemini Pro       |
       | WebSockets      |  | Workflow Execution (n8n)|
       | API Integrations|  | Drive/Sheets/Webhooks   |
       └─────────────────┘  └─────────────────────────┘
```

---

## 2️⃣ PROJECT STRUCTURE (ENGINEERING TREE)

```text
aerostic/
├── apps/
│   ├── backend/         # NestJS 11 + TypeORM (Enterprise API)
│   │   ├── src/
│   │   │   ├── admin/   # Platform Admin Service
│   │   │   ├── automation/# Workflow Engine (Nodes, Rules, Execution)
│   │   │   ├── common/  # Encryption, Guards, Redis
│   │   │   ├── google/  # Google Drive & Sheets Integration (OAuth2)
│   │   │   ├── meta/    # Meta OAuth & Cloud API
│   │   │   ├── ai/      # AI Agents & Recursive Execution Engine
│   │   │   └── webhooks/# Meta Webhook Handler
│   │   └── migrations/  # Versioned DB Schema Changes
│   └── frontend/        # Next.js 16 (Subdomain-Aware)
│       ├── app/
│       │   ├── (public)/# aerostic.com (Landing)
│       │   ├── (auth)/  # Consolidated login/register
│       │   ├── dashboard/# app.aerostic.com (SaaS)
│       │   │   └── .../automation/builder/ # Visual Workflow Editor
│       │   └── admin/   # admin.aerostic.com (Platform Control)
│       └── middleware.ts# Subdomain router & tenant context
├── docs/                # System Blueprints & Master Docs
├── nginx/               # Production Nginx (Cloudflare Hardened)
├── docker-compose.yml   # Multi-service Orchestration
└── deploy_aws.sh        # Automated AWS Deployment
```

---

## 3️⃣ WEBSITE ROUTE TREE

| Domain | Scope | Access Roles |
| :--- | :--- | :--- |
| **aerostic.com** | Branding & Landing | Public |
| **auth.aerostic.com** | Authentication Hub | Users/Admins |
| **app.aerostic.com** | Workspace SaaS Hub | `Owner`, `Admin`, `Agent` |
| **admin.aerostic.com** | Platform Control | `SuperAdmin` |

### app.aerostic.com Path Detail:
- `/dashboard/[workspaceId]/` -> Main entry for tenants.
- `.../(owner)/` -> Billing, Subscription, Team Settings.
- `.../(admin)/` -> Campaigns, Automation, AI Settings.
- `.../(agent)/` -> Shared Inbox, Contacts, Live Chat.

---

## 4️⃣ CORE SECURITY FEATURES

### 🔒 Data Security
- **HMAC Verification**: All Meta webhooks verified via `X-Hub-Signature-256`.
- **Granular Scopes Fallback**: `MetaService` extracts WABA IDs from `granular_scopes` inside the debug token to bypass restricted business listing permissions.
- **Manual Popup Security**: Switched from SDK-implicit login to manual OAuth popups for 100% control over the `redirect_uri` to prevent mismatch attacks and errors.
- **Database Safety**: `synchronize: false` in production; managed via versioned **TypeORM Migrations**. Fixed circular dependencies using string-based entity decoupling.

### 🛡️ System Hardening & AI Security
- **Strict Node Validation**: Workflow builder enforces type-safe connections (e.g., Models can only connect to Agent Model inputs).
- **Recursive Execution Safety**: AI Agents use a `MAX_TURNS` limit (10) to prevent infinite loops during tool execution.
- **Workflow Persistence**: State is persisted with **30s Auto-save** intervals; supports **JSON Export/Import** for portability.
- **Encrypted Tokens**: Google OAuth refresh tokens are stored using AES-256-CBC encryption.

### 🛡️ Infrastructure (Hardened Nginx)
- **Cloudflare Trusted**: Trusts Cloudflare IP ranges; uses `CF-Connecting-IP` for real visitor tracing.
- **TLS 1.3**: Hardened SSL configuration with preferred ciphers.
- **Rate Limiting**: Nginx-level throttling for `/api/login` and `/webhooks/meta`.
- **WebSocket Isolation**: `Upgrade` headers scoped strictly to `/socket.io/`.

---

## 5️⃣ DATABASE SCHEMA (MODERN)

### Core Entities
- **Tenants**: ID, Name, Plan, Status.
- **WhatsappAccount**: Encrypted `accessToken`, `wabaId`, `phoneNumberId`, `status`.
- **Template**: Name, Category, Language, Components, Status (`PENDING`, `APPROVED`, `REJECTED`), and `rejectionReason`.
- **Message**: Unique `meta_message_id` (Idempotency), Direction, Content, Type.
- **SystemConfig**: Encrypted platform secrets (AI Keys, Meta Secrets).

---

## 6️⃣ DATA FLOW: MESSAGE INBOUND
1. **Cloudflare** passes request to **Nginx**.
2. **Nginx** validates real IP and routes to **Webhook Handler**.
3. **Webhook Handler** verifies Meta signature.
4. **Service** checks for duplicate `meta_message_id` (Idempotency).
5. **AI Service** (Gemini Pro) processes content if enabled.
6. **Socket.IO** emits real-time update to the relevant `[workspaceId]` group.

---

## 7️⃣ INFRASTRUCTURE & DEPLOYMENT
- **Runtime**: Node 22 (Backend), Standalone build (Frontend).
- **Meta API Version**: Hardcoded to **v21.0** across all services for stability and latest feature access.
- **Orchestration**: Docker Compose with bridge networking.
- **Monitoring**: Health endpoints with consistent `text/plain` responses on all subdomains.

---

## 8️⃣ DATA FLOW: WEBHOOK TRIGGERS & API INTEGRATIONS
1. **External System** sends POST request to `https://api.aerostic.com/automation/webhooks/:workflowId`.
2. **Nginx** routes request to `AutomationWebhooksController`.
3. **Workflow Service** executes the workflow immediately (Direct Execution).
4. **Context Injection**:
   - `body`, `query`, and `headers` are injected into `context.webhookPayload`.
5. **ApiNode Execution**:
   - Backend uses `axios` to fetch external data.
   - Response is stored in `context.apiResponse` (or custom variable).
6. **GoogleDriveNode**:
   - Backend uses `GoogleService` to upload/read files.
   - Result is stored in `context.driveResult`.
