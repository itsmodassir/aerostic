# 🏗️ AEROSTIC – SYSTEM BLUEPRINT

**(Multi-tenant WhatsApp SaaS, Meta-compliant)**

---

## 1️⃣ HIGH-LEVEL SYSTEM ARCHITECTURE

Browser (User / Agent / Admin)
        ↓
    Nginx Proxy (Port 80/443)
    /           |           \
   /            |            \
aerostic.com  app.aerostic.com  admin.aerostic.com
(Landing)     (Dashboard)       (Admin Console)
   \            |            /
    \           |           /
          Backend API (api.aerostic.com)
                ↓
          Core Services
        (Postgres + Redis)
                ↓
      Meta WhatsApp Cloud API
```

---

## 2️⃣ CORE FEATURES

### 🌐 Strict Subdomain Routing
- **Landing Page**: `aerostic.com`
- **User Dashboard**: `app.aerostic.com` (Handles `/dashboard`, `/login`, `/register`)
- **Platform Admin**: `admin.aerostic.com` (Isolated system-wide control)
- **Middleware**: Next.js middleware enforces strict hostname-based redirection and rewrites.

### 📲 WhatsApp Integration
- **Hybrid Support**:
    1.  **Cloud API (New Number)**: Direct integration via Meta API.
    2.  **Embedded Signup (Existing Number)**: Improved OAuth flow with explicit ID capture from Meta `FINISH` event.
-   **Security**: System User Token ownership (Aerostic owns token, user grants permission).

### 🤖 AI & Automation
-   **AI Engine**: Google Gemini Pro integration.
-   **Flow**: Incoming Message -> Webhook -> AI Agent -> Confidence Check -> Reply or Handoff.
-   **Dispatcher**: Centralized message sending service (`/messages/send`) to ensure compliance.

---

## 3️⃣ USER ROLES

| Role            | Access                        |
| --------------- | ----------------------------- |
| **Super Admin** | System logs, billing, all tenants, Meta tokens |
| **Workspace Admin**| Settings, WhatsApp connection, Team management |
| **Agent**       | Inbox, Conversations (No settings access) |
| **AI Agent**    | Automated responder (Internal service) |

---

## 4️⃣ DATABASE SCHEMA (Simplified)

### Tenants & Users
- `tenants`: id, name, plan, status
- `users`: id, tenant_id, email, password_hash, role

### WhatsApp Config
- `whatsapp_accounts`: tenant_id, waba_id, phone_number_id, access_token (encrypted)
- `meta_tokens`: system_user_token, encrypted, rotation_schedule

### Messaging
- `conversations`: id, tenant_id, contact_id, status (open/resolved)
- `messages`: id, conversation_id, content, type, direction (inbound/outbound)

---

## 5️⃣ API STRUCTURE (NestJS)

### Auth
- `POST /auth/login`: User login
- `POST /auth/register`: New tenant signup

### Admin & Billing (New)
- `GET /admin/config`: Fetch system-wide configurations
- `POST /admin/config`: Update system settings
- `PATCH /admin/users/:id/plan`: Manage tenant plans
- `GET /billing/api-keys`: Manage Developer API keys
- `GET /billing/webhooks`: Manage User Webhooks

### WhatsApp
- `GET /whatsapp/embedded/start`: Initiate Embedded Signup (OAuth)
- `GET /meta/callback`: Handle Meta OAuth callback & token exchange
- `POST /whatsapp/cloud/init`: Register new Cloud API number
- `GET /whatsapp/me`: Fetch configured WhatsApp account details

### Messaging (The Dispatcher)
- `POST /messages/send`: **Sole entry point** for sending messages (Text/Template/Media).
    - Validates tenant limits
    - Selects correct phone number ID
    - Calls Meta Graph API

### Webhooks
- `POST /webhooks/meta`: Receives real-time updates (Messages, Status).
    - Verifies signature (X-Hub-Signature)
    - Routes to specific Tenant
    - Triggers AI/Automation pipelines

---

## 6️⃣ INFRASTRUCTURE & DEPLOYMENT

### Docker Stack
- **Frontend**: Next.js (Standalone build)
- **Backend**: NestJS (Node 18 Alpine)
- **Database**: PostgreSQL 15 (Persistent Volume)
- **Cache**: Redis 7 (Queue management)
- **Proxy**: Nginx (Reverse Proxy for Port 80 routing)

### AWS Deployment
- **Script**: `deploy_aws.sh`
- **Process**:
    1.  Install Docker & Compose
    2.  Clone Repository
    3.  Build & Run Containers
    4.  Expose on Port 80 (HTTP)
