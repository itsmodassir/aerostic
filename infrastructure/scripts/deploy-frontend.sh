#!/bin/bash
set -e

echo "[Deploy] Starting production deployment sequence..."

export NODE_ENV=production
export BACKEND_URL="${BACKEND_URL:-http://127.0.0.1:3001}"
export NEXT_PUBLIC_API_URL="${NEXT_PUBLIC_API_URL:-/api/v1}"
export NEXT_PUBLIC_BASE_DOMAIN="${NEXT_PUBLIC_BASE_DOMAIN:-aimstore.in}"
export NEXT_PUBLIC_APP_HOST="${NEXT_PUBLIC_APP_HOST:-app.${NEXT_PUBLIC_BASE_DOMAIN}}"
export NEXT_PUBLIC_ADMIN_HOST="${NEXT_PUBLIC_ADMIN_HOST:-admin.${NEXT_PUBLIC_BASE_DOMAIN}}"
export NEXT_PUBLIC_META_REDIRECT_URI="${NEXT_PUBLIC_META_REDIRECT_URI:-https://${NEXT_PUBLIC_APP_HOST}/meta/callback}"

# 1. Pull latest code
echo "[Deploy] Pulling latest code..."
git pull origin main

# 2. Build frontends
echo "[Deploy] Building dashboard..."
cd frontend/app-dashboard
rm -rf .next
npm run build

# Keep nginx static mount stable across rebuilds.
mkdir -p static_runtime
find static_runtime -mindepth 1 -maxdepth 1 -exec rm -rf {} +
cp -a .next/static/. static_runtime/

# PM2 runs Next standalone server.js, so standalone must carry fresh static/public assets.
mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -a .next/static .next/standalone/.next/static
if [ -d public ]; then
  rm -rf .next/standalone/public
  cp -a public .next/standalone/public
fi

echo "[Deploy] Building admin panel..."
cd ../admin-panel
rm -rf .next
npm run build

mkdir -p static_runtime
find static_runtime -mindepth 1 -maxdepth 1 -exec rm -rf {} +
cp -a .next/static/. static_runtime/

mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -a .next/static .next/standalone/.next/static

if [ -d public ]; then
  mkdir -p .next/standalone/public
  rm -rf .next/standalone/public
  cp -a public .next/standalone/public
fi

echo "[Deploy] Building reseller panel..."
cd ../reseller-panel
rm -rf .next
npm run build

mkdir -p static_runtime
find static_runtime -mindepth 1 -maxdepth 1 -exec rm -rf {} +
cp -a .next/static/. static_runtime/

mkdir -p .next/standalone/.next
rm -rf .next/standalone/.next/static
cp -a .next/static .next/standalone/.next/static

if [ -d public ]; then
  mkdir -p .next/standalone/public
  rm -rf .next/standalone/public
  cp -a public .next/standalone/public
fi

# 3. Restart Services
echo "[Deploy] Restarting PM2 processes..."
cd ../..
pm2 startOrReload ecosystem.config.js --update-env

echo "[Deploy] Restarting Nginx container..."
cd infrastructure/docker
docker-compose restart nginx

echo "[Deploy] Deployment complete!"
