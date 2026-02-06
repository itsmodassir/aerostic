# Aerostic EC2 Deployment Guide

## Pre-Deployment Verification Checklist

Before deploying to EC2, verify these components are ready:

### ✅ Infrastructure Ready

- [x] **Docker Compose** - Multi-service architecture configured
- [x] **Nginx** - Reverse proxy with SSL support
- [x] **Health Checks** - Postgres and Redis health monitoring
- [x] **WebSocket Support** - Socket.IO proxy configuration
- [x] **Multi-Domain** - aerostic.com, app.aerostic.com, api.aerostic.com, admin.aerostic.com

### ✅ Backend Services

- [x] **API Service** - Main NestJS backend (port 3001)
- [x] **Worker Service** - Background job processor (port 3002)
- [x] **Webhook Handler** - Dedicated Meta webhook processor (port 3003)
- [x] **Database** - PostgreSQL 15 with TypeORM entities
- [x] **Cache** - Redis 7 for queues and sessions

### ✅ Features Implemented

- [x] **WhatsApp Integration** - Meta Graph API v22.0
- [x] **OAuth Flow** - Embedded signup with token exchange
- [x] **Real-Time Messaging** - Socket.IO WebSocket gateway
- [x] **Team Inbox** - Typing indicators, presence, message status
- [x] **Billing System** - Razorpay integration with trial subscriptions
- [x] **Admin Panel** - Super admin backend API
- [x] **Multi-Tenant** - Complete isolation and security

### ⚠️ Required Before Deployment

- [ ] **Domain DNS** - Point domains to EC2 IP
- [ ] **SSL Certificates** - Let's Encrypt setup
- [ ] **Environment Variables** - All secrets configured
- [ ] **Meta App** - Production app approved
- [ ] **Razorpay** - Live credentials obtained

---

## Step 1: Launch EC2 Instance

### Recommended Instance Type

**For Production**: `t3.medium` or higher
- 2 vCPUs
- 4 GB RAM
- 30 GB SSD storage

**For Testing**: `t3.small`
- 2 vCPUs
- 2 GB RAM
- 20 GB SSD storage

### Launch Instance

```bash
# AWS Console
1. Go to EC2 Dashboard
2. Click "Launch Instance"
3. Choose Ubuntu 22.04 LTS
4. Select instance type (t3.medium recommended)
5. Configure security group (see below)
6. Add 30 GB storage
7. Launch and download .pem key
```

### Security Group Configuration

| Type | Protocol | Port | Source |
|------|----------|------|--------|
| SSH | TCP | 22 | Your IP |
| HTTP | TCP | 80 | 0.0.0.0/0 |
| HTTPS | TCP | 443 | 0.0.0.0/0 |
| PostgreSQL | TCP | 5432 | Security Group (optional) |
| Redis | TCP | 6379 | Security Group (optional) |

---

## Step 2: Connect to EC2

```bash
# Set permissions
chmod 400 your-key.pem

# Connect
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

---

## Step 3: Install Docker & Docker Compose

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add user to docker group
sudo usermod -aG docker ubuntu

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Verify installation
docker --version
docker-compose --version

# Logout and login again for group changes
exit
ssh -i your-key.pem ubuntu@<EC2_PUBLIC_IP>
```

---

## Step 4: Clone Aerostic Repository

```bash
# Install Git
sudo apt install git -y

# Clone repository
git clone https://github.com/yourusername/aerostic.git
cd aerostic
```

---

## Step 5: Configure Environment Variables

Create `.env` file:

```bash
nano .env
```

Add all required variables:

