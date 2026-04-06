import subprocess
import os
import base64

files = [
    ("backend/shared/database/entities/core/contact.entity.ts", "/var/www/aimstors/backend/shared/database/entities/core/contact.entity.ts"),
    ("backend/api-service/contacts/contacts.service.ts", "/var/www/aimstors/backend/api-service/contacts/contacts.service.ts"),
    ("backend/api-service/contacts/contacts.controller.ts", "/var/www/aimstors/backend/api-service/contacts/contacts.controller.ts"),
    ("backend/api-service/messages/messages.service.ts", "/var/www/aimstors/backend/api-service/messages/messages.service.ts"),
    ("backend/api-service/messages/messages.controller.ts", "/var/www/aimstors/backend/api-service/messages/messages.controller.ts"),
    ("backend/shared/whatsapp/whatsapp.service.ts", "/var/www/aimstors/backend/shared/whatsapp/whatsapp.service.ts"),
    ("backend/api-service/whatsapp/whatsapp.controller.ts", "/var/www/aimstors/backend/api-service/whatsapp/whatsapp.controller.ts"),
    # Frontend key files
    ("frontend/app-dashboard/app/contacts/page.tsx", "/var/www/aimstors/frontend/app-dashboard/app/contacts/page.tsx"),
    ("frontend/app-dashboard/app/dashboard/[workspaceId]/(agent)/inbox/page.tsx", "/var/www/aimstors/frontend/app-dashboard/app/dashboard/[workspaceId]/(agent)/inbox/page.tsx"),
]

key = os.path.expanduser("~/Downloads/aimstors2.pem")
host = "ec2-user@13.232.186.189"

for local, remote in files:
    print(f"Deploying {local}...")
    with open(local, "rb") as f:
        content = base64.b64encode(f.read()).decode()
    
    cmd = f"echo '{content}' | base64 -d > {remote}"
    subprocess.run(["ssh", "-i", key, host, cmd], check=True)

print("Running backend rebuild...")
rebuild_cmd = "cd /var/www/aimstors/backend && npm run build && sudo pkill -f 'node dist' || true && nohup node dist/api-service/main.js > api.log 2>&1 &"
subprocess.run(["ssh", "-i", key, host, rebuild_cmd], check=True)

print("Running frontend rebuild...")
fe_rebuild_cmd = "cd /var/www/aimstors/frontend/app-dashboard && npm run build && sudo pkill -f 'next-server' || true && nohup npm run start -- -p 3000 > dashboard.log 2>&1 &"
subprocess.run(["ssh", "-i", key, host, fe_rebuild_cmd], check=True)

print("Done!")
