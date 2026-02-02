#!/bin/bash
set -e

DOMAIN="aerostic.com"
EMAIL="admin@aerostic.com"

echo "🔒 Starting SSL Setup for $DOMAIN and subdomains..."

# 1. Install Certbot
echo "📦 Installing Certbot..."
sudo apt-get update
sudo apt-get install -y certbot

# 2. Stop Nginx to free port 80
echo "🛑 Stopping Nginx container..."
sudo docker compose stop nginx

# 3. Get Certificate
echo "📜 Requesting Certificate..."
if sudo certbot certonly --standalone -d $DOMAIN -d www.$DOMAIN -d app.$DOMAIN -d api.$DOMAIN --non-interactive --agree-tos -m $EMAIL; then
    echo "✅ Certificate obtained successfully!"
else
    echo "❌ Failed to obtain certificate. Check DNS settings."
    sudo docker compose start nginx
    exit 1
fi

# 4. Restart Nginx with new config
echo "🔄 Restarting Nginx..."
sudo docker compose up -d nginx

echo "🎉 SSL Setup Complete! https://$DOMAIN should be live."
