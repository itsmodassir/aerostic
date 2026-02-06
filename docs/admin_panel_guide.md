# Aerostic Admin Panel - Complete Guide

## Overview

Aerostic **already has a production-ready super admin system** built into the backend. This guide documents the existing admin architecture and how to build the frontend admin panel.

---

## ✅ What Already Exists (Backend)

### Admin Controller
**File**: [`admin.controller.ts`](file:///Users/Modassir/Desktop/aerostic/apps/backend/src/admin/admin.controller.ts)

**Protected by**: `AdminGuard` - Only users with admin role can access

### Core Features Implemented

| Feature | Status | Endpoint |
|---------|--------|----------|
| Tenant Management | ✅ | `GET /admin/tenants` |
| User Management | ✅ | `GET /admin/users` |
| Plan Updates | ✅ | `PATCH /admin/users/:id/plan` |
| WhatsApp Accounts | ✅ | `GET /admin/whatsapp-accounts` |
| System Config | ✅ | `GET/POST /admin/config` |
| Dashboard Stats | ✅ | `GET /admin/stats` |
| Billing Stats | ✅ | `GET /admin/billing/stats` |
| Analytics Trends | ✅ | `GET /admin/stats/trends` |
| System Health | ✅ | `GET /admin/health` |
| API Keys | ✅ | `GET /admin/api-keys` |
| Messages | ✅ | `GET /admin/messages` |
| Webhooks | ✅ | `GET /admin/webhooks` |
| System Alerts | ✅ | `GET /admin/alerts` |

---

## Architecture

```
┌─────────────────────────────────────┐
│   Admin Panel (admin.aerostic.com)  │
│   - Tenant Management               │
│   - Subscription Control            │
│   - Revenue Dashboard               │
│   - System Monitoring               │
└─────────────────┬───────────────────┘
                  │
                  ↓
┌─────────────────────────────────────┐
│   Backend API (api.aerostic.com)    │
│   /admin/* endpoints                │
│   Protected by AdminGuard           │
└─────────────────┬───────────────────┘
                  │
                  ↓
┌─────────────────────────────────────┐
│   PostgreSQL Database               │
│   - tenants                         │
│   - subscriptions                   │
│   - users                           │
│   - whatsapp_accounts               │
└─────────────────────────────────────┘
```

---

## API Reference

### 1. Dashboard Stats

**Endpoint**: `GET /admin/stats`

**Response**:
```json
{
  "totalTenants": 245,
  "activeTenants": 198,
  "totalUsers": 312,
  "totalMessages": 45231,
  "messagesThisMonth": 12450,
  "activeSubscriptions": 198,
  "mrr": 492000,
  "arr": 5904000
}
```

---

### 2. Get All Tenants

**Endpoint**: `GET /admin/tenants`

**Response**:
```json
[
  {
    "id": "uuid",
    "name": "Acme Corp",
    "email": "admin@acme.com",
    "status": "active",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### 3. Get All Users

**Endpoint**: `GET /admin/users`

**Response**:
```json
[
  {
    "id": "uuid",
    "tenantId": "uuid",
    "email": "user@example.com",
    "role": "admin",
    "subscription": {
      "plan": "growth",
      "status": "active",
      "monthlyMessages": 50000,
      "aiCredits": 5000
    }
  }
]
```

---

### 4. Update User Plan

**Endpoint**: `PATCH /admin/users/:id/plan`

**Body**:
```json
{
  "plan": "growth",
  "status": "active"
}
```

**Plans**:
- `starter` - 10,000 messages/month, ₹1,999
- `growth` - 50,000 messages/month, ₹2,499
- `enterprise` - Unlimited, ₹6,999

---

### 5. Get WhatsApp Accounts

**Endpoint**: `GET /admin/whatsapp-accounts`

**Response**:
```json
[
  {
    "id": "uuid",
    "tenantId": "uuid",
    "phoneNumberId": "123456789",
    "wabaId": "987654321",
    "displayPhoneNumber": "+919876543210",
    "verifiedName": "Acme Corp",
    "status": "connected",
    "createdAt": "2024-01-15T10:30:00Z"
  }
]
```

---

### 6. System Health

**Endpoint**: `GET /admin/health`

**Response**:
```json
{
  "status": "healthy",
  "uptime": 123456,
  "timestamp": "2024-02-06T19:00:00Z",
  "memory": {
    "rss": 123456789,
    "heapTotal": 98765432,
    "heapUsed": 87654321
  },
  "version": "1.0.0"
}
```

---

### 7. Billing Stats

**Endpoint**: `GET /admin/billing/stats`

**Response**:
```json
{
  "mrr": 492000,
  "arr": 5904000,
  "totalRevenue": 1234567,
  "subscriptionBreakdown": {
    "starter": 120,
    "growth": 65,
    "enterprise": 13
  },
  "churnRate": 2.5,
  "growthRate": 15.3
}
```

---

### 8. Analytics Trends

**Endpoint**: `GET /admin/stats/trends?range=30d`

**Query Params**:
- `range`: `7d`, `30d`, `90d`, `1y`

**Response**:
```json
{
  "messagesTrend": [
    { "date": "2024-02-01", "count": 1234 },
    { "date": "2024-02-02", "count": 1456 }
  ],
  "usersTrend": [...],
  "revenueTrend": [...]
}
```

---

### 9. System Configuration

**Get Config**: `GET /admin/config`

**Response**:
```json
{
  "META_APP_ID": "***",
  "META_APP_SECRET": "***",
  "RAZORPAY_KEY_ID": "***",
  "SYSTEM_EMAIL": "admin@aerostic.com"
}
```

**Update Config**: `POST /admin/config`

**Body**:
```json
{
  "SYSTEM_EMAIL": "new-admin@aerostic.com",
  "FEATURE_FLAG_AI": "true"
}
```

---

### 10. Get All Messages (Monitoring)

**Endpoint**: `GET /admin/messages?page=1&limit=20&search=keyword`

**Response**:
```json
{
  "messages": [...],
  "total": 45231,
  "page": 1,
  "pages": 2262
}
```

---

## Subscription Management

### Plan Limits

**Defined in**: [`billing.service.ts`](file:///Users/Modassir/Desktop/aerostic/apps/backend/src/billing/billing.service.ts)

```typescript
{
  STARTER: {
    monthlyMessages: 10000,
    aiCredits: 1000,
    maxAgents: 1,
    apiAccess: false,
    priceInr: 1999
  },
  GROWTH: {
    monthlyMessages: 50000,
    aiCredits: 5000,
    maxAgents: 5,
    apiAccess: true,
    priceInr: 2499
  },
  ENTERPRISE: {
    monthlyMessages: 999999,
    aiCredits: 999999,
    maxAgents: 999,
    apiAccess: true,
    priceInr: 6999
  }
}
```

### Subscription Statuses

- `trial` - 14-day trial period
- `active` - Paid and active
- `past_due` - Payment failed
- `canceled` - Subscription canceled

---

## Admin Guard (Security)

**File**: `common/guards/admin.guard.ts`

**How it works**:
1. Checks if user has `role: 'admin'` or `role: 'super_admin'`
2. Blocks all non-admin requests with `403 Forbidden`
3. Applied to entire `/admin/*` controller

**User Roles**:
- `user` - Regular tenant user
- `admin` - Tenant admin
- `super_admin` - Platform super admin (full access)

---

## Frontend Admin Panel Structure

Create a separate Next.js app for the admin panel:

```
apps/admin-panel/
├── app/
│   ├── dashboard/
│   │   └── page.tsx
│   ├── tenants/
│   │   ├── page.tsx
│   │   └── [id]/page.tsx
│   ├── users/
│   │   └── page.tsx
│   ├── subscriptions/
│   │   └── page.tsx
│   ├── revenue/
│   │   └── page.tsx
│   ├── whatsapp-accounts/
│   │   └── page.tsx
│   ├── system/
│   │   ├── health/page.tsx
│   │   ├── config/page.tsx
│   │   └── logs/page.tsx
│   └── layout.tsx
├── components/
│   ├── Sidebar.tsx
│   ├── StatsCard.tsx
│   ├── TenantTable.tsx
│   └── RevenueChart.tsx
└── lib/
    └── admin-api.ts
```

---

## Example Admin Dashboard Component

```typescript
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/admin-api';

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  async function loadStats() {
    try {
      const res = await api.get('/admin/stats');
      setStats(res.data);
    } catch (error) {
      console.error('Failed to load stats:', error);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

      <div className="grid grid-cols-4 gap-6">
        <StatsCard
          title="Total Tenants"
          value={stats.totalTenants}
          icon="👥"
        />
        <StatsCard
          title="Active Users"
          value={stats.totalUsers}
          icon="✅"
        />
        <StatsCard
          title="MRR"
          value={`₹${stats.mrr.toLocaleString()}`}
          icon="💰"
        />
        <StatsCard
          title="Messages Today"
          value={stats.totalMessages.toLocaleString()}
          icon="📨"
        />
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">Recent Activity</h2>
        {/* Activity feed */}
      </div>
    </div>
  );
}

