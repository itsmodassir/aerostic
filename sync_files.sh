#!/bin/bash
key=~/Downloads/aimstors2.pem
host=ec2-user@13.232.186.189
files=(
    "backend/shared/database/entities/core/contact.entity.ts"
    "backend/api-service/contacts/contacts.service.ts"
    "backend/api-service/contacts/contacts.controller.ts"
    "backend/api-service/messages/messages.service.ts"
    "backend/api-service/messages/messages.controller.ts"
    "backend/shared/whatsapp/whatsapp.service.ts"
    "backend/api-service/whatsapp/whatsapp.controller.ts"
    "frontend/app-dashboard/app/contacts/page.tsx"
    "frontend/app-dashboard/app/dashboard/[workspaceId]/(agent)/inbox/page.tsx"
    "frontend/app-dashboard/components/contacts/ContactTable.tsx"
    "frontend/app-dashboard/components/contacts/AddEditContactModal.tsx"
    "frontend/app-dashboard/components/contacts/ImportExportModals.tsx"
    "frontend/app-dashboard/components/inbox/ConversationItem.tsx"
    "frontend/app-dashboard/components/whatsapp/wa-flow-builder/utils.ts"
    "frontend/app-dashboard/next.config.ts"
)

for file in "${files[@]}"; do
    echo "Rsyncing $file..."
    rsync -avz -e "ssh -i $key" "$file" "$host:/var/www/aimstors/$file"
done

echo "Triggering remote build and restart..."
ssh -i $key $host "
    set -e
    cd /var/www/aimstors/backend
    npm run build
    sudo pm2 delete all || true
    sudo pm2 start dist/api-service/main.js --name aimstors-api
    sudo pm2 start dist/worker-service/main.js --name aimstors-worker
    sudo pm2 start dist/webhook-service/main.js --name aimstors-webhook

    cd /var/www/aimstors/frontend/app-dashboard
    npm run build
    sudo pm2 start npm --name aimstors-dashboard -- start -- -p 3000
    sudo pm2 save
"
