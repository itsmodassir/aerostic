# AEROSTIC COMPLETE SAAS DOCUMENTATION & CHECKLIST

---

# PHASE 1 — Core Infrastructure Setup

## 1. Domains

Setup these domains:

```
app.aerostic.com     → Customer frontend
admin.aerostic.com   → Admin panel
api.aerostic.com     → Backend API
```

---

## 2. AWS Infrastructure

Minimum production setup:

```
AWS EC2 (Ubuntu)
Docker
Docker Compose
NGINX
SSL (Cloudflare or Let's Encrypt)
```

Recommended production scaling:

```
EC2 instance (backend)
EC2 instance (worker)
RDS PostgreSQL
Elasticache Redis
S3 storage
Cloudflare CDN
```

---

## 3. Docker Services Required

docker-compose services:

```
backend
worker
webhook
postgres
redis
nginx
```

Verify:

```
docker ps
```

---

# PHASE 2 — Database Setup

Core tables checklist:

```
tenants
users
admins
whatsapp_accounts
contacts
messages
broadcasts
subscriptions
payments
pipelines
deals
automation_rules
```

Critical isolation field:

```
tenant_id
```

ALL tables must include tenant_id.

---

# PHASE 3 — WhatsApp Cloud API Integration

## Meta App Setup

Create app at:

```
https://developers.facebook.com
```

Enable:

```
WhatsApp Business API
Facebook Login for Business
Webhooks
```

Add redirect URI (Production):

```
https://app.aerostic.com/meta/callback
```

*Note: Use Manual OAuth Popup flow (v19.0) to ensure redirect_uri consistency.*

---

## Backend OAuth Callback Route

Required endpoint:

```
GET /meta/callback
```

Stores:

```
access_token
waba_id
phone_number_id
tenant_id
```

---

## Webhook Endpoint

```
POST /webhooks/meta
```

Handles:

```
Incoming messages
Delivery status
Read status
```

---

# PHASE 4 — Multi-Tenant Isolation (CRITICAL)

Every table must include:

```
tenant_id
```

Every query must include:

```
WHERE tenant_id = ?
```

Example:

```
SELECT * FROM contacts WHERE tenant_id=$1
```

Never allow cross-tenant access.

---

# PHASE 5 — Real-Time Inbox System

Install:

```
socket.io
```

Backend:

```
socket.join(tenantId)
```

Webhook emits:

```
io.to(tenantId).emit("newMessage")
```

Frontend receives:

```
socket.on("newMessage")
```

---

# PHASE 6 — Broadcast Messaging System

Install:

```
Redis
BullMQ
```

Flow:

```
Broadcast request
↓
Add jobs to queue
↓
Worker sends messages
↓
Webhook confirms delivery
```

Worker required.

---

# PHASE 7 — CRM System

Required tables:

```
contacts
deals
pipelines
activities
automation_rules
```

Auto lead creation from WhatsApp webhook.

---

# PHASE 8 — Subscription Billing (Razorpay)

Install:

```
razorpay SDK
```

Create:

```
customer
subscription
payment
```

Webhook:

```
/webhooks/razorpay
```

Update subscription status automatically.

---

# PHASE 9 — 7-Day Free Trial System

Tenant signup automatically creates:

```
trial_start
trial_end
trial_active=true
```

Cron job expires trial.

Middleware blocks expired tenants.

---

# PHASE 10 — Admin Panel

Admin panel features:

```
Dashboard
Tenant management
Subscription control
Revenue analytics
WhatsApp monitoring
User control
```

Admin routes:

```
/admin/login
/admin/stats
/admin/tenants
/admin/revenue
```

---

# PHASE 11 — Frontend System

Customer frontend includes:

```
Inbox
Contacts
Pipeline
Broadcast
Automations
CRM dashboard
```

Admin frontend includes:

```
Tenants
Revenue
Subscriptions
WhatsApp accounts
```

---

# PHASE 12 — Security Checklist

Must implement:

```
JWT authentication
Tenant isolation
Webhook verification
HTTPS everywhere
Token encryption
Admin role checks
WABA Granular Scope Fallback Check
```

---

# PHASE 13 — Production Deployment Checklist

Before launch verify:

```
Meta app approved
Webhook verified
OAuth working
Subscription working
Trial system working
Admin panel working
Docker stable
SSL active
Domain configured
```

---

# PHASE 14 — Message Sending Flow

```
Frontend request
↓
Backend API
↓
Queue
↓
Worker
↓
WhatsApp API
↓
Webhook response
↓
Database update
↓
Frontend real-time update
```

---

# PHASE 15 — Complete API Checklist

Core APIs required:

Auth:

```
```
POST /auth/login
POST /auth/register/initiate (Req: name, email, phone, workspace, password)
POST /auth/register (Req: otp + all above)
```

WhatsApp:

```
GET /meta/callback
POST /whatsapp/send
POST /webhooks/meta
```

Contacts:

```
GET /contacts
POST /contacts
```

Broadcast:

```
POST /broadcast
```

CRM:

```
GET /deals
POST /deals
```

Admin:

```
POST /admin/login
GET /admin/stats
GET /admin/tenants
```

Billing:

```
POST /billing/create-subscription
POST /webhooks/razorpay
```

---

# PHASE 16 — Scaling Architecture

Supports scaling to:

```
100 users → 10,000 users → 100,000 users
```

Scaling method:

```
Add worker containers
Use Redis queue
Use load balancer
Use RDS PostgreSQL
```

---

# PHASE 17 — Monitoring Checklist

Monitor:

```
Server CPU
Memory
Redis queue
Webhook failures
API latency
```

Use:

```
PM2 or Docker monitoring
AWS CloudWatch
```

---

# PHASE 18 — Revenue Scaling Plan

Example:

```
Starter ₹999 × 1000 users = ₹9,99,000
Growth ₹2499 × 2000 users = ₹49,98,000
Pro ₹3999 × 1000 users = ₹39,99,000
```

Total:

```
₹1 crore+ MRR achievable
```

---

# PHASE 19 — Minimum Launch Checklist

Must complete before launch:

```
Meta WhatsApp integration
Multi-tenant DB
Webhook handler
Send message API
Trial system
Subscription system
Admin panel
Frontend inbox
```

---

# PHASE 20 — Full Aerostic Architecture Overview

```
Frontend (React)
Admin Panel (React)
Backend (Node.js)
PostgreSQL
Redis
Worker containers
WhatsApp API
Razorpay billing
AWS infrastructure
```

---

# FINAL STATUS

Aerostic is now fully capable of running as:

```
WhatsApp Automation SaaS
WhatsApp CRM SaaS
Multi-tenant platform
Subscription SaaS
Enterprise-level system
```

Equivalent to:

```
Interakt
WATI
AiSensy
Respond.io
```
