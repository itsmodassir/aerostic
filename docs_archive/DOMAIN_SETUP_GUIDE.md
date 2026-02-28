# 🌐 Aimstors Solution Multi-Domain Setup Guide

**Domains:**
- `aimstore.in` → Landing page / Home
- `app.aimstore.in` → User Dashboard (Frontend)
- `admin.aimstore.in` → Admin Panel
- `api.aimstore.in` → API Backend

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
Domain: aimstore.in → 13.63.63.170
Domain: www.aimstore.in → 13.63.63.170
Domain: app.aimstore.in → 13.63.63.170
Domain: admin.aimstore.in → 13.63.63.170
Domain: api.aimstore.in → 13.63.63.170
```

**⏱️ Wait:** DNS changes typically take 5-30 minutes to propagate. You can verify with:
```bash
nslookup aimstore.in
nslookup app.aimstore.in
```

---

## 🔒 Step 2: Set Up SSL Certificates

Once DNS is configured, run the SSL setup script on the EC2 instance:

```bash
ssh -i ~/Downloads/aimstors.pem ubuntu@13.63.63.170
cd aimstors
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
   Landing: https://aimstore.in
   Dashboard: https://app.aimstore.in
   Admin Panel: https://admin.aimstore.in
```

---

## 🔄 Step 3: Deploy Configuration

Push the updated configuration to production:

```bash
# On your local machine
cd ~/Documents/aimstors
git add setup_ssl.sh nginx.conf
git commit -m "🌐 Configure multi-domain setup with SSL"
git push origin main

# On EC2 instance
ssh -i ~/Downloads/aimstors.pem ubuntu@13.63.63.170
cd aimstors
git pull origin main

# Restart Nginx to apply new config
docker compose restart nginx
```

---

## ✅ Step 4: Verification

### 4.1 Check DNS Resolution
```bash
ssh -i ~/Downloads/aimstors.pem ubuntu@13.63.63.170
nslookup aimstore.in
nslookup app.aimstore.in
nslookup admin.aimstore.in
```

### 4.2 Test HTTPS Access
```bash
# Landing page
curl -I https://aimstore.in

# Dashboard
curl -I https://app.aimstore.in

# Admin panel
curl -I https://admin.aimstore.in

# API
curl -I https://api.aimstore.in/api/v1/
```

### 4.3 Check SSL Certificates
```bash
ssh -i ~/Downloads/aimstors.pem ubuntu@13.63.63.170
sudo certbot certificates
```

Expected output:
```
Found the following certs:
  Certificate Name: aimstore.in
    Domains: aimstore.in, www.aimstore.in, app.aimstore.in, admin.aimstore.in, api.aimstore.in
    Expiry Date: YYYY-MM-DD
    Renewal: auto
```

### 4.4 Check Nginx Status
```bash
ssh -i ~/Downloads/aimstors.pem ubuntu@13.63.63.170
cd aimstors
docker compose logs nginx --tail 20
```

---

## 🔗 Routing Configuration

The Nginx configuration automatically routes each domain:

| Domain | Port | Service | Purpose |
|--------|------|---------|---------|
| `aimstore.in` | 443 | Static files | Landing page |
| `app.aimstore.in` | 443 | Frontend (3000) | User dashboard |
| `admin.aimstore.in` | 443 | Frontend (3000) | Admin panel |
| `api.aimstore.in` | 443 | Backend API (3001) | REST API |

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
sudo nano aimstors/nginx.conf
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
nslookup aimstore.in
dig aimstore.in
# May take 5-30 minutes to propagate
```

### SSL Certificate Not Applied
```bash
# Verify certificate files exist
sudo ls -la /etc/letsencrypt/live/aimstore.in/

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
         │aimstore.in │ │app.xxx │ │admin.xxx    │
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
cd aimstors
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
- **Landing Page:** https://aimstore.in
- **User Dashboard:** https://app.aimstore.in
- **Admin Panel:** https://admin.aimstore.in
- **API Backend:** https://api.aimstore.in/api/v1/

---

## 📋 Checklist

- [ ] DNS records added to registrar (A records for all 5 domains)
- [ ] DNS propagated (verify with `nslookup`)
- [ ] SSL certificates installed (run `setup_ssl.sh`)
- [ ] Nginx configuration deployed
- [ ] HTTPS working on all domains
- [ ] HTTP automatically redirects to HTTPS
- [ ] Security headers present (`curl -I https://aimstore.in`)
- [ ] Frontend accessible at `app.aimstore.in`
- [ ] API accessible at `api.aimstore.in`
- [ ] Admin panel accessible at `admin.aimstore.in`

---

**Date Updated:** February 11, 2026  
**Security Score:** 10/10
