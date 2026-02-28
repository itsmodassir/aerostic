# 🚀 Aimstors Solution - WhatsApp Marketing SaaS

**Aimstors Solution** is a production-ready, multi-tenant SaaS platform for WhatsApp Marketing & Automation. It is built to scale, featuring Meta Embedded Signup, AI-powered responses, and a complete CRM dashboard.

---

## 🌟 Key Features

*   **Multi-tenant Architecture**: Isolated workspaces for every user.
*   **Official Meta Integration**: Supports both **Cloud API** (New Numbers) and **Embedded Signup** (Existing Business Numbers).
*   **Advanced Automation Builder**: n8n-style visual workflow editor with **auto-save (30s)**, **directional flow arrows**, and **scrollable sidebars**.
*   **Workflow Persistence**: Load existing workflows by ID and **Export to JSON** for backups.
*   **Pre-configured Templates**: Instant setup for **Broadcasting** and **Support Assistant** workflows.
*   **External Integrations**: Connect any API via **HTTP Request Node** and manage files with **Google Drive Node**.
*   **Visual Debugging**: Real-time "Test Bot" with green/red execution tracing and error logs.
*   **Google Sheets Integration**: Read and write data directly from spreadsheets in your flows.
*   **Smart AI Agents**: Google Gemini-powered chatbots with **custom system prompts** and variable support.
*   **Campaign Manager**: Bulk broadcasting via audience lists (CSV, Contacts, Sheets).
*   **WhatsApp Template Management**: Create, customize, and submit templates for Meta approval directly.
*   **Real-time Usage Dashboard**: Live tracking of messages and AI credits via **Ledger-Based Billing** (No mutable counters).
*   **Partition-Ready Messaging**: Optimized database schema for high-volume chat history storage.
*   **Team Inbox**: Real-time shared inbox for support agents.
*   **White-label Reseller Module**: Partner management system with **dynamic branding (logo, colors)** and **custom domain routing**.
*   **Credit Management**: Allocate and track credits for sub-tenants/clients in a multi-tier hierarchy.
*   **Role-Based Access**: Super Admin, Platform Admin, Reseller Admin, and Workspace Agent roles.
*   **Secure Google Drive**: OAuth2 integration with encrypted token storage for file operations.
*   **System Hardening**: Strict node connection validation and recursive AI execution engine.

---

## 🛠️ Architecture & Flow

### 🔄 Complete System Flows

- **Outgoing Campaign**: Dashboard → API → `campaign_queue` → `campaign-worker` → Meta API → `messages` table → `usage_events` → `metrics_queue` → Dashboard.
- **Inbound Message**: Meta Webhook → `webhook-service` → `webhook_queue` → `automation-worker` → `ai_queue` (if needed) → AI Reply → Meta → `usage_events`.
- **Analytics Sync**: `usage_events` → `usage-worker` → `tenant_daily_metrics` → Dashboard.

### 🛡️ Security First
- **JWT Isolation**: Tokens include `tenantId` and `tokenVersion`.
- **Strict Multi-Tenancy**: `TenantGuard` enforced on all critical resource paths.
- **AES-256-GCM**: Encryption for all third-party provider tokens.
- **HMAC Verification**: Meta Webhook signature verification mandatory.

### 📈 Scaling Roadmap
- **Early Stage**: Single EC2, partitioned Postgres.
- **Growth Stage**: Read replicas, queue sharding, independent worker clusters.

---

## 🏗️ Project Structure

```text
frontend/
├── landing/                     # React + Vite
│   ├── pages/
│   ├── components/
│   └── build/
│
├── app-dashboard/               # Next.js (Tenant App)
│   ├── app/
│   │   ├── dashboard/
│   │   ├── campaigns/
│   │   ├── automation/
│   │   ├── ai-agents/
│   │   ├── knowledge-base/
│   │   ├── inbox/
│   │   ├── billing/
│   │   └── settings/
│   │
│   ├── middleware.ts            # Host-based tenant resolution
│   ├── components/
│   └── utils/
│
└── admin-panel/                 # Next.js (Platform Admin)
    ├── app/
    │   ├── analytics/
    │   ├── tenants/
    │   ├── resellers/
    │   ├── plans/
    │   ├── revenue/
    │   └── system-health/
    │
    └── components/

backend/
├── api-service/                # Main REST API Service
│   ├── auth/
│   ├── tenants/
│   ├── users/
│   ├── billing/
│   ├── reseller/
│   ├── campaigns/
│   ├── automation/
│   ├── workflows/
│   ├── ai/
│   ├── knowledge-base/
│   ├── analytics/
│   ├── api-keys/
│   └── admin/
│
├── webhook-service/            # Meta/WhatsApp Webhook Handler
│   ├── whatsapp/
│   └── inbound-processing/
│
├── worker-service/             # Background Job Processors
│   ├── campaign-worker/
│   ├── automation-worker/
│   ├── ai-worker/
│   ├── usage-worker/
│   └── metrics-worker/
│
└── shared/                     # Reusable Modules & Utilities
    ├── security/               # AES-256 Encryption & Global Guards
    │   ├── encryption.service.ts
    │   ├── auth.guard.ts
    │   └── tenant.guard.ts
    ├── database/
    │   ├── entities/           # Centralized TypeORM Models
    │   │   ├── core/           # Tenants, Users, Domains, Branding, API Keys
    │   │   ├── billing/        # Plans, Subscriptions, Usage Ledger, Wallet
    │   │   ├── messaging/      # Campaigns, Recipients, Messages, Conversations
    │   │   ├── automation/     # Workflows, Versions, Rules, Executions
    │   │   ├── ai/             # Agents, Knowledge Bases, Chunks
    │   │   └── analytics/      # Tenant & System Daily Metrics
    │   └── data-source.ts
    ├── queue/                  # BullMQ Shared Module & Constants
    ├── security/               # AES-256 Encryption & Global Guards
    ├── logger/                 # Unified Logging System
    ├── guards/                 # RBAC & Auth Protections
    └── middleware/             # Shared Request Handling
```

