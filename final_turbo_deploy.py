import subprocess
import os

key = os.path.expanduser("~/Downloads/aimstors2.pem")
user_host = "ec2-user@13.232.186.189"

files = [
    "backend/shared/database/entities/core/contact.entity.ts",
    "backend/api-service/contacts/contacts.service.ts",
    "backend/api-service/contacts/contacts.controller.ts",
    "backend/api-service/messages/messages.service.ts",
    "backend/api-service/messages/messages.controller.ts",
    "backend/shared/whatsapp/whatsapp.service.ts",
    "backend/api-service/whatsapp/whatsapp.controller.ts",
    "frontend/app-dashboard/app/contacts/page.tsx",
    "frontend/app-dashboard/app/dashboard/[workspaceId]/(agent)/inbox/page.tsx",
    "frontend/app-dashboard/components/contacts/ContactTable.tsx",
    "frontend/app-dashboard/components/contacts/AddEditContactModal.tsx",
    "frontend/app-dashboard/components/contacts/ImportExportModals.tsx",
    "frontend/app-dashboard/components/inbox/ConversationItem.tsx",
    "frontend/app-dashboard/components/whatsapp/wa-flow-builder/utils.ts",
    "frontend/app-dashboard/next.config.ts"
]

# 1. Create Tarball
print("Creating local tarball...")
subprocess.run(["tar", "-czf", "update_bundle.tar.gz"] + files, check=True)

# 2. SCP Tarball
print("Transferring bundle to server...")
subprocess.run(["scp", "-i", key, "update_bundle.tar.gz", f"{user_host}:/tmp/"], check=True)

# 3. Remote Commands
print("Extracting and Rebuilding on server...")
remote_script = """
set -e
# Restore Source
tar -xzf /tmp/update_bundle.tar.gz -C /var/www/aimstors/

# Backend
cd /var/www/aimstors/backend
npm run build
sudo pm2 delete api worker webhook || true
sudo pm2 start dist/api-service/main.js --name api
sudo pm2 start dist/worker-service/main.js --name worker
sudo pm2 start dist/webhook-service/main.js --name webhook

# Frontend
cd /var/www/aimstors/frontend/app-dashboard
npm run build
sudo pm2 delete aimstors-frontend || true
sudo pm2 start npm --name aimstors-frontend -- start -- -p 3000

sudo pm2 save
"""
subprocess.run(["ssh", "-i", key, user_host, remote_script], check=True)
print("SUCCESS: Deployment completed.")
