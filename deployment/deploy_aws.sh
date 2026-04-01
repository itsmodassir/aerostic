#!/bin/bash
set -e

# Configuration
APP_DIR="/var/www/aimstors"
REPO_URL="https://github.com/itsmodassir/aerostic.git"

echo "🚀 Starting Aimstors Solution Production Deployment..."

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
    git reset --hard origin/main
    git pull origin main
fi

# 1.1 Hotfix Backend (Dependency Resolution)
echo "🔧 Applying backend dependency hotfix..."
sed -i "s/providers: \[\],/exports: \[SharedWhatsappModule\],/" backend/api-service/whatsapp/whatsapp.module.ts

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

# 4. Build Frontends
echo "🏗️ Building Frontends..."

# 4.1 Landing Page
echo "🌐 Building Landing Page..."
cd frontend/landing
npm install --production=false --legacy-peer-deps
npm run build
cd ../..

# 4.2 App Dashboard
echo "📱 Building App Dashboard..."
cd frontend/app-dashboard
npm install --production=false --legacy-peer-deps
if [ -f "../../.env" ]; then
    set -a
    source ../../.env
    set +a
fi
export NEXT_JS_IGNORE_ESLINT=1
npm run build

# Keep nginx static mount stable across rebuilds.
# .next/static is recreated by Next build, which can stale bind-mount inodes.
echo "🧱 Syncing frontend static runtime assets..."
mkdir -p static_runtime
find static_runtime -mindepth 1 -maxdepth 1 -exec rm -rf {} +
cp -a .next/static/. static_runtime/
sudo chmod -R 755 static_runtime/
cd ../..

# 5. Restart Infrastructure (Docker)
echo "🐳 Starting Infrastructure Services..."
cd infrastructure/docker
docker-compose up -d --build --force-recreate nginx ml-service redis postgres kafka zookeeper
cd ../..

echo "⏳ Waiting 10 seconds for initial database startup..."
sleep 10

# 6. Run Migrations
echo "🗄️ Running Database Migrations..."
cd backend
npx ts-node -P tsconfig.json -r tsconfig-paths/register ./node_modules/typeorm/cli.js migration:run -d shared/database/data-source.ts
cd ..

# 7. Restart Services
echo "🔄 Restarting Node Services..."
pm2 delete aimstors-api || true
pm2 delete aimstors-webhook || true
pm2 delete aimstors-worker || true
pm2 delete aimstors-frontend || true

# Backend
pm2 start backend/dist/api-service/main.js --name aimstors-api
pm2 start backend/dist/webhook-service/main.js --name aimstors-webhook
pm2 start backend/dist/worker-service/main.js --name aimstors-worker

# Frontend
PORT=3000 pm2 start frontend/app-dashboard/.next/standalone/server.js --name aimstors-frontend

pm2 save

echo "✅ Production Fix Deployment Complete!"
pm2 status
