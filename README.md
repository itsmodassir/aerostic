# 🚀 Aerostic v2.7.0 - Series B Architecture

**Aerostic** is an enterprise-grade, production-ready, multi-tenant SaaS platform for WhatsApp Marketing & Automation. Built for **Series B scale**, it features a real-time event-driven architecture, a dedicated **Python ML Microservice** for sub-second anomaly detection, and platform-wide fraud correlation.

---

## 🌟 Core Pillars

### 🛡️ Intelligent Security & Privacy
*   **Real-Time Streaming Correlation**: Sub-second (< 2s) anomaly detection using **Kafka** and **Redis Sorted Sets**. Detects coordinated attack waves, botnets, and API scraping instantly.
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
├── ml-service/                 # FastAPI ML Engine (Python)
├── webhook-service/            # Meta/WhatsApp Webhook Handler
├── worker-service/             # Background BullMQ & Kafka Stream Processors
│   ├── anomaly-worker/         # Real-time Cluster & Similarity Engine
│   └── campaign-worker/        # High-throughput Messaging Engine
└── shared/                     # Reusable Core (Kafka, Redis, Encryption)

frontend/
└── app-dashboard/              # React/Next.js UI & Subdomain Edge Routing (`app.*`, `admin.*`, `api.*`)

infrastructure/                 # Kafka Cluster, Redis, Nginx & Docker configs
```

---

## 🏗️ Performance & Scale

- **Event Pipeline**: Producers (API/Webhook) → **Kafka** → Consumers (Anomaly/Usage) → Redis State Store.
- **Anomaly Detection**: Near-instant mitigation (< 2s) for message spikes and credential brute-forcing.
- **Global Baseline**: Comparing individual tenant behavior against a platform-wide usage baseline in real-time.

---

## ☁️ Deployment

Aerostic is optimized for high-availability clusters.

1.  **Kafka Cluster**: 3-broker Zookeeper/KRaft setup.
2.  **Redis Cluster**: For sub-millisecond sliding window metrics.
3.  **Auto-Deploy**:
    ```bash
    ./infrastructure/scripts/deploy_prod.sh
    ```

---

## 📜 Documentation & Blueprints

- [**Walkthrough**](docs_archive/walkthrough.md) - Latest "Series B" architectural deep-dives.
- [**Security Audit**](docs_archive/SECURITY_AUDIT_REPORT.md) - Hardening and encryption reports.
- [**Deployment Guide**](docs_archive/AWS_DEPLOY.md) - Scalable production setup.

---

## ⚖️ License

Private Property / UNLICENSED (Default)
Copyright © 2026 Aerostic. All rights reserved.
