#!/bin/bash

# Configuration
REPO_URL="https://github.com/itsmodassir/aerostic-whatsapp-automation.git"
APP_DIR="aerostic"

echo "🚀 Starting Aerostic AWS Deployment..."

# 0. Check for Environment File
if [ ! -f ".env" ]; then
    echo "❌ Error: .env file missing!"
    echo "   Please create a .env file with your secrets."
    echo "   You can use .env.production.example as a template."
    exit 1
fi

# 1. Update System
echo "🔄 Updating system packages..."

install_docker() {
    echo "🐳 Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sh get-docker.sh
    sudo usermod -aG docker $USER
    # Install Docker Compose Plugin
    sudo apt-get install -y docker-compose-plugin || sudo yum install -y docker-compose-plugin
}

create_swap() {
    if [ $(swapon --show | wc -l) -eq 0 ]; then
        echo "💾 Creating 4GB Swap file (crucial for small EC2)..."
        sudo fallocate -l 4G /swapfile
        sudo chmod 600 /swapfile
        sudo mkswap /swapfile
        sudo swapon /swapfile
        echo '/swapfile none swap sw 0 0' | sudo tee -a /etc/fstab
        echo "✅ Swap created."
    else
        echo "✅ Swap already exists."
    fi
}

if ! command -v docker &> /dev/null; then
    install_docker
else
    echo "✅ Docker is already installed."
fi

# 1.5 Create Swap (Prevent OOM kills on build)
create_swap

# 2. Enable Docker Service
echo "🔌 Enabling Docker service..."
sudo systemctl enable docker
sudo systemctl start docker

# 3. Clone/Update Repo
if [ -d "$APP_DIR" ]; then
    echo "📂 Directory exists. pulling latest code..."
    cd $APP_DIR
    git pull
else
    echo "📂 Cloning repository..."
    git clone $REPO_URL $APP_DIR
    cd $APP_DIR
fi

# 4. Copy Environment File
# Assuming the user uploads .env to the home dir, we copy it into the app dir
if [ -f "../.env" ]; then
    echo "🔐 Copying .env file into application directory..."
    cp ../.env .
fi

# 5. Start Application
echo "🚀 Building and starting containers..."
echo "Naming project: aerostic"

# Using 'docker compose' (plugin) preferred over 'docker-compose' (standalone)
if docker compose version &> /dev/null; then
    docker compose down
    docker compose up --build -d
elif command -v docker-compose &> /dev/null; then
    docker-compose down
    docker-compose up --build -d
else
    echo "❌ Error: Docker Compose not found. Please verify installation."
    exit 1
fi

echo "✅ Deployment Complete!"
echo "➡️  App Frontend: http://$(curl -s http://checkip.amazonaws.com):3000"
echo "➡️  App Backend:  http://$(curl -s http://checkip.amazonaws.com):3001"

