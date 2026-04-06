#!/bin/bash
# Kill existing next-server processes
sudo pkill -f "next-server"
echo "Frontend processes killed."

# Build and Start Dashboard (app.aimstore.in / Port 3000)
cd /var/www/aimstors/frontend/app-dashboard
npm run build --silent
nohup npm run start -- -p 3000 > dashboard.log 2>&1 &
echo "Dashboard restarted on port 3000."

# Build and Start Admin (admin.aimstore.in / Port 3002)
cd /var/www/aimstors/frontend/admin-panel
npm install --silent
npm run build --silent
nohup npm run start -- -p 3002 > admin.log 2>&1 &
echo "Admin panel restarted on port 3002."
