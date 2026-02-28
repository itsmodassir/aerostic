# AWS Deployment Guide ☁️

Follow these steps to deploy the Aimstors Solution platform to an AWS EC2 instance.

## 1. Launch EC2 Instance
1.  Go to AWS Console -> EC2 -> **Launch Instance**.
2.  **OS**: Ubuntu 22.04 LTS (Recommended) or Amazon Linux 2023.
3.  **Instance Type**: `t3.medium` (minimum for DB + Backend + Frontend build) or `t3.small` (might be slow).
4.  **Key Pair**: Create or select an existing `.pem` key.
5.  **Security Group**: Allow the following ports:
    *   `22` (SSH) - My IP only
    *   `80` (HTTP) - Anywhere
    *   `3000` (Frontend) - Anywhere
    *   `3001` (Backend) - Anywhere

## 2. Connect to Server
Open your terminal and SSH into the instance:
```bash
chmod 400 your-key.pem
ssh -i "your-key.pem" ubuntu@YOUR_INSTANCE_PUBLIC_IP
```

## 3. Configure Secrets
Create the production environment file:
```bash
nano .env
```
Paste the contents from your local `.env.production.example` and replace the values with your real secrets:
*   `GEMINI_API_KEY`: Your real key.
*   `META_APP_ID`: From Meta Developers.
*   `NEXT_PUBLIC_API_URL`: **Important** - Set this to `http://YOUR_INSTANCE_PUBLIC_IP:3001`

Hit `Ctrl+O`, `Enter`, then `Ctrl+X` to save.

## 4. Run Deployment
Download the deployment script (or clone the repo manually first if private):

```bash
# Clone the repository (you may need to set up SSH keys or use HTTPS with a token)
git clone https://github.com/itsmodassir/aimstors-whatsapp-automation.git aimstors
cd aimstors

# Copy your .env file into the project
cp ../.env .

# Run the deployment script
chmod +x deploy_aws.sh
./deploy_aws.sh
```

## 5. Verify
Wait for the "Deployment Complete" message.
*   **Frontend**: `http://YOUR_INSTANCE_PUBLIC_IP:3000`
*   **Backend**: `http://YOUR_INSTANCE_PUBLIC_IP:3001`

## Troubleshooting
*   **Logs**: `sudo docker compose logs -f`
*   **Restart**: `./deploy_aws.sh` (pulls latest code and rebuilds)
