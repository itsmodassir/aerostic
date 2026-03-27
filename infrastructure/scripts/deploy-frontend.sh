#!/bin/bash
set -e

echo "[Deploy] Starting production deployment sequence..."

# 1. Pull latest code
echo "[Deploy] Pulling latest code..."
git pull origin main

# 2. Build Frontend
echo "[Deploy] Building frontend..."
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

# 3. Restart Services
echo "[Deploy] Restarting PM2 processes..."
pm2 restart aimstors-frontend --update-env

echo "[Deploy] Restarting Nginx container..."
cd ../../infrastructure/docker
docker-compose restart nginx

echo "[Deploy] Deployment complete!"
