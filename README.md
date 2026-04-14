# 🚀 Aimstors Solution v2.7.0 - Series B Architecture

**Aerostic** is an enterprise-grade, production-ready, multi-tenant SaaS platform for WhatsApp Marketing & Automation. Built for scale, it features a real-time event-driven architecture and platform-wide performance optimization.

---

## 🌟 Core Pillars

### 🛡️ Enterprise Security & Privacy
*   **Real-Time Analytics**: High-performance tracking and reporting using **Redis** and **PostgreSQL**.
*   **Enterprise Encryption**: Transparent **AES-256-GCM** column-level encryption for all sensitive credentials (WhatsApp tokens, API secrets) via TypeORM transformers.
*   **Privacy-Native (GDPR)**: Automated **PII Masking** in all audit trails and logs. Sensitive data (emails, phones, keys) is never stored in plain text in logs.
*   **Immutable Audit Trails**: HMAC-SHA256 chained audit logs ensuring a tamper-proof history of every critical action on the platform.

### 🤖 Automation & AI
*   **Visual Workflow Builder**: Visual flow editor with auto-save, directional tracing, and JSON export/import.
*   **AI Smart Agents**: Powered by Google Gemini with custom system prompts, variable-aware context, and recursive execution protection.
*   **External Nodes**: Native integration with Google Sheets, Google Drive (OAuth2), and generic HTTP Request nodes.

### 💼 Multi-Tier Reseller Ecosystem
*   **White-Label Support**: Dynamic branding (logos, colors) and custom domain routing per reseller via Next.js Edge Middleware (`middleware.ts`).
*   **Credit/Wallet Ledger**: Ledger-based billing system for precise credit allocation, actively supporting dynamic per-tenant WhatsApp template pricing controls.
*   **Automated Refunds**: Failed template message deliveries automatically compute and return raw ledger credits directly to a tenant's wallet using real-time Webhook telemetry.

---

## 🏗️ Project Architecture

```text
backend/
├── api-service/                # Main REST API (NestJS)
├── webhook-service/            # Meta/WhatsApp Webhook Handler
├── worker-service/             # Background BullMQ Processors
│   └── campaign-worker/        # High-throughput Messaging Engine
└── shared/                     # Reusable Core (Redis, Encryption)

frontend/
└── app-dashboard/              # React/Next.js UI (`app.*`, `admin.*`, `api.*`)

infrastructure/                 # Redis, Nginx & Docker configs
```

---

## 🏗️ Performance & Scale

- **Event Pipeline**: Producers (API/Webhook) → BullMQ → Consumers (Usage/Campaigns) → Redis State Store.
- **Global Baseline**: High-performance analytics comparing individual tenant behavior against platform usage baselines.

---

## ☁️ Deployment

Aerostic is optimized for high-availability clusters.

1.  **Redis Cluster**: For sub-millisecond metrics and queueing.
2.  **PostgreSQL**: Highly available relational database.
3.  **Auto-Deploy**: Use the synced build script to prevent TS corruption in PM2.
    ```bash
    ./deploy_remote_build.sh
    ```
4.  **Developer API Access**: End users can securely access Swagger Interactive Docs using Webhook or REST integrations. The API endpoint is exposed at:
    `[BASE_URL]/api/docs` (Includes interactive JWT `access-token` login to test webhooks and integrations directly).

---

## 📜 Documentation & Blueprints

- [**WhatsApp Handbook**](WHATSAPP_HANDBOOK.md) - Advanced Interactive features & Coexistence guide.
- [**Walkthrough**](docs_archive/walkthrough.md) - Latest "Series B" architectural deep-dives.
- [**Security Audit**](docs_archive/SECURITY_AUDIT_REPORT.md) - Hardening and encryption reports.
- [**Deployment Guide**](docs_archive/AWS_DEPLOY.md) - Scalable production setup.

---

## ⚖️ License

Private Property / UNLICENSED (Default)
Copyright © 2026 Aimstors Solution. All rights reserved.
