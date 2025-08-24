#!/bin/bash
set -e

echo "🚀 Starting AWS EC2 Twilio Deployment..."

# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
echo "📦 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
echo "📦 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.20.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install Git
echo "📦 Installing Git..."
sudo apt install -y git curl nginx certbot python3-certbot-nginx

# Clone your repository
echo "📂 Cloning repository..."
if [ ! -d "core-comm" ]; then
    git clone https://github.com/sha-intelligence-admin/core-comm.git
fi

cd core-comm/twilio

# Setup environment file
echo "⚙️ Setting up environment variables..."
if [ ! -f ".env.production" ]; then
    echo "❗ Please create .env.production file with your credentials"
    echo "📋 Template created at .env.production"
    exit 1
fi

# Build and start the application
echo "🏗️ Building and starting the application..."
docker-compose -f docker-compose.prod.yml up -d --build

echo "✅ Deployment complete!"
echo "🌐 Your app should be running on port 3000"
echo "📋 Next steps:"
echo "   1. Configure your domain/SSL certificate"
echo "   2. Update Twilio webhook URL"
echo "   3. Test your deployment"

# Check if app is running
sleep 10
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Health check passed - app is running!"
else
    echo "❌ Health check failed - check logs with: docker-compose -f docker-compose.prod.yml logs"
fi
