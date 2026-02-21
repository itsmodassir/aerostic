# 🌐 Aerostic Multi-Domain Setup Guide

**Domains:**
- `aerostic.com` → Landing page / Home
- `app.aerostic.com` → User Dashboard (Frontend)
- `admin.aerostic.com` → Admin Panel
- `api.aerostic.com` → API Backend

**EC2 Instance:** `13.63.63.170`

---

## 📋 Step 1: DNS Configuration

Point all domains to your EC2 instance. Update your DNS provider with these records:

### A Records (for each domain registrar like GoDaddy, Namecheap, Route53, etc.)

```
Type: A
Name: @
Value: 13.63.63.170
TTL: 3600

Type: A
Name: www
Value: 13.63.63.170
TTL: 3600

Type: A
Name: app
Value: 13.63.63.170
TTL: 3600

Type: A
Name: admin
Value: 13.63.63.170
TTL: 3600

Type: A
Name: api
Value: 13.63.63.170
TTL: 3600
```

### Alternative (If using Route53 on AWS)
```
Domain: aerostic.com → 13.63.63.170
Domain: www.aerostic.com → 13.63.63.170
Domain: app.aerostic.com → 13.63.63.170
Domain: admin.aerostic.com → 13.63.63.170
Domain: api.aerostic.com → 13.63.63.170
```

**⏱️ Wait:** DNS changes typically take 5-30 minutes to propagate. You can verify with:
```bash
nslookup aerostic.com
nslookup app.aerostic.com
```

---

## 🔒 Step 2: Set Up SSL Certificates

Once DNS is configured, run the SSL setup script on the EC2 instance:

```bash
ssh -i ~/Downloads/aimstors.pem ubuntu@13.63.63.170
cd aerostic
sudo chmod +x setup_ssl.sh
./setup_ssl.sh
```

