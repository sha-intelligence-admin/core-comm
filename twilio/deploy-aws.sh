#!/bin/bash
set -e

echo "🤖 Starting AWS EC2 Advanced RAG System Deployment..."

# System requirements check
echo "🔍 Checking system requirements for RAG system..."
REQUIRED_RAM_KB=7000000  # 7GB minimum for AI processing
AVAILABLE_RAM_KB=$(grep MemAvailable /proc/meminfo | awk '{print $2}')

if [ $AVAILABLE_RAM_KB -lt $REQUIRED_RAM_KB ]; then
    echo "⚠️  WARNING: System has $(($AVAILABLE_RAM_KB/1000000))GB RAM. RAG system requires minimum 7GB."
    echo "   Recommended: Use t3.large or larger instance for optimal performance."
fi

# Update system  
echo "📦 Updating system packages..."
sudo apt update && sudo apt upgrade -y

# Install Docker with enhanced configuration
echo "📦 Installing Docker..."
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Configure Docker for AI workloads
echo "⚙️ Configuring Docker for AI workloads..."
sudo mkdir -p /etc/docker
cat << 'EOF' | sudo tee /etc/docker/daemon.json
{
  "log-driver": "json-file",
  "log-opts": {
    "max-size": "10m",
    "max-file": "3"
  },
  "storage-driver": "overlay2"
}
EOF

sudo systemctl restart docker

# Install Docker Compose
echo "📦 Installing Docker Compose..."
sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Install additional tools for RAG system
echo "📦 Installing system dependencies for RAG system..."
sudo apt install -y git curl nginx certbot python3-certbot-nginx htop iotop unzip

# Install Node.js (for backup local testing if needed)
echo "📦 Installing Node.js..."
curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
sudo apt-get install -y nodejs

# Clone your repository
echo "📂 Cloning repository..."
if [ ! -d "core-comm" ]; then
    git clone https://github.com/sha-intelligence-admin/core-comm.git
fi

cd core-comm/twilio

# Setup environment files
echo "⚙️ Setting up environment variables for RAG system..."
if [ ! -f ".env.production" ]; then
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env.production
        echo "📋 Environment template created: .env.production"
        echo "❗ REQUIRED: Fill in your API keys in .env.production:"
        echo "   - TWILIO_ACCOUNT_SID & TWILIO_AUTH_TOKEN"
        echo "   - OPENAI_API_KEY (GPT-4 access required)"
        echo "   - ELEVENLABS_API_KEY"
        echo "   - DEEPGRAM_API_KEY"
        echo "   - SUPABASE credentials"
        echo "   - PUBLIC_DOMAIN"
        echo ""
        echo "🔗 API Key Setup Help:"
        echo "   OpenAI: https://platform.openai.com/api-keys"
        echo "   ElevenLabs: https://elevenlabs.io/speech-synthesis"
        echo "   Deepgram: https://console.deepgram.com/"
        echo ""
        echo "⏸️  Pausing deployment. After filling .env.production, re-run this script."
        exit 1
    else
        echo "❌ .env.production.example not found. Please create environment file manually."
        exit 1
    fi
fi

# Validate critical environment variables
echo "🔍 Validating RAG system environment variables..."
source .env.production

missing_vars=""
[ -z "$TWILIO_ACCOUNT_SID" ] && missing_vars="$missing_vars TWILIO_ACCOUNT_SID"
[ -z "$TWILIO_AUTH_TOKEN" ] && missing_vars="$missing_vars TWILIO_AUTH_TOKEN"
[ -z "$OPENAI_API_KEY" ] && missing_vars="$missing_vars OPENAI_API_KEY"
[ -z "$ELEVENLABS_API_KEY" ] && missing_vars="$missing_vars ELEVENLABS_API_KEY"
[ -z "$DEEPGRAM_API_KEY" ] && missing_vars="$missing_vars DEEPGRAM_API_KEY"
[ -z "$SUPABASE_URL" ] && missing_vars="$missing_vars SUPABASE_URL"
[ -z "$PUBLIC_DOMAIN" ] && missing_vars="$missing_vars PUBLIC_DOMAIN"

