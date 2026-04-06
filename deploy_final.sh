#!/bin/bash
set -e

echo "📦 Packaging core fixes..."
tar -czf core_fix.tar.gz \
    backend/shared/whatsapp/whatsapp.service.ts \
    backend/api-service/whatsapp/whatsapp.controller.ts \
    frontend/app-dashboard/components/whatsapp/BusinessProfileModal.tsx \
    frontend/app-dashboard/app/contacts/page.tsx \
    frontend/app-dashboard/components/crm \
    frontend/app-dashboard/lib/api.ts

echo "🔐 Encoding and streaming to server..."
CONTENT=$(base64 < core_fix.tar.gz)
ssh -i ~/Downloads/aimstors2.pem ec2-user@13.232.186.189 "
    echo '$CONTENT' | base64 -d > /tmp/core_fix.tar.gz
    cd /var/www/aimstors && tar -xzf /tmp/core_fix.tar.gz
    cd /var/www/aimstors/backend && npm run build
    cd /var/www/aimstors/frontend/app-dashboard && npm run build
    sudo pm2 restart all
"
echo "✅ Deployment Successful!"
