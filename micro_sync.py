import subprocess
import os
import base64
import zlib

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
    ("frontend/app-dashboard/next.config.ts", "/var/www/aimstors/frontend/app-dashboard/next.config.ts"),
]

key = os.path.expanduser("~/Downloads/aimstors2.pem")
host = "ec2-user@13.232.186.189"

for local, remote in files:
    print(f"Syncing {local}...")
    with open(local, "rb") as f:
        # Compress and base64 to minimize packet size
        compressed = zlib.compress(f.read())
        content = base64.b64encode(compressed).decode()
    
    # Send via SSH one-liner
    remote_cmd = f"echo '{content}' | base64 -d | python3 -c 'import zlib,sys; sys.stdout.buffer.write(zlib.decompress(sys.stdin.buffer.read()))' > {remote}"
    subprocess.run(["ssh", "-i", key, host, remote_cmd], check=True)

print("All files synced. Triggering build...")
remote_build = """
set -e
cd /var/www/aimstors/backend
npm run build
sudo pm2 delete api worker webhook || true
sudo pm2 start dist/api-service/main.js --name api
sudo pm2 start dist/worker-service/main.js --name worker
sudo pm2 start dist/webhook-service/main.js --name webhook

cd /var/www/aimstors/frontend/app-dashboard
npm run build
sudo pm2 delete aimstors-frontend || true
sudo pm2 start npm --name aimstors-frontend -- start -- -p 3000
"""
subprocess.run(["ssh", "-i", key, host, remote_build], check=True)
print("SUCCESS!")
