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

# 2. Sync Environment Variables
echo "🔑 Syncing environment variables..."
if [ ! -f ".env" ] && [ -f "apps/backend/.env" ]; then
    cp apps/backend/.env .env
    echo "✅ Migrated .env from legacy apps/backend"
fi

# 2.1 Install Dependencies
echo "📦 Root dependencies skipped (Monorepo structure)..."

# 3. Build Backend
echo "🏗️ Building Backend..."
cd backend
npm install --production=false --legacy-peer-deps
npx nest build api
npx nest build webhook
npx nest build worker
cd ..

# 4. Build Frontend
echo "🏗️ Building Frontend..."
cd frontend/app-dashboard
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
cd backend
# Use robust migration command for alias resolution (@shared)
npx ts-node -P tsconfig.json -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d shared/database/data-source.ts
cd ..

# 6. Restart Services
echo "🔄 Restarting Services..."
pm2 delete all || true
pm2 start backend/dist/api-service/main.js --name aerostic-api
pm2 start backend/dist/webhook-service/main.js --name aerostic-webhook
pm2 start backend/dist/worker-service/main.js --name aerostic-worker
# Use standalone server for Next.js
PORT=3000 pm2 start frontend/app-dashboard/.next/standalone/server.js --name aerostic-frontend
pm2 save

echo "✅ Deployment Complete!"
pm2 status
