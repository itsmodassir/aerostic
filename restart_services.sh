#!/bin/bash
# Kill existing services
sudo pkill -f "node /var/www/aimstors/backend/dist"
echo "Services killed."

# Build Backend on server
cd /var/www/aimstors/backend
npm install --silent
npm run build --silent
echo "Backend rebuilt."

# Start Services in background
nohup node dist/api-service/main.js > api.log 2>&1 &
nohup node dist/worker-service/main.js > worker.log 2>&1 &
nohup node dist/webhook-service/main.js > webhook.log 2>&1 &
echo "Services restarted."
