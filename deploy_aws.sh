#!/bin/bash
set -e

# Configuration
APP_DIR="/var/www/aerostic"
REPO_URL="https://github.com/itsmodassir/aerostic.git"

echo "🚀 Starting Aerostic Production Deployment..."

# 1. Update/Clone Code
if [ ! -d "$APP_DIR" ]; then
    echo "📂 Directory missing. Cloning repository..."
    sudo mkdir -p /var/www
    sudo chown -R $USER:$USER /var/www
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
else
    echo "🔄 Pulling latest changes..."
    cd $APP_DIR
    git checkout main
    git pull origin main
fi

# 2. Install Dependencies (Optimized)
echo "📦 Installing dependencies..."
# Using --legacy-peer-deps to bypass Capacitor version conflicts (v6 vs v7)
npm ci --production=false --legacy-peer-deps

# 3. Build Backend
echo "🏗️ Building Backend..."
cd apps/backend
npm install --production=false --legacy-peer-deps
npm run build
cd ../..

# 4. Build Frontend
echo "🏗️ Building Frontend..."
cd apps/frontend
npm install --production=false --legacy-peer-deps
# Ensure NEXT_PUBLIC endpoints are baked in
if [ -f "../../.env" ]; then
    export $(grep -v '^#' ../../.env | xargs)
fi
# Skip linting during build to prevent build failures on warnings
export NEXT_JS_IGNORE_ESLINT=1
npm run build
cd ../..

# 5. Run Migrations
echo "🗄️ Running Database Migrations..."
cd apps/backend
npm run typeorm migration:run -- -d src/data-source.ts
cd ../..

# 6. Restart Services
echo "🔄 Restarting Services..."
if pm2 list | grep -q "aerostic-backend"; then
    pm2 restart all --update-env
else
    echo "⚠️ PM2 services not found. Starting fresh..."
    pm2 start apps/backend/dist/main.js --name aerostic-backend
    pm2 start apps/frontend/node_modules/next/dist/bin/next --name aerostic-frontend -- start -p 3000
    pm2 save
fi

echo "✅ Deployment Complete!"
pm2 status
