# Aimstors Solution: Master Architecture Blueprint (v2.6.0)

Aimstors Solution is a high-performance, multi-tenant WhatsApp Automation platform featuring a modern micro-monolith architecture. It is designed to scale to 5,000,000+ users with strict security and multi-tenant isolation.

## 🏗️ Core Architecture Components

### 🛡️ Security & Identity Layer
The security layer is the project's foundation, ensuring total data isolation and traceable high-privileged actions.
- **Enterprise RBAC**: Defined in `backend/shared/guards/roles.guard.ts`. Uses a numeric power-level hierarchy.
- **Rotating Sessions**: Every login/refresh issues a one-time-use refresh token. Managed by `UserSession` entity.
- **Tenant Isolation**: Deeply integrated `TenantGuard` ensures no database query can cross tenant boundaries.
- **Impersonation Traceability**: Super Admins can impersonate tenants; sessions are marked with `isImpersonation` and `impersonatedBy` flags for auditing.
- **Structured API Keys**: Enterprise-grade `ask_live_...` keys with SHA-256 hashing, per-key rate limiting (Redis), and IP whitelisting.
- **SOC2 Audit Logging**: Forensic-ready, hash-chained logs with automated alerting for sensitive configuration changes and security events.
- **Python ML Microservice**: Isolation Forest ML for multi-dimensional, self-defending SaaS security. Deployed as a dedicated FastAPI service for production-grade performance.

### 🌐 System Infrastructure
- **API Service**: Handles core REST requests, reseller logic, and campaign management.
- **Frontend Edge Routing**: Next.js `middleware.ts` enforces strict subdomain multitenancy (`app.*`, `admin.*`, `api.*`) at the edge layer.
- **ML Service**: Dedicated Python engine for real-time anomaly inference and feature engineering.
- **Webhook Service**: High-throughput service specifically for Meta Graph API webhooks and automated wallet refunds for failed messages.
- **Worker Clusters**: Regional BullMQ workers handling bulk campaigns, AI processing, and usage metrics per-tenant.
- **Event Bus (Kafka)**: The backbone for sub-second security telemetry and platform-wide correlation.

## 🔄 Business Logic Flows

### 1. The Billing Cycle (Ledger-Based & Real-Time)
Instead of mutable balance fields, Aimstors Solution uses an immutable `UsageEvent` ledger.
- **Events**: `outgoing_message`, `ai_agent_call`, `document_storage`.
- **Worker**: `usage-worker` processes events and updates `TenantDailyMetrics`.
- **Validation**: API checks historical ledger sums before allowing high-cost actions.
- **Dynamic Pricing**: WhatsApp template messaging costs are fully configurable per tenant via the Admin panel, actively deducting from wallets prior to broadcasts and automatically refunding failed payload deliveries via native webhook parsing.

### 2. The Automation Engine
A recursive execution engine that processes visual workflows.
- **Visual Builder**: Generates JSON-based DAGs (Directed Acyclic Graphs).
- **Execution**: The `automation-worker` traverses the graph, executing nodes (AI, HTTP, Drive) sequentially.
- **Safety**: Max execution depth and timeout guards prevent infinite loops and resource exhaustion.

## 📈 Scaling Roadmap
- **Phase 1 (Complete)**: Optimized single-DB with partitioning on `messages` and `usage_events`.
- **Phase 2 (Active)**: Transitioned to Python ML Microservice and Kafka event bus for sub-second correlation.
- **Phase 3**: Regional worker deployment for lower latency in Meta API calls.
- **Phase 4**: Shared-nothing architecture for extreme tenant isolation at the infrastructure level.

## 🔒 Security Best Practices Enforced
- **Bcrypt (6 rounds)** for password hashing.
- **AES-256-GCM** for external OAuth secret storage.
- **SHA-256** hashing for session token storage.
- **Nginx WAF** for rate-limiting and SQLi protection.
- **Strict CORS & CSP** policies for all subdomains.

---
*Blueprint version 2.6.0 | Confidential & Proprietary*