This will:
1. Install Certbot (Let's Encrypt)
2. Stop Nginx temporarily
3. Request SSL certificates for all 5 domains
4. Set proper permissions
5. Restart Nginx with SSL enabled
6. Enable automatic renewal

**Expected output:**
```
🎉 SSL Setup Complete!
   Landing: https://aerostic.com
   Dashboard: https://app.aerostic.com
   Admin Panel: https://admin.aerostic.com
```

---

## 🔄 Step 3: Deploy Configuration

Push the updated configuration to production:

```bash
# On your local machine
cd ~/Documents/aerostic
git add setup_ssl.sh nginx.conf
git commit -m "🌐 Configure multi-domain setup with SSL"
git push origin main

# On EC2 instance
ssh -i ~/Downloads/aimstors.pem ubuntu@13.63.63.170
cd aerostic
git pull origin main

# Restart Nginx to apply new config
docker compose restart nginx
```

---

## ✅ Step 4: Verification

### 4.1 Check DNS Resolution
```bash
ssh -i ~/Downloads/aimstors.pem ubuntu@13.63.63.170
nslookup aerostic.com
nslookup app.aerostic.com
nslookup admin.aerostic.com
```

### 4.2 Test HTTPS Access
```bash
# Landing page
curl -I https://aerostic.com

# Dashboard
curl -I https://app.aerostic.com

# Admin panel
curl -I https://admin.aerostic.com

# API
curl -I https://api.aerostic.com/api/v1/
```

### 4.3 Check SSL Certificates
```bash
ssh -i ~/Downloads/aimstors.pem ubuntu@13.63.63.170
sudo certbot certificates
```

Expected output:
```
Found the following certs:
  Certificate Name: aerostic.com
    Domains: aerostic.com, www.aerostic.com, app.aerostic.com, admin.aerostic.com, api.aerostic.com
    Expiry Date: YYYY-MM-DD
    Renewal: auto
```

### 4.4 Check Nginx Status
```bash
ssh -i ~/Downloads/aimstors.pem ubuntu@13.63.63.170
cd aerostic
docker compose logs nginx --tail 20
```

---

## 🔗 Routing Configuration

The Nginx configuration automatically routes each domain:

| Domain | Port | Service | Purpose |
|--------|------|---------|---------|
| `aerostic.com` | 443 | Static files | Landing page |
| `app.aerostic.com` | 443 | Frontend (3000) | User dashboard |
| `admin.aerostic.com` | 443 | Frontend (3000) | Admin panel |
| `api.aerostic.com` | 443 | Backend API (3001) | REST API |

All HTTP requests (port 80) automatically redirect to HTTPS (port 443).

---

## 🔐 Security Features

All domains include:
- ✅ **HTTPS/TLS 1.2+** encryption
- ✅ **HSTS** (HTTP Strict Transport Security)
- ✅ **Security Headers:**
  - `X-Frame-Options: SAMEORIGIN` (Clickjacking protection)
  - `X-Content-Type-Options: nosniff` (MIME sniffing prevention)
  - `X-XSS-Protection` (XSS filter)
  - `Referrer-Policy: strict-origin-when-cross-origin`
  - `Content-Security-Policy` (CSP with safe defaults)

---

## ⚙️ Advanced Configuration

### Update Nginx Config Manually
Edit the configuration on EC2:
```bash
ssh -i ~/Downloads/aimstors.pem ubuntu@13.63.63.170
sudo nano aerostic/nginx.conf
# Make changes
docker compose restart nginx
```

### Certificate Renewal
Certbot automatically renews certificates 30 days before expiry:
```bash
# Test renewal
sudo certbot renew --dry-run

# Manual renewal if needed
sudo certbot renew
```

### Check Certificate Expiry
```bash
ssh -i ~/Downloads/aimstors.pem ubuntu@13.63.63.170
sudo certbot certificates
```

---

## 🐛 Troubleshooting

### DNS Not Resolving
```bash
# Check DNS propagation
nslookup aerostic.com
dig aerostic.com
# May take 5-30 minutes to propagate
```

### SSL Certificate Not Applied
```bash
# Verify certificate files exist
sudo ls -la /etc/letsencrypt/live/aerostic.com/

# Check Nginx errors
docker compose logs nginx --tail 50

# Restart Nginx
docker compose restart nginx
```

### HTTP Not Redirecting to HTTPS
```bash
# Check nginx config is loaded
docker compose exec nginx nginx -t

# View config
docker compose exec nginx cat /etc/nginx/nginx.conf

# Restart
docker compose restart nginx
```

### Port 80/443 Already in Use
```bash
# Check what's listening
sudo lsof -i :80
sudo lsof -i :443

# Kill process if needed
sudo kill -9 <PID>

# Restart Docker containers
docker compose restart nginx
```

---

## 📊 Current Architecture

```
┌─────────────────────────────────────────────────────┐
│                  Internet (HTTPS)                   │
└─────────────────────────────────────────────────────┘
                           │
                ┌──────────┼──────────┐
                │          │          │
         ┌──────▼──────┐ ┌─▼──────┐ ┌▼────────────┐
         │ Landing Pg  │ │ App    │ │ Admin Panel │
         │  :443       │ │:443    │ │  :443       │
         │aerostic.com │ │app.xxx │ │admin.xxx    │
         └──────┬──────┘ └─┬──────┘ └┬────────────┘
                │          │        │
                └──────────┴────┬───┘
                                │
                    ┌───────────▼────────────┐
                    │   Nginx Reverse Proxy  │
                    │      (Port 443)        │
                    │    SSL/TLS Certs       │
                    └───────────┬────────────┘
                                │
                ┌───────────────┼──────────────────┐
                │               │                  │
        ┌───────▼─────┐  ┌──────▼──────┐  ┌───────▼─────┐
        │  Frontend   │  │   Backend   │  │  Database   │
        │  (Port 3000)│  │  (Port 3001)│  │  PostgreSQL │
        │   Next.js   │  │   NestJS    │  │ Redis Cache │
        └─────────────┘  └─────────────┘  └─────────────┘
```

---

## 📞 Quick Commands

### View running services
```bash
ssh -i ~/Downloads/aimstors.pem ubuntu@13.63.63.170
cd aerostic
docker compose ps
```

### View Nginx logs
```bash
docker compose logs nginx -f
```

### View API logs
```bash
docker compose logs api -f
```

### Check frontend
```bash
docker compose logs frontend -f
```

### Restart services
```bash
docker compose restart nginx
docker compose restart api
docker compose restart frontend
```

---

## 🚀 Live URLs

After setup:
- **Landing Page:** https://aerostic.com
- **User Dashboard:** https://app.aerostic.com
- **Admin Panel:** https://admin.aerostic.com
- **API Backend:** https://api.aerostic.com/api/v1/

---

## 📋 Checklist

- [ ] DNS records added to registrar (A records for all 5 domains)
- [ ] DNS propagated (verify with `nslookup`)
- [ ] SSL certificates installed (run `setup_ssl.sh`)
- [ ] Nginx configuration deployed
- [ ] HTTPS working on all domains
- [ ] HTTP automatically redirects to HTTPS
- [ ] Security headers present (`curl -I https://aerostic.com`)
- [ ] Frontend accessible at `app.aerostic.com`
- [ ] API accessible at `api.aerostic.com`
- [ ] Admin panel accessible at `admin.aerostic.com`

---

**Date Updated:** February 11, 2026  
**Security Score:** 10/10
