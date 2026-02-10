#!/bin/bash

# Configuration
APP_DIR="/var/www/aerostic"

echo "🚀 Starting Aerostic Production Deployment..."

# 1. Update Code
echo "🔄 Pulling latest changes..."
cd $APP_DIR
git checkout main
git pull origin main

# 2. Install Dependencies (Optimized)
echo "📦 Installing dependencies..."
npm ci --production=false # We need devDependencies for build (Nest/Next)

# 3. Build Backend
echo "🏗️ Building Backend..."
cd apps/backend
npm run build
cd ../..

# 4. Build Frontend
echo "🏗️ Building Frontend..."
cd apps/frontend
# Ensure NEXT_PUBLIC endpoints are baked in
if [ -f "../../.env" ]; then
    export $(grep -v '^#' ../../.env | xargs)
fi
npm run build
cd ../..

# 5. Run Migrations
echo "🗄️ Running Database Migrations..."
cd apps/backend
npm run typeorm migration:run -- -d src/data-source.ts
cd ../..

# 6. Restart Services
echo "🔄 Restarting Services..."
pm2 restart all --update-env

echo "✅ Deployment Complete!"
pm2 status