if [ ! -z "$missing_vars" ]; then
    echo "❌ Missing required environment variables: $missing_vars"
    echo "   Please update .env.production with your API keys and domain."
    exit 1
fi

echo "✅ Environment variables validated!"

# Test API keys (basic connectivity)
echo "🔑 Testing API key connectivity..."

# Test OpenAI API
if curl -s -H "Authorization: Bearer $OPENAI_API_KEY" "https://api.openai.com/v1/models" | grep -q "gpt-4"; then
    echo "✅ OpenAI API key valid (GPT-4 access confirmed)"
else
    echo "⚠️  OpenAI API key may be invalid or lacks GPT-4 access"
fi

# Test ElevenLabs API
if curl -s -H "xi-api-key: $ELEVENLABS_API_KEY" "https://api.elevenlabs.io/v1/voices" | grep -q "voice_id"; then
    echo "✅ ElevenLabs API key valid"
else
    echo "⚠️  ElevenLabs API key may be invalid"
fi

# Pre-build dependency check
echo "🔍 Checking system resources before build..."
df -h / | tail -1 | awk '{print "💾 Disk space: " $4 " available"}'
free -h | grep "Mem:" | awk '{print "🧠 Memory: " $7 " available"}'

# Build and start the RAG application
echo "🏗️ Building and starting Advanced RAG application..."
echo "   This may take 5-10 minutes due to AI service dependencies..."

docker-compose -f docker-compose.prod.yml up -d --build

echo "⏳ Waiting for services to initialize..."
sleep 30

# Enhanced health checks
echo "🔍 Performing comprehensive health checks..."

# Basic health check
if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    echo "✅ Basic health check passed"
else
    echo "❌ Basic health check failed"
    echo "📋 Checking logs for errors..."
    docker-compose -f docker-compose.prod.yml logs --tail=50 twilio-app
    exit 1
fi

# Environment validation check
if docker-compose -f docker-compose.prod.yml logs twilio-app 2>&1 | grep -q "Environment validation successful"; then
    echo "✅ Environment validation passed"
else
    echo "❌ Environment validation failed - check API keys"
    docker-compose -f docker-compose.prod.yml logs twilio-app | grep -E "(Environment|validation|Error)"
fi

# Check if services are ready
echo "🔍 Checking AI service integrations..."
sleep 10

# Monitor logs for successful startup
if docker-compose -f docker-compose.prod.yml logs twilio-app 2>&1 | grep -q -E "(OpenAI|ElevenLabs).*initialized|connected|ready"; then
    echo "✅ AI services initialized successfully"
else
    echo "⚠️  AI services may need more time to initialize"
fi

echo ""
echo "🎉 RAG System Deployment Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🌐 Application Status:"
echo "   • Basic Health: http://localhost:3000/api/health"  
echo "   • Detailed Health: http://localhost:3000/api/health/detailed"
echo "   • Logs: docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "📋 Next Steps:"
echo "   1. 🔒 Configure SSL certificate (certbot)"
echo "   2. 🌐 Update Twilio webhook: https://yourdomain.com/api/calls/voice"
echo "   3. 🧪 Test RAG system:"
echo "      • Legacy KB: 'What is your business model?'"
echo "      • OpenAI: 'How do you ensure AI safety?'"
echo "      • Context: Ask follow-up questions"
echo ""
echo "💡 Monitoring Commands:"
echo "   • Monitor AI usage: docker-compose logs app | grep -E '(OpenAI|ElevenLabs)'"
echo "   • Check conversations: docker-compose logs app | grep 'conversation history'"
echo "   • System resources: htop"
echo ""
echo "🎯 Expected Performance:"
echo "   • Legacy KB: < 1 second responses"
echo "   • OpenAI: 2-4 second intelligent responses"
echo "   • Memory usage: 4-6GB with conversation history"
echo ""
echo "✨ Your Advanced RAG Voice AI System is Ready!"
