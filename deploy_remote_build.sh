#!/bin/bash
# deploy_remote_build.sh - Syncs source and builds ON THE SERVER
# Use this when local build environment is restricted.

set -e

KEY="/Users/Modassir/Downloads/modassir.pem"
HOST="ubuntu@52.66.246.46"
REMOTE_DIR="/var/www/aimstors"

echo "🛰️  Syncing source code to server..."

# Rsync flags: 
# -a: archive mode
# -v: verbose
# -z: compress
# --delete: delete extraneous files from dest (be careful!)
# --exclude: skip node_modules, .next, dist, static_runtime, and large binary artifacts
rsync -avz --progress -e "ssh -i $KEY -o StrictHostKeyChecking=no" \
    --exclude 'node_modules' \
    --exclude '.next' \
    --exclude 'dist' \
    --exclude '.git' \
    --exclude 'tmp_deploy_staging' \
    --exclude 'static_runtime' \
    --exclude '*.tar.gz' \
    --exclude '*.zip' \
    --exclude '*.webp' \
    --exclude '*.png' \
    --exclude '*.jpg' \
    --exclude '*.mp4' \
    ./ $HOST:$REMOTE_DIR/

echo "🛠️  Executing remote build and setup..."
ssh -i $KEY -o StrictHostKeyChecking=no $HOST "
    set -e
    sudo chown -R ubuntu:ubuntu $REMOTE_DIR
    cd $REMOTE_DIR

    echo '⚙️  Installing Backend dependencies...'
    cd backend && npm install
    
    echo '🏗️  Building Backend...'
    npm run build api
    npm run build webhook
    npm run build worker
    
    echo '🗄️ Running DB Migration Fix...'
    # Use PGPASSWORD for more reliable auth handling in node-postgres
    export PGPASSWORD=''
    node api-service/fix-db.js
    
    echo '⚙️  Installing & Building Frontend (Dashboard)...'
    cd ../frontend/app-dashboard
    npm install
    NODE_OPTIONS=\"--max-old-space-size=2048\" npm run build
    
    echo '🎨 Syncing static assets (Dashboard)...'
    sudo mkdir -p static_runtime
    sudo rm -rf static_runtime/*
    sudo cp -r .next/static/* static_runtime/

    echo '⚙️  Installing & Building Frontend (Admin)...'
    cd ../admin-panel
    npm install
    NODE_OPTIONS=\"--max-old-space-size=2048\" npm run build
    
    echo '🎨 Syncing static assets (Admin)...'
    sudo mkdir -p static_runtime
    sudo rm -rf static_runtime/*
    sudo cp -r .next/static/* static_runtime/

    echo '♻️  Restarting Services via PM2...'
    cd $REMOTE_DIR
    sudo pkill -9 node || true
    sudo pm2 delete all || true
    sudo pm2 start ecosystem.config.js
    sudo pm2 save
    
    echo '🌐 Reloading Nginx...'
    sudo docker exec aimstors-nginx nginx -t && sudo docker exec aimstors-nginx nginx -s reload

    echo '✅ Remote build & setup complete!'
"

echo "✨ Deployment Finished Successfully!"
