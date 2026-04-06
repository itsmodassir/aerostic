#!/bin/bash
set -e

DOMAIN="aimstore.in"
APP_DOMAIN="app.aimstore.in"
ADMIN_DOMAIN="admin.aimstore.in"
EMAIL="admin@aimstore.in"

echo "🔒 Starting SSL Setup for multiple domains..."
echo "  📋 Landing: $DOMAIN"
echo "  📋 Dashboard: $APP_DOMAIN"
echo "  📋 Admin: $ADMIN_DOMAIN"

# 1. Install Certbot
echo ""
echo "📦 Installing Certbot..."
if command -v dnf &> /dev/null; then
    sudo dnf install -y certbot
elif command -v apt-get &> /dev/null; then
    sudo apt-get update
    sudo apt-get install -y certbot python3-certbot-nginx
else
    echo "❌ No supported package manager found (dnf or apt-get). Please install certbot manually."
    exit 1
fi

# 2. Stop Nginx to free port 80
echo ""
echo "🛑 Stopping Nginx container..."
cd /var/www/aimstors/infrastructure/docker
sudo docker-compose stop nginx

sleep 2

# 3. Get Certificate for all domains
echo ""
echo "📜 Requesting SSL Certificate for all domains..."
if sudo certbot certonly --standalone \
  -d $DOMAIN \
  -d www.$DOMAIN \
  -d $APP_DOMAIN \
  -d $ADMIN_DOMAIN \
  -d api.$DOMAIN \
  --non-interactive \
  --agree-tos \
  -m $EMAIL \
  --preferred-challenges http; then
    echo "✅ Certificate obtained successfully!"
else
    echo "❌ Failed to obtain certificate. Check DNS settings."
    sudo docker-compose start nginx
    exit 1
fi

# 4. Set proper permissions
echo ""
echo "🔐 Setting certificate permissions..."
sudo chmod -R 755 /etc/letsencrypt

# 5. Restart Nginx with new config
echo ""
echo "🔄 Restarting Nginx..."
cd /var/www/aimstors/infrastructure/docker
sudo docker-compose up -d nginx

sleep 3

# 6. Verify
echo ""
echo "✅ Verifying certificates..."
sudo certbot certificates

echo ""
echo "🎉 SSL Setup Complete!"
echo "   Landing: https://$DOMAIN"
echo "   Dashboard: https://$APP_DOMAIN"
echo "   Admin Panel: https://$ADMIN_DOMAIN"
echo ""
echo "💡 Certificate renewal is auto-enabled. Check with: sudo certbot renew --dry-run"
