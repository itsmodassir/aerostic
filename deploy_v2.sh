#!/bin/bash
# deploy_v2.sh - Enhanced deployment script for Aerostic / Aimstors
# Fixes CSS issues by syncing static assets to Nginx alias directory.

set -e

KEY="~/Downloads/modassir.pem"
HOST="ubuntu@52.66.246.46"
REMOTE_DIR="/var/www/aimstors"

echo "🚀 Preparing deployment package..."

# Create a temporary staging area
STAGING_DIR="tmp_deploy_staging"
mkdir -p $STAGING_DIR

# 1. Package Backend (Built dist)
echo "📦 Packaging Backend..."
COPYFILE_DISABLE=1 tar -czf $STAGING_DIR/backend.tar.gz -C backend dist package.json package-lock.json nest-cli.json api-service webhook-service worker-service shared

# 2. Package Frontend Dashboard (Built .next)
echo "📦 Packaging Frontend App Dashboard..."
COPYFILE_DISABLE=1 tar -czf $STAGING_DIR/frontend_app.tar.gz -C frontend/app-dashboard .next public package.json package-lock.json next.config.ts 2>/dev/null || COPYFILE_DISABLE=1 tar -czf $STAGING_DIR/frontend_app.tar.gz -C frontend/app-dashboard .next public package.json next.config.ts

echo "📦 Packaging Frontend Admin Panel..."
COPYFILE_DISABLE=1 tar -czf $STAGING_DIR/frontend_admin.tar.gz -C frontend/admin-panel .next package.json package-lock.json next.config.mjs 2>/dev/null || COPYFILE_DISABLE=1 tar -czf $STAGING_DIR/frontend_admin.tar.gz -C frontend/admin-panel .next package.json next.config.mjs

echo "📦 Packaging Frontend Reseller Panel..."
COPYFILE_DISABLE=1 tar -czf $STAGING_DIR/frontend_reseller.tar.gz -C frontend/reseller-panel .next public package.json package-lock.json next.config.ts 2>/dev/null || COPYFILE_DISABLE=1 tar -czf $STAGING_DIR/frontend_reseller.tar.gz -C frontend/reseller-panel .next public package.json next.config.ts

echo "🔐 Transferring packages to server using rsync..."
rsync -avz --progress -e "ssh -i $KEY -o StrictHostKeyChecking=no" $STAGING_DIR/backend.tar.gz $STAGING_DIR/frontend_app.tar.gz $STAGING_DIR/frontend_admin.tar.gz $STAGING_DIR/frontend_reseller.tar.gz $HOST:/tmp/

echo "🛠️  Executing remote setup..."
ssh -i $KEY -o StrictHostKeyChecking=no $HOST "
    set -e
    
    echo '📂 Extracting Backend...'
    mkdir -p $REMOTE_DIR/backend
    sudo tar -xzf /tmp/backend.tar.gz -C $REMOTE_DIR/backend
    sudo chown -R ubuntu:ubuntu $REMOTE_DIR/backend
    
    echo '📂 Extracting Frontend (Dashboard)...'
    mkdir -p $REMOTE_DIR/frontend/app-dashboard
    sudo tar -xzf /tmp/frontend_app.tar.gz -C $REMOTE_DIR/frontend/app-dashboard
    sudo chown -R ubuntu:ubuntu $REMOTE_DIR/frontend/app-dashboard

    echo '📂 Extracting Frontend (Admin)...'
    mkdir -p $REMOTE_DIR/frontend/admin-panel
    sudo tar -xzf /tmp/frontend_admin.tar.gz -C $REMOTE_DIR/frontend/admin-panel
    sudo chown -R ubuntu:ubuntu $REMOTE_DIR/frontend/admin-panel

    echo '📂 Extracting Frontend (Reseller)...'
    mkdir -p $REMOTE_DIR/frontend/reseller-panel
    sudo tar -xzf /tmp/frontend_reseller.tar.gz -C $REMOTE_DIR/frontend/reseller-panel
    sudo chown -R ubuntu:ubuntu $REMOTE_DIR/frontend/reseller-panel
    
    echo '🗄️ Running DB Migration Fix...'
    cd $REMOTE_DIR/backend && [ -f .env ] && export \$(grep -v '^#' .env | xargs)
    cd $REMOTE_DIR/backend && node api-service/fix-db.js
    echo '✅ DB Migration sync complete!'
    
    echo '⚙️  Installing dependencies (Backend)...'
    cd $REMOTE_DIR/backend && npm install --production
    
    echo '🎨 SYNCING STATIC ASSETS FOR CSS (Dashboard)...'
    sudo mkdir -p $REMOTE_DIR/frontend/app-dashboard/static_runtime
    sudo rm -rf $REMOTE_DIR/frontend/app-dashboard/static_runtime/*
    sudo cp -r $REMOTE_DIR/frontend/app-dashboard/.next/static/* $REMOTE_DIR/frontend/app-dashboard/static_runtime/

    echo '🎨 SYNCING STATIC ASSETS FOR CSS (Admin)...'
    sudo mkdir -p $REMOTE_DIR/frontend/admin-panel/static_runtime
    sudo rm -rf $REMOTE_DIR/frontend/admin-panel/static_runtime/*
    sudo cp -r $REMOTE_DIR/frontend/admin-panel/.next/static/* $REMOTE_DIR/frontend/admin-panel/static_runtime/

    echo '🎨 SYNCING STATIC ASSETS FOR CSS (Reseller)...'
    sudo mkdir -p $REMOTE_DIR/frontend/reseller-panel/static_runtime
    sudo rm -rf $REMOTE_DIR/frontend/reseller-panel/static_runtime/*
    sudo cp -r $REMOTE_DIR/frontend/reseller-panel/.next/static/* $REMOTE_DIR/frontend/reseller-panel/static_runtime/
    
    echo '♻️  Restarting Services via PM2...'
    cd $REMOTE_DIR
    # Nuclear Cleanup: Ensure no zombie instances are holding ports
    sudo pkill -9 node || true
    sudo pm2 delete all || true
    sudo pm2 startOrReload ecosystem.config.js --update-env
    sudo pm2 save
    
    echo '🌐 Reloading Nginx inside Docker...'
    sudo docker exec aimstors-nginx nginx -t && sudo docker exec aimstors-nginx nginx -s reload

    echo '✅ Remote setup complete!'
"

echo "🧹 Cleaning up local staging..."
rm -rf $STAGING_DIR

echo "✨ Deployment Finished Successfully!"
