import subprocess
import os

files_to_deploy = [
    # Backend
    ("backend/shared/database/entities/core/contact.entity.ts", "/var/www/aimstors/backend/shared/database/entities/core/contact.entity.ts"),
    ("backend/api-service/contacts/contacts.controller.ts", "/var/www/aimstors/backend/api-service/contacts/contacts.controller.ts"),
    ("backend/api-service/contacts/contacts.service.ts", "/var/www/aimstors/backend/api-service/contacts/contacts.service.ts"),
    ("backend/api-service/messages/messages.service.ts", "/var/www/aimstors/backend/api-service/messages/messages.service.ts"),
    ("backend/shared/whatsapp/whatsapp.service.ts", "/var/www/aimstors/backend/shared/whatsapp/whatsapp.service.ts"),
    ("backend/api-service/whatsapp/whatsapp.controller.ts", "/var/www/aimstors/backend/api-service/whatsapp/whatsapp.controller.ts"),
    
    # Frontend Components
    ("frontend/app-dashboard/components/contacts/ContactTable.tsx", "/var/www/aimstors/frontend/app-dashboard/components/contacts/ContactTable.tsx"),
    ("frontend/app-dashboard/components/contacts/AddEditContactModal.tsx", "/var/www/aimstors/frontend/app-dashboard/components/contacts/AddEditContactModal.tsx"),
    ("frontend/app-dashboard/components/contacts/ImportExportModals.tsx", "/var/www/aimstors/frontend/app-dashboard/components/contacts/ImportExportModals.tsx"),
    ("frontend/app-dashboard/components/inbox/ConversationItem.tsx", "/var/www/aimstors/frontend/app-dashboard/components/inbox/ConversationItem.tsx"),
    ("frontend/app-dashboard/components/whatsapp/wa-flow-builder/utils.ts", "/var/www/aimstors/frontend/app-dashboard/components/whatsapp/wa-flow-builder/utils.ts"),
    
    # Frontend Pages
    ("frontend/app-dashboard/app/contacts/page.tsx", "/var/www/aimstors/frontend/app-dashboard/app/contacts/page.tsx"),
    ("frontend/app-dashboard/app/dashboard/[workspaceId]/(agent)/inbox/page.tsx", "/var/www/aimstors/frontend/app-dashboard/app/dashboard/[workspaceId]/(agent)/inbox/page.tsx"),
]

ssh_cmd_base = ["ssh", "-i", os.path.expanduser("~/Downloads/aimstors2.pem"), "ec2-user@13.232.186.189"]

for local_path, remote_path in files_to_deploy:
    print(f"Deploying {local_path}...")
    with open(local_path, "r") as f:
        content = f.read()
    
    # Use sudo to write if needed, although we chowned it earlier
    cmd = ssh_cmd_base + [f"cat > {remote_path}"]
    subprocess.run(cmd, input=content.encode())

print("Restarting build and services on server...")
remote_script = """
set -e
# Fix backend
cd /var/www/aimstors/backend
rm -rf dist
npm run build
sudo pkill -f 'node dist' || true
nohup node dist/api-service/main.js > api.log 2>&1 &
nohup node dist/worker-service/main.js > worker.log 2>&1 &
nohup node dist/webhook-service/main.js > webhook.log 2>&1 &

# Fix frontend
cd /var/www/aimstors/frontend/app-dashboard
rm -rf .next
npm run build
sudo pkill -f 'next-server' || true
nohup npm run start -- -p 3000 > dashboard.log 2>&1 &
"""
subprocess.run(ssh_cmd_base + [remote_script])
print("All done!")
