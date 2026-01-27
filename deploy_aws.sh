#!/bin/bash

# Configuration
REPO_URL="https://github.com/itsmodassir/aersotic.git"
APP_DIR="aerostic"

echo "🚀 Starting Aerostic AWS Deployment..."

# 1. Update System
echo "🔄 Updating system packages..."
if [ -f /etc/os-release ]; then
    . /etc/os-release
    if [[ "$ID" == "ubuntu" ]]; then
        sudo apt-get update -y && sudo apt-get upgrade -y
        sudo apt-get install -y docker.io docker-compose git
    elif [[ "$ID" == "amzn" ]]; then
        sudo yum update -y
        sudo yum install -y docker git
        # Install Docker Compose on Amazon Linux 2023
        sudo curl -L https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m) -o /usr/local/bin/docker-compose
        sudo chmod +x /usr/local/bin/docker-compose
    fi
else
    echo "⚠️ Unsupported OS. Assuming Docker is installed."
fi

# 2. Enable Docker
echo "🐳 Starting Docker..."
sudo systemctl enable docker
sudo systemctl start docker
sudo usermod -aG docker $USER

# 3. Clone/Update Repo
if [ -d "$APP_DIR" ]; then
    echo "📂 Directory exists. Pulling latest code..."
    cd $APP_DIR
    git pull
else
    echo "📂 Cloning repository..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# 4. Start Application
echo "🚀 Building and starting containers..."
# Note: First time build might take a while
if command -v docker-compose &> /dev/null; then
    sudo docker-compose down
    sudo docker-compose up --build -d
else
    sudo docker compose down
    sudo docker compose up --build -d
fi

echo "✅ Deployment Complete!"
echo "➡️  Access your app at http://$(curl -s http://checkip.amazonaws.com)"
