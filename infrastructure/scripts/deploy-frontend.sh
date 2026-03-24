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

# 3. Restart Services
echo "[Deploy] Restarting PM2 processes..."
pm2 restart aimstors-frontend --update-env

echo "[Deploy] Restarting Nginx container..."
cd ../../infrastructure/docker
docker-compose restart nginx

echo "[Deploy] Deployment complete!"
