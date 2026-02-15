# 📚 Aerostic API Reference

This document provides details on the core API endpoints for the Aerostic platform.

## Base URL
Production: `https://api.aerostic.com/api/v1`
Local: `http://localhost:3001/api/v1`

---

## 🔐 Authentication

### 1. Initiate Registration
Sends an OTP to the user's email address to verify their account.

- **Endpoint:** `POST /auth/register/initiate`
- **Access:** Public

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | Yes | Full name of the user |
| `email` | string | Yes | Work email address |
| `password` | string | Yes | Password (min 6 chars) |
| `workspace` | string | Yes | Unique workspace slug (e.g., `acme-corp`) |
| `phone` | string | Yes | **NEW** Phone number in international format (e.g., `+919876543210`) |

**Example Payload:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "workspace": "acme-corp",
  "phone": "+12345678900"
}
```

#### Response
```json
{
  "success": true,
  "message": "Verification code sent to email"
}
```

---

### 2. Complete Registration (Verify OTP)
Verifies the OTP and creates the user account and workspace.

- **Endpoint:** `POST /auth/register`
- **Access:** Public

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `name` | string | Yes | Full name of the user |
| `email` | string | Yes | Work email address |
| `password` | string | Yes | Password |
| `workspace` | string | Yes | Unique workspace slug |
| `phone` | string | Yes | Phone number in international format |
| `otp` | string | Yes | 6-digit verification code received via email |

**Example Payload:**
```json
{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "SecurePassword123!",
  "workspace": "acme-corp",
  "phone": "+12345678900",
  "otp": "123456"
}
```

#### Response
```json
{
  "user": {
    "id": "uuid...",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "workspaceId": "uuid...",
  "workspaceName": "Acme Corp",
  "access_token": "jwt_token..."
}
```

---

### 3. Login
Authenticates a user and returns an access token (and sets it as a cookie).

- **Endpoint:** `POST /auth/login`
- **Access:** Public

#### Request Body
| Field | Type | Required | Description |
| :--- | :--- | :--- | :--- |
| `email` | string | Yes | Registered email address |
| `password` | string | Yes | User password |

**Example Payload:**
```json
{
  "email": "john@example.com",
  "password": "SecurePassword123!"
}
```

#### Response
```json
{
  "user": {
    "id": "uuid...",
    "email": "john@example.com",
    "name": "John Doe",
    "role": "USER"
  },
  "workspaceId": "uuid...",
  "workspaceName": "Acme Corp"
}
```
*Note: The `access_token` is set in a generic HttpOnly cookie named `access_token`.*

---

## 📞 WhatsApp Integration (Meta)

### 1. Connection Callback
Handles the OAuth callback from Meta's Embedded Signup flow.

- **Endpoint:** `GET /meta/callback`
- **Access:** Public (Meta Redirect)

#### Query Parameters
| Param | Description |
| :--- | :--- |
| `code` | OAuth authorization code |
| `state` | State parameter for CSRF protection |

---

### 2. Webhook
Receives real-time updates from Meta (messages, status).

- **Endpoint:** `POST /webhooks/meta`
- **Access:** Public (Meta Webhook)
- **Security:** Verified via `X-Hub-Signature-256` header using `META_WEBHOOK_VERIFY_TOKEN` (for challenge) and `META_APP_SECRET` (for payload).

---

## 🏢 Reseller & Branding (BETA)

### 1. Platform Reseller Management
- **Endpoint:** `GET /admin/tenants?type=reseller`
- **Access:** Platform Admin (`super_admin`)
- **Description:** List all registered white-label partners.

### 2. Client Onboarding (Reseller)
- **Endpoint:** `POST /reseller/onboard-sub-tenant`
- **Access:** Reseller Owner
- **Payload:** `name`, `ownerEmail`, `password`
- **Description:** Creates a sub-tenant workspace under the reseller.

### 3. Branding Configuration
- **Endpoint:** `PATCH /reseller/branding`
- **Access:** Reseller Owner
- **Payload:** `brandName`, `logo`, `primaryColor`, `supportEmail`, `domain`
- **Description:** Updates white-label settings for the reseller and their clients.

### 4. Public Branding Resolution
- **Endpoint:** `GET /auth/branding?host=:domain`
- **Access:** Public
- **Description:** Resolves branding assets for a given domain/host for white-labeled login pages.

---
