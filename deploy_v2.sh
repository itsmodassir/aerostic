#!/bin/bash
# deploy_v2.sh - Enhanced deployment script for Aerostic / Aimstors
# Fixes CSS issues by syncing static assets to Nginx alias directory.

set -e

KEY="~/Downloads/aimstors2.pem"
HOST="ec2-user@app.aimstore.in"
REMOTE_DIR="/var/www/aimstors"
NGINX_STATIC_DIR="/var/www/aimstors/frontend/app-dashboard/static_runtime"
NGINX_PUBLIC_DIR="/var/www/aimstors/frontend/app-dashboard/public"

echo "🚀 Preparing deployment package..."

# Create a temporary staging area
STAGING_DIR="tmp_deploy_staging"
mkdir -p $STAGING_DIR

# 1. Package Backend (Built dist)
echo "📦 Packaging Backend..."
COPYFILE_DISABLE=1 tar -czf $STAGING_DIR/backend.tar.gz -C backend dist package.json package-lock.json nest-cli.json api-service webhook-service worker-service shared

# 2. Package Frontend Dashboard (Built .next)
echo "📦 Packaging Frontend App Dashboard..."
# Note: We include .next for the app and static assets
COPYFILE_DISABLE=1 tar -czf $STAGING_DIR/frontend_app.tar.gz -C frontend/app-dashboard .next public package.json package-lock.json next.config.ts

echo "🔐 Transferring packages to server using rsync..."
rsync -avz --progress -e "ssh -i $KEY" $STAGING_DIR/backend.tar.gz $STAGING_DIR/frontend_app.tar.gz $HOST:/tmp/

echo "🛠️  Executing remote setup..."
ssh -i $KEY $HOST "
    set -e
    
    echo '📂 Extracting Backend...'
    mkdir -p $REMOTE_DIR/backend
    sudo tar -xzf /tmp/backend.tar.gz -C $REMOTE_DIR/backend
    sudo chown -R ec2-user:ec2-user $REMOTE_DIR/backend
    
    echo '📂 Extracting Frontend...'
    mkdir -p $REMOTE_DIR/frontend/app-dashboard
    sudo tar -xzf /tmp/frontend_app.tar.gz -C $REMOTE_DIR/frontend/app-dashboard
    sudo chown -R ec2-user:ec2-user $REMOTE_DIR/frontend/app-dashboard
    
    echo '🗄️ Running DB Migration Fix...'
    cd $REMOTE_DIR/backend && sudo node api-service/fix-db.js
    echo '✅ DB Migration sync complete!'
    
    echo '⚙️  Installing dependencies (Backend)...'
    cd $REMOTE_DIR/backend && npm install --production
    
    echo '⚙️  Installing dependencies (Frontend)...'
    cd $REMOTE_DIR/frontend/app-dashboard && npm install --production || true
    
    echo '🎨 SYNCING STATIC ASSETS FOR CSS...'
    # This is the critical step to ensure Nginx serves the correct CSS/JS chunks
    sudo mkdir -p $NGINX_STATIC_DIR
    sudo rm -rf $NGINX_STATIC_DIR/*
    sudo cp -r $REMOTE_DIR/frontend/app-dashboard/.next/static/* $NGINX_STATIC_DIR/
    
    echo '🖼️  Syncing Public assets...'
    sudo mkdir -p $NGINX_PUBLIC_DIR
    # Only copy if source and destination are different to avoid errors
    if [ "$REMOTE_DIR/frontend/app-dashboard/public" != "$NGINX_PUBLIC_DIR" ]; then
        sudo cp -r $REMOTE_DIR/frontend/app-dashboard/public/* $NGINX_PUBLIC_DIR/
    fi
    
    echo '♻️  Restarting Services via PM2...'
    sudo pm2 restart all || (
        echo 'PM2 restart failed, attempting to start from scratch...'
        sudo pm2 start $REMOTE_DIR/backend/dist/api-service/main.js --name aimstors-api
        sudo pm2 start $REMOTE_DIR/backend/dist/webhook-service/main.js --name aimstors-webhook
        sudo pm2 start $REMOTE_DIR/backend/dist/worker-service/main.js --name aimstors-worker
        sudo pm2 start "npm start" --name aimstors-dashboard --cwd $REMOTE_DIR/frontend/app-dashboard
    )
    
    echo '🌐 Reloading Nginx inside Docker...'
    sudo docker exec aimstors-nginx nginx -t && sudo docker exec aimstors-nginx nginx -s reload

    echo '✅ Remote setup complete!'
"

echo "🧹 Cleaning up local staging..."
rm -rf $STAGING_DIR

echo "✨ Deployment Finished Successfully!"