```env
# Database
DB_HOST=postgres
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=<STRONG_PASSWORD>
DB_DATABASE=aerostic
DATABASE_URL=postgresql://postgres:<STRONG_PASSWORD>@postgres:5432/aerostic

# Redis
REDIS_HOST=redis
REDIS_PORT=6379

# JWT
JWT_SECRET=<GENERATE_RANDOM_SECRET>

# Meta WhatsApp
META_APP_ID=<YOUR_META_APP_ID>
META_APP_SECRET=<YOUR_META_APP_SECRET>
META_REDIRECT_URI=https://api.aerostic.com/meta/callback
META_WEBHOOK_VERIFY_TOKEN=<RANDOM_TOKEN>

# Gemini AI
GEMINI_API_KEY=<YOUR_GEMINI_KEY>

# Razorpay
RAZORPAY_KEY_ID=<YOUR_RAZORPAY_KEY>
RAZORPAY_KEY_SECRET=<YOUR_RAZORPAY_SECRET>
RAZORPAY_WEBHOOK_SECRET=<YOUR_WEBHOOK_SECRET>

# Frontend
NEXT_PUBLIC_API_URL=https://api.aerostic.com
APP_URL=https://app.aerostic.com

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=<YOUR_EMAIL>
SMTP_PASS=<YOUR_APP_PASSWORD>
```

**Generate strong secrets**:

```bash
# Generate JWT secret
openssl rand -hex 32

# Generate webhook token
openssl rand -hex 16
```

---

## Step 6: Configure DNS

Point your domains to EC2 public IP:

```
A Record: aerostic.com → <EC2_PUBLIC_IP>
A Record: www.aerostic.com → <EC2_PUBLIC_IP>
A Record: app.aerostic.com → <EC2_PUBLIC_IP>
A Record: api.aerostic.com → <EC2_PUBLIC_IP>
A Record: admin.aerostic.com → <EC2_PUBLIC_IP>
```

Wait for DNS propagation (5-30 minutes):

```bash
# Check DNS
nslookup aerostic.com
nslookup api.aerostic.com
```

---

## Step 7: Install SSL Certificates (Let's Encrypt)

```bash
# Install Certbot
sudo apt install certbot -y

# Stop any running services on port 80
sudo docker-compose down

# Generate certificates
sudo certbot certonly --standalone -d aerostic.com -d www.aerostic.com -d app.aerostic.com -d api.aerostic.com -d admin.aerostic.com

# Follow prompts:
# - Enter email
# - Agree to terms
# - Certificates will be saved to /etc/letsencrypt/live/aerostic.com/
```

**Verify certificates**:

```bash
sudo ls -la /etc/letsencrypt/live/aerostic.com/
# Should show:
# - fullchain.pem
# - privkey.pem
```

---

## Step 8: Build and Deploy

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d

# Check status
docker-compose ps
```

**Expected output**:

```
NAME                  STATUS
aerostic-nginx        Up
aerostic-postgres     Up (healthy)
aerostic-redis        Up (healthy)
aerostic-api          Up
aerostic-worker       Up
aerostic-webhook      Up
aerostic-frontend     Up
```

---

## Step 9: Run Database Migrations

```bash
# Access API container
docker exec -it aerostic-api sh

# Run migrations
npm run migration:run

# Exit container
exit
```

---

## Step 10: Verify Deployment

### Check Services

```bash
# View logs
docker-compose logs -f api
docker-compose logs -f frontend
docker-compose logs -f webhook-handler

# Check health
curl http://localhost/health
```

### Test Endpoints

```bash
# Test API
curl https://api.aerostic.com/health

# Test frontend
curl https://app.aerostic.com

# Test WebSocket
curl https://api.aerostic.com/socket.io/
```

### Verify SSL

```bash
# Check SSL certificate
openssl s_client -connect api.aerostic.com:443 -servername api.aerostic.com
```

---

## Step 11: Configure Meta Webhook

1. Go to Meta App Dashboard
2. Navigate to WhatsApp > Configuration
3. Set Callback URL: `https://api.aerostic.com/webhooks/meta`
4. Set Verify Token: (same as `META_WEBHOOK_VERIFY_TOKEN` in .env)
5. Subscribe to events: `messages`, `message_status`
6. Click "Verify and Save"