function StatsCard({ title, value, icon }: any) {
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <div className="text-4xl mb-2">{icon}</div>
      <div className="text-gray-600 text-sm">{title}</div>
      <div className="text-3xl font-bold">{value}</div>
    </div>
  );
}
```

---

## Example Tenants Management Page

```typescript
'use client';

import { useEffect, useState } from 'react';
import api from '@/lib/admin-api';

export default function TenantsPage() {
  const [tenants, setTenants] = useState<any[]>([]);

  useEffect(() => {
    loadTenants();
  }, []);

  async function loadTenants() {
    const res = await api.get('/admin/tenants');
    setTenants(res.data);
  }

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Tenants</h1>

      <table className="w-full bg-white rounded-lg shadow">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-6 py-3 text-left">Name</th>
            <th className="px-6 py-3 text-left">Email</th>
            <th className="px-6 py-3 text-left">Status</th>
            <th className="px-6 py-3 text-left">Created</th>
            <th className="px-6 py-3 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          {tenants.map((tenant) => (
            <tr key={tenant.id} className="border-t">
              <td className="px-6 py-4">{tenant.name}</td>
              <td className="px-6 py-4">{tenant.email}</td>
              <td className="px-6 py-4">
                <span className="px-2 py-1 bg-green-100 text-green-800 rounded">
                  {tenant.status}
                </span>
              </td>
              <td className="px-6 py-4">
                {new Date(tenant.createdAt).toLocaleDateString()}
              </td>
              <td className="px-6 py-4">
                <button className="text-blue-600 hover:underline">
                  View Details
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

---

## Domain Setup

**Recommended DNS Configuration**:

```
admin.aerostic.com  → Admin Panel (Port 3002)
app.aerostic.com    → Customer App (Port 3000)
api.aerostic.com    → Backend API (Port 3001)
```

**Nginx Configuration**:

```nginx
# Admin Panel
server {
  server_name admin.aerostic.com;
  location / {
    proxy_pass http://admin-panel:3002;
  }
}

# Customer App
server {
  server_name app.aerostic.com;
  location / {
    proxy_pass http://frontend:3000;
  }
}

# Backend API
server {
  server_name api.aerostic.com;
  location / {
    proxy_pass http://backend:3001;
  }
}
```

---

## Security Best Practices

1. **Admin Guard**: All `/admin/*` endpoints protected
2. **Role-Based Access**: Only `super_admin` role can access
3. **Audit Logging**: Track all admin actions
4. **Separate Domain**: Admin panel on different subdomain
5. **IP Whitelisting**: Restrict admin access to specific IPs (optional)

---

## Key Features Summary

### ✅ Already Implemented (Backend)

- Tenant management
- User management
- Subscription control
- Plan upgrades/downgrades
- WhatsApp account monitoring
- System health checks
- Billing statistics
- Analytics trends
- System configuration
- API key management
- Webhook monitoring
- System alerts

### 🔄 To Build (Frontend)

- Admin dashboard UI
- Tenant management interface
- Revenue charts
- System monitoring dashboard
- User management UI

---

## Next Steps

1. **Create Admin Panel App**: Set up Next.js app in `apps/admin-panel`
2. **Build Dashboard**: Implement stats cards and charts
3. **Tenant Management**: Create tenant list and detail pages
4. **Revenue Dashboard**: Add Chart.js for revenue visualization
5. **System Monitoring**: Build health check and logs viewer

**Aerostic already has enterprise-grade admin backend!** 🎯