---

## ☁️ Deployment Guide (AWS)

This project is optimized for deployment on **AWS EC2** (Amazon Linux 2023 or Ubuntu).

### 1-Click Deployment
We provide a helper script to automate the entire setup:

1.  **Launch an EC2 Instance** (t3.small or larger recommended).
2.  **Configure Security Group**: Allow Inbound on Ports `80` (HTTP), `443` (HTTPS), and `22` (SSH).
3.  **Run the Auto-Deploy Script**:
    ```bash
    curl -o deploy_aws.sh https://raw.githubusercontent.com/itsmodassir/aimstors-whatsapp-automation/main/deploy_aws.sh
    chmod +x deploy_aws.sh
    ./deploy_aws.sh
    ```
4.  **Access Your App**:
    *   **Landing Page**: `https://aimstore.in`
    *   **User Dashboard**: `https://app.aimstore.in`
    *   **Platform Admin**: `https://admin.aimstore.in`
    *   **Backend API**: `https://api.aimstore.in/api/` (Internal path: `/api/`)

---

## � Documentation

- [**Blueprint**](docs/BLUEPRINT.md) - System architecture and roadmap
- [**Deployment Guide**](docs/ec2_deployment_guide.md) - **New!** AWS EC2 production setup
- [**Troubleshooting Guide**](docs/troubleshooting.md) - **New!** Fixes for Meta OAuth, Permissions, and Redirects
- [**Admin Panel**](docs/admin_panel_guide.md) - **New!** Super admin system documentation
- [**API Reference**](docs/api_reference.md) - Backend API endpoints
- [**System Design**](docs/system_design.md) - **New!** High-level architecture and security
- [**Walkthrough**](docs/walkthrough.md) - Feature tour and updates

---

## 💻 Local Development

1.  **Clone the Repo**:
    ```bash
    git clone https://github.com/itsmodassir/aimstors-whatsapp-automation.git
    cd aimstors
    ```

2.  **Start Services**:
    ```bash
    ./start.sh
    ```

3.  **Access Locally**:
    *   Frontend (Landing): `http://localhost:3000`
    *   App Dashboard: `http://localhost:3000/dashboard`
    *   Platform Admin: `http://localhost:3000/admin`
    *   Backend: `http://localhost:3001`

    > [!NOTE]
    > In production, these are served via strict subdomains (`app.`, `admin.`, and the root domain).

---

## 🌍 Going Public & Community

If you plan to make this repository **Public** on GitHub, please follow this checklist to ensure security and community readiness:

### 🔒 Security Checklist (Before Public Release)
1.  **Audit Secrets**: Ensure no real API keys, passwords, or `.env` files are committed.
    *   Check `git log` history for accidental commits of secrets.
    *   Use `bfg-repo-cleaner` if you need to scrub history.
2.  **Environment Variables**:
    *   Keep `.env` in `.gitignore` (Already configured).
    *   Provide a `.env.example` with dummy values for users to copy.
3.  **ConfigFile Audit**: Check `config/` or `src/` for any hardcoded tokens.

### 📢 How to Make It Public
1.  Go to **Settings** > **General**.
2.  Scroll to the **Danger Zone** at the bottom.
3.  Click **Change repository visibility**.
4.  Select **Make public** and confirm.

### 💬 Enabling GitHub Discussions
To build a community around Aimstors Solution:
1.  Go to **Settings** > **General**.
2.  Under **Features**, check the box for **Discussions**.
3.  Click **Set up discussions** to create initial categories (General, Ideas, Q&A).

### 🤝 Contributing
We welcome contributions! Please see [CONTRIBUTING.md](CONTRIBUTING.md) (coming soon) for details on how to submit Pull Requests, report bugs, and suggest features.

---

## 📜 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