---

## Step 12: Test WhatsApp Integration

1. Open `https://app.aerostic.com`
2. Sign up / Login
3. Connect WhatsApp account via OAuth
4. Send test message
5. Verify webhook receives message
6. Check real-time Socket.IO updates

---

## Production Monitoring

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f api
docker-compose logs -f webhook-handler
```

### Restart Services

```bash
# Restart all
docker-compose restart

# Restart specific service
docker-compose restart api
```

### Update Code

```bash
# Pull latest code
git pull origin main

# Rebuild and restart
docker-compose down
docker-compose build
docker-compose up -d
```

---

## SSL Certificate Auto-Renewal

```bash
# Add cron job for auto-renewal
sudo crontab -e

# Add this line (runs daily at 2 AM)
0 2 * * * certbot renew --quiet && docker-compose restart nginx
```

---

## Backup Strategy

### Database Backup

```bash
# Create backup script
nano ~/backup.sh
```

Add:

```bash
#!/bin/bash
DATE=$(date +%Y%m%d_%H%M%S)
docker exec aerostic-postgres pg_dump -U postgres aerostic > /home/ubuntu/backups/aerostic_$DATE.sql
# Keep only last 7 days
find /home/ubuntu/backups -name "aerostic_*.sql" -mtime +7 -delete
```

```bash
# Make executable
chmod +x ~/backup.sh

# Add to cron (daily at 3 AM)
sudo crontab -e
0 3 * * * /home/ubuntu/backup.sh
```

---

## Troubleshooting

### Services Not Starting

```bash
# Check logs
docker-compose logs

# Check disk space
df -h

# Check memory
free -h
```

### Database Connection Issues

```bash
# Check Postgres health
docker exec aerostic-postgres pg_isready -U postgres

# Access database
docker exec -it aerostic-postgres psql -U postgres -d aerostic
```

### SSL Issues

```bash
# Check certificate expiry
sudo certbot certificates

# Renew manually
sudo certbot renew

# Restart Nginx
docker-compose restart nginx
```

### Webhook Not Receiving Messages

```bash
# Check webhook logs
docker-compose logs -f webhook-handler

# Test webhook endpoint
curl -X POST https://api.aerostic.com/webhooks/meta \
  -H "Content-Type: application/json" \
  -d '{"test": true}'

# Verify Meta webhook configuration
# Check verify token matches .env
```

---

## Performance Optimization

### Increase Docker Resources

Edit `/etc/docker/daemon.json`:

```json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  }
}
```

### Enable Nginx Caching

Already configured in `nginx.conf` with `proxy_cache_bypass`.

### Database Optimization

```sql
-- Inside Postgres container
docker exec -it aerostic-postgres psql -U postgres -d aerostic

-- Create indexes
CREATE INDEX idx_messages_tenant_id ON messages(tenant_id);
CREATE INDEX idx_messages_created_at ON messages(created_at);
CREATE INDEX idx_contacts_tenant_id ON contacts(tenant_id);
```

---

## Security Checklist

- [x] SSL certificates installed
- [x] Firewall configured (security groups)
- [x] Strong database password
- [x] JWT secret generated
- [x] Environment variables secured
- [ ] SSH key-only access (disable password auth)
- [ ] Fail2ban installed (optional)
- [ ] Regular backups enabled

---

## Deployment Complete! 🚀

Your Aerostic WhatsApp SaaS is now live on:

- **Landing**: https://aerostic.com
- **Dashboard**: https://app.aerostic.com
- **API**: https://api.aerostic.com
- **Admin**: https://admin.aerostic.com

### Next Steps

1. Test all features thoroughly
2. Set up monitoring (optional: DataDog, New Relic)
3. Configure backups
4. Enable auto-renewal for SSL
5. Monitor logs for errors
6. Scale EC2 instance if needed

**Aerostic is production-ready!** 🎉
