import subprocess
import os

key = os.path.expanduser("~/Downloads/aimstors2.pem")
host = "ec2-user@13.232.186.189"

files = [
    ("backend/shared/database/entities/core/contact.entity.ts", "/var/www/aimstors/backend/shared/database/entities/core/contact.entity.ts"),
    ("backend/api-service/contacts/contacts.service.ts", "/var/www/aimstors/backend/api-service/contacts/contacts.service.ts"),
    ("backend/api-service/contacts/contacts.controller.ts", "/var/www/aimstors/backend/api-service/contacts/contacts.controller.ts"),
    ("backend/api-service/messages/messages.service.ts", "/var/www/aimstors/backend/api-service/messages/messages.service.ts"),
    ("backend/api-service/messages/messages.controller.ts", "/var/www/aimstors/backend/api-service/messages/messages.controller.ts"),
    ("backend/shared/whatsapp/whatsapp.service.ts", "/var/www/aimstors/backend/shared/whatsapp/whatsapp.service.ts"),
    ("backend/api-service/whatsapp/whatsapp.controller.ts", "/var/www/aimstors/backend/api-service/whatsapp/whatsapp.controller.ts"),
    
    ("frontend/app-dashboard/app/contacts/page.tsx", "/var/www/aimstors/frontend/app-dashboard/app/contacts/page.tsx"),
    ("frontend/app-dashboard/app/dashboard/[workspaceId]/(agent)/inbox/page.tsx", "/var/www/aimstors/frontend/app-dashboard/app/dashboard/[workspaceId]/(agent)/inbox/page.tsx"),
    ("frontend/app-dashboard/components/contacts/ContactTable.tsx", "/var/www/aimstors/frontend/app-dashboard/components/contacts/ContactTable.tsx"),
    ("frontend/app-dashboard/components/contacts/AddEditContactModal.tsx", "/var/www/aimstors/frontend/app-dashboard/components/contacts/AddEditContactModal.tsx"),
    ("frontend/app-dashboard/components/contacts/ImportExportModals.tsx", "/var/www/aimstors/frontend/app-dashboard/components/contacts/ImportExportModals.tsx"),
    ("frontend/app-dashboard/components/inbox/ConversationItem.tsx", "/var/www/aimstors/frontend/app-dashboard/components/inbox/ConversationItem.tsx"),
    ("frontend/app-dashboard/components/whatsapp/wa-flow-builder/utils.ts", "/var/www/aimstors/frontend/app-dashboard/components/whatsapp/wa-flow-builder/utils.ts"),
]

for local, remote in files:
    print(f"SCP-ing {local} to {remote}...")
    subprocess.run(["scp", "-i", key, local, f"{host}:{remote}"], check=True)

print("Running Rebuild & Restart on Server...")
remote_cmds = """
set -e
cd /var/www/aimstors/backend
npm run build
pm2 delete api worker webhook || true
pm2 start dist/api-service/main.js --name api
pm2 start dist/worker-service/main.js --name worker
pm2 start dist/webhook-service/main.js --name webhook

cd /var/www/aimstors/frontend/app-dashboard
npm run build
pm2 delete dashboard || true
pm2 start npm --name dashboard -- start -- -p 3000
pm2 save
"""
subprocess.run(["ssh", "-i", key, host, remote_cmds], check=True)
print("Done!")
