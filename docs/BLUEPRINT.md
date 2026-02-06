# 🏗️ AEROSTIC – SYSTEM BLUEPRINT

**(Multi-tenant WhatsApp SaaS, Meta-compliant)**

---

                        META (WhatsApp Cloud API)
                                 │
                                 │ Webhooks
                                 ▼
                      ┌─────────────────────┐
                      │  Load Balancer      │
                      │  AWS ALB / NGINX   │
                      └─────────────────────┘
                                 │
               ┌─────────────────┴─────────────────┐
               │                                   │
               ▼                                   ▼
      ┌─────────────────┐                ┌─────────────────┐
      │ Backend API     │                │ Webhook Worker  │
      │ Node.js Docker  │                │ Node.js Docker  │
      │ api.aerostic.com│                │ webhook handler │
      └─────────────────┘                └─────────────────┘
               │                                   │
               │                                   │
               ▼                                   ▼
      ┌────────────────────────────────────────────────┐
      │              PostgreSQL Database              │
      │                                              │
      │ tenants                                      │
      │ whatsapp_accounts                           │
      │ contacts                                    │
      │ messages                                    │
      │ automations                                 │
      └────────────────────────────────────────────────┘
               │
               │
               ▼
      ┌─────────────────┐
      │ Redis Cache     │
      │ token cache     │
      │ session cache   │
      └─────────────────┘
               │
               ▼
      ┌─────────────────┐
      │ Queue System    │
      │ BullMQ / Redis  │
      │ message queue   │
      └─────────────────┘
               │
               ▼
      ┌─────────────────┐
      │ Worker Nodes    │
      │ Send messages   │
      │ Automation      │
      └─────────────────┘
               │
               ▼
      ┌─────────────────┐
      │ Frontend        │
      │ React SaaS      │
      │ app.aerostic.com│
      └─────────────────┘
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

## 7️⃣ ANALYTICS & REPORTING

### Real-time Tracking
- **Message Usage**: Tracked via `Message` entity counts (directional: 'out').
- **AI Credits**: Monitored via `UsageMetric` entity (calculates credits burned per AI interaction).
- **Agent Count**: Dynamic tracking of `AiAgent` entities per workspace.

### Data Flow
1. **Request**: Frontend calls `/analytics/overview` (JWT Protected).
2. **Aggregation**: `AnalyticsService` queries DB for counts and recent activity.
3. **Response**: Live stats (contacts, sent, received, agents) + Recent conversation history.

---

## 8️⃣ INFRASTRUCTURE & DEPLOYMENT

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
