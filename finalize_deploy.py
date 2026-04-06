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
    ("frontend/app-dashboard/app/contacts/page.tsx", "/var/www/aimstors/frontend/app-dashboard/app/contacts/page.tsx"),
    ("frontend/app-dashboard/app/dashboard/[workspaceId]/(agent)/inbox/page.tsx", "/var/www/aimstors/frontend/app-dashboard/app/dashboard/[workspaceId]/(agent)/inbox/page.tsx"),
    ("frontend/app-dashboard/components/whatsapp/wa-flow-builder/utils.ts", "/var/www/aimstors/frontend/app-dashboard/components/whatsapp/wa-flow-builder/utils.ts"),
]

key = os.path.expanduser("~/Downloads/aimstors2.pem")
host = "ec2-user@13.232.186.189"

command = []
for local, remote in files:
    with open(local, "rb") as f:
        content = base64.b64encode(f.read()).decode()
    command.append(f"echo '{content}' | base64 -d > {remote}")

# Final build and restart
command.append("cd /var/www/aimstors/backend && npm run build -- --stats-error-details")
command.append("sudo pkill -f 'node dist' || true")
command.append("nohup node dist/api-service/main.js > api.log 2>&1 &")
command.append("cd /var/www/aimstors/frontend/app-dashboard && npm run build")
command.append("sudo pkill -f 'next-server' || true")
command.append("nohup npm run start -- -p 3000 > dashboard.log 2>&1 &")

full_script = " && ".join(command)
subprocess.run(["ssh", "-i", key, host, full_script])
print("Final push complete.")
