#!/bin/bash
KEY=~/Downloads/aimstors2.pem
HOST=ec2-user@13.232.186.189

deploy_file() {
    local src=$1
    local dst=$2
    echo "Deploying $src to $dst..."
    ssh -i $KEY $HOST "cat > $dst" < "$src"
}

# Backend
deploy_file "backend/api-service/contacts/contacts.controller.ts" "/var/www/aimstors/backend/api-service/contacts/contacts.controller.ts"
deploy_file "backend/api-service/contacts/contacts.service.ts" "/var/www/aimstors/backend/api-service/contacts/contacts.service.ts"
deploy_file "backend/shared/database/entities/core/contact.entity.ts" "/var/www/aimstors/backend/shared/database/entities/core/contact.entity.ts"
deploy_file "backend/api-service/messages/messages.service.ts" "/var/www/aimstors/backend/api-service/messages/messages.service.ts"

# Frontend components
deploy_file "frontend/app-dashboard/components/contacts/ContactTable.tsx" "/var/www/aimstors/frontend/app-dashboard/components/contacts/ContactTable.tsx"
deploy_file "frontend/app-dashboard/components/contacts/AddEditContactModal.tsx" "/var/www/aimstors/frontend/app-dashboard/components/contacts/AddEditContactModal.tsx"
deploy_file "frontend/app-dashboard/components/contacts/ImportExportModals.tsx" "/var/www/aimstors/frontend/app-dashboard/components/contacts/ImportExportModals.tsx"
deploy_file "frontend/app-dashboard/components/inbox/MessageBubble.tsx" "/var/www/aimstors/frontend/app-dashboard/components/inbox/MessageBubble.tsx"
deploy_file "frontend/app-dashboard/components/inbox/ConversationItem.tsx" "/var/www/aimstors/frontend/app-dashboard/components/inbox/ConversationItem.tsx"

# Frontend pages
deploy_file "frontend/app-dashboard/app/contacts/page.tsx" "/var/www/aimstors/frontend/app-dashboard/app/contacts/page.tsx"
deploy_file "frontend/app-dashboard/app/dashboard/[workspaceId]/(agent)/inbox/page.tsx" "/var/www/aimstors/frontend/app-dashboard/app/dashboard/[workspaceId]/(agent)/inbox/page.tsx"

# Flow builder fix (required for build/runtime)
deploy_file "frontend/app-dashboard/components/whatsapp/wa-flow-builder/utils.ts" "/var/www/aimstors/frontend/app-dashboard/components/whatsapp/wa-flow-builder/utils.ts"

echo "Restarting Backend..."
ssh -i $KEY $HOST "pm2 restart all"

echo "Deployment Complete."
