# 🔐 PRODUCTION HARDENING CHECKLIST
### (Aerostic / WATI-style WhatsApp SaaS)

This checklist defines the **security, scale, and reliability standards** for Aerostic.

---

## 🔴 A. SECURITY (NON-NEGOTIABLE)

### 1️⃣ Token Security (Meta / WhatsApp)
- [ ] ✅ Store **Meta system access token encrypted** (AES-256 or KMS)
- [ ] ✅ Never store tokens in plaintext
- [ ] ✅ Never expose token to frontend
- [ ] ✅ Rotate token on:
  - App secret change
  - Security incident
- [ ] ❌ No user-level tokens
**Rule**: Only backend services can read tokens

### 2️⃣ Webhook Verification (Meta)
- [ ] ✅ Verify `X-Hub-Signature-256`
- [ ] ✅ Reject unsigned or invalid requests
- [ ] ✅ Enforce HTTPS only
- [ ] ✅ Rate-limit webhook endpoint

### 3️⃣ Auth & RBAC
- [ ] ✅ JWT with short expiry
- [ ] ✅ Refresh tokens stored securely
- [ ] ✅ Strict RBAC (super_admin, admin, agent)
- [ ] ❌ No shared accounts

### 4️⃣ Tenant Isolation (CRITICAL)
- [ ] ✅ Every DB query must include `tenant_id`
- [ ] ✅ Use middleware to auto-inject `tenant_id`
- [ ] ❌ No global queries
**Add**: Row-level security (Postgres RLS) if possible

### 5️⃣ PII Protection (WhatsApp Data)
- [ ] ✅ Encrypt phone numbers at rest (or hash + partial display)
- [ ] ✅ Mask numbers in logs
- [ ] ❌ Never log message content in production logs
- [ ] ✅ GDPR-ready delete per tenant

---

## ⚙️ B. RELIABILITY & FAULT TOLERANCE

### 6️⃣ Idempotency (MANDATORY)
- [ ] ✅ Deduplicate webhook events using `meta_message_id`
- [ ] ✅ Prevent double message inserts
- [ ] ✅ Prevent double sends

### 7️⃣ Message Queue (DO NOT SKIP)
- [ ] ✅ Use a queue (BullMQ / RabbitMQ / SQS)
- [ ] ✅ Queue for:
  - Outgoing messages
  - Campaigns
  - AI replies
**Why**: Meta rate limits, prevent spikes, retry safely

### 8️⃣ Retry & Backoff
- [ ] ✅ Exponential backoff on 5xx and Network failures
- [ ] ❌ No infinite retries
- [ ] ✅ Dead-letter queue for failures

### 9️⃣ Timeouts & Circuit Breakers
- [ ] ✅ Timeout Meta API calls (5–8s)
- [ ] ✅ Circuit breaker on repeated failures
- [ ] ❌ Do not block webhook processing

---

## 📈 C. SCALE (10k → 10M+ messages)

### 🔟 Database Scaling
- [ ] ✅ Index:
  - `messages(conversation_id, created_at)`
  - `conversations(last_message_at)`
- [ ] ✅ Partition `messages` table by month
- [ ] ✅ Read replicas for inbox
- [ ] ❌ Long transactions

### 1️⃣1️⃣ Horizontal Scaling
- [ ] ✅ Stateless backend
- [ ] ✅ Sticky sessions NOT required
- [ ] ✅ Auto-scale workers for queues

### 1️⃣2️⃣ Webhook Throughput
- [ ] ✅ Webhook handler must:
  - ACK immediately
  - Process async
- [ ] ❌ No heavy logic inside webhook

---

## 🤖 D. AI SAFETY & CONTROL

### 1️⃣3️⃣ AI Guardrails
- [ ] ✅ Confidence threshold before auto-reply
- [ ] ✅ Max replies per conversation
- [ ] ✅ Blacklist sensitive intents
- [ ] ❌ AI cannot send templates blindly

### 1️⃣4️⃣ Human Override
- [ ] ✅ “Take over conversation” button
- [ ] ✅ Lock AI once agent joins
- [ ] ✅ Clear AI ↔ human boundary

---

## 💰 E. BILLING & ABUSE PREVENTION

### 1️⃣5️⃣ Usage Metering
- [ ] ✅ Track:
  - Conversations (Meta pricing)
  - Messages
  * AI tokens
- [ ] ✅ Per tenant, per billing cycle

### 1️⃣6️⃣ Rate Limits per Tenant
- [ ] ✅ Message per minute limit
- [ ] ✅ Campaign daily limit
- [ ] ❌ Unlimited sending

### 1️⃣7️⃣ Opt-in Compliance
- [ ] ✅ Store opt-in timestamp
- [ ] ✅ Handle STOP / UNSUBSCRIBE
- [ ] ❌ Send without consent

---

## 🧪 F. DEPLOYMENT & OPERATIONS

### 1️⃣8️⃣ Environment Separation
- [ ] ✅ Separate Dev, Staging, Production
- [ ] ❌ Never test on production WABA

### 1️⃣9️⃣ Monitoring & Alerts
- [ ] ✅ Monitor:
  - Webhook failures
  - Send failures
  - 401 / 403 errors
- [ ] ✅ Alerts to Slack / Email

### 2️⃣0️⃣ Audit Logs
- [ ] ✅ Log Admin actions, WhatsApp connections, Token rotations
- [ ] ❌ Do not log message bodies

---

## 🚨 G. META COMPLIANCE (DO NOT IGNORE)

### 2️⃣1️⃣ App Review Readiness
- [ ] ✅ Use only requested permissions
- [ ] ✅ Demo video ready
- [ ] ✅ Explain Embedded Signup clearly
- [ ] ❌ No unused permissions

### 2️⃣2️⃣ WhatsApp Policy Enforcement
- [ ] ✅ Template categories respected
- [ ] ✅ No cold messaging
- [ ] ✅ Enforce conversation windows

---

## 🧠 FINAL GO / NO-GO CHECK
You are **PRODUCTION-READY** only if:
* [ ] ✔ System token only
* [ ] ✔ Embedded Signup only
* [ ] ✔ Central dispatcher
* [ ] ✔ Queue in place
* [ ] ✔ Tenant isolation enforced
* [ ] ✔ Webhook verified
* [ ] ✔ Billing tracked

If **any one** is missing → 🚫 DO NOT ONBOARD CLIENTS
