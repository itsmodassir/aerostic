# Multi-Tenant WhatsApp Token System

Migrate from a global token system to a per-tenant architecture where each customer's token is isolated and managed independently.

## User Review Required

> [!IMPORTANT]
> This change will effectively deprecate the global `MetaToken` table in favor of storing tokens directly in the `WhatsappAccount` table, as per SaaS best practices. Existing connections may need to be refreshed or reconnected to populate the new fields.

## Proposed Changes

### Configuration & Routing
#### [MODIFY] [WhatsappService](file:///Users/Modassir/Desktop/aerostic/apps/backend/src/whatsapp/whatsapp.service.ts)
- Update `getEmbeddedSignupUrl` to use `https://api.aerostic.com/meta/callback` and Graph API `v22.0`.
- Update `sendTestMessage` to retrieve the `accessToken` directly from the `WhatsappAccount` entity instead of the global repo.
- Upgrade all `axios` calls to `v22.0`.

---

### Meta Module
#### [MODIFY] [MetaService](file:///Users/Modassir/Desktop/aerostic/apps/backend/src/meta/meta.service.ts)
- Update `handleOAuthCallback` to save the long-lived `accessToken` and `expiresAt` directly into the `WhatsappAccount` record.
- Ensure the `tenantId` from the OAuth `state` parameter is used correctly for mapping.

#### [MODIFY] [MetaTokenService](file:///Users/Modassir/Desktop/aerostic/apps/backend/src/meta/meta-token.service.ts)
- Refactor `handleTokenRefresh` to iterate through the `WhatsappAccount` table.
- Refresh tokens for all active accounts that are within 10 days of expiry.

---

---

### Global Data Isolation
#### [NEW] [user-tenant.decorator.ts](file:///Users/Modassir/Desktop/aerostic/apps/backend/src/auth/decorators/user-tenant.decorator.ts)
- Implement a custom decorator to safely extract `tenantId` from the JWT payload in the request object.

#### [MODIFY] All Controllers
- Refactor the following controllers to use `@UseGuards(JwtAuthGuard)` and replace `@Query('tenantId')` or `@Body('tenantId')` with `@UserTenant() tenantId: string`:
    - `WhatsappController`
    - `CampaignsController`
    - `AutomationController`
    - `TemplatesController`
    - `ContactsController`
    - `UsersController`
    - `AiController`
    - `MessagesController`

---

---

## Phase 2: Enterprise Infrastructure (₹1 Crore MRR Scale)

### Queue System & Workers
#### [MODIFY] [docker-compose.yml](file:///Users/Modassir/Desktop/aerostic/docker-compose.yml)
- Define separate `worker` and `webhook-handler` services using the same backend image but different start commands.
- Ensure all services link to `redis` and `postgres`.

#### [NEW] [Queue Module]
- Implement `QueueModule` using `@nestjs/bull`.
- Create `MessageQueue` for outbound WhatsApp messages to handle retries and rate limiting.
- Create `WebhookQueue` to process incoming Meta events without blocking the main event loop.

#### [NEW] [Worker Service]
- Implement a dedicated worker that consumes from `MessageQueue`.
- Move message delivery logic from `WhatsappService` to the worker processor.

### Redis Caching
#### [MODIFY] [whatsapp.service.ts](file:///Users/Modassir/Desktop/aerostic/apps/backend/src/whatsapp/whatsapp.service.ts)
- Implement caching for `accessToken` and `wabaId` to reduce database hits on every message sent.

---

## Verification Plan

### Automated Tests
- I will verify the logic by inspecting the SQL database on the AWS server after a simulated or real OAuth flow to ensure `access_token` is populated in `whatsapp_accounts`.

### Manual Verification
1. **OAuth Flow**: User triggers connection. Verify `whatsapp_accounts` table is updated with the new token.
2. **Message Sending**: Trigger a test message. Verify it uses the account's unique token via logs.
3. **Cron Job**: Manually trigger the refresh job and verify it processes `whatsapp_accounts` instead of global tokens.
