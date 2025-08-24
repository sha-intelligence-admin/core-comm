#!/bin/bash
set -e

echo "🤖 Starting Local Advanced RAG System Deployment..."
echo "   (Skip Git Clone - Use Existing Repository)"
echo ""

# Check if we're in the deployment directory and navigate appropriately
if [ -f "docker-compose.prod.yml" ] && [ -d "../twilio" ]; then
    echo "✅ Running from deployment directory, navigating to twilio..."
    cd ../twilio
elif [ -f "../twilio/package.json" ] && [ -f "../twilio/docker-compose.prod.yml" ]; then
    echo "✅ Found twilio directory, navigating..."
    cd ../twilio
elif [ -f "package.json" ] && [ -f "docker-compose.prod.yml" ]; then
    echo "✅ Already in twilio directory"
else
    echo "❌ Cannot find twilio directory with required files"
    echo "   Expected files: package.json, docker-compose.prod.yml"
    echo "   Current directory: $(pwd)"
    echo ""
    echo "💡 To fix this:"
    echo "   1. Download: wget https://github.com/sha-intelligence-admin/core-comm/archive/refs/heads/main.zip"
    echo "   2. Extract: unzip main.zip && mv core-comm-main core-comm"
    echo "   3. Navigate: cd core-comm/deployment"
    echo "   4. Run this script again"
    exit 1
fi

echo "✅ Running from correct directory: $(pwd)"

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
if ! command -v docker &> /dev/null; then
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
    
    echo "⚠️  Docker installed. You may need to log out and back in for group permissions."
    echo "   Or run: newgrp docker"
else
    echo "✅ Docker already installed"
fi

# Install Docker Compose
echo "📦 Installing Docker Compose..."
if ! command -v docker-compose &> /dev/null; then
    sudo curl -L "https://github.com/docker/compose/releases/download/v2.24.0/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
else
    echo "✅ Docker Compose already installed"
fi

# Install additional tools for RAG system
echo "📦 Installing system dependencies for RAG system..."
sudo apt install -y git curl nginx certbot python3-certbot-nginx htop iotop unzip

# Install Node.js (for backup local testing if needed)
echo "📦 Installing Node.js..."
if ! command -v node &> /dev/null; then
    curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
    sudo apt-get install -y nodejs
else
    echo "✅ Node.js already installed: $(node --version)"
fi

# Setup environment files
echo "⚙️ Setting up environment variables for RAG system..."
if [ ! -f ".env.production" ]; then
    # Try different template files in order of preference
    if [ -f ".env.production.example" ]; then
        cp .env.production.example .env.production
        echo "📋 Environment template created from .env.production.example"
    elif [ -f ".env.template" ]; then
        cp .env.template .env.production
        echo "📋 Environment template created from .env.template"
    elif [ -f ".env.example" ]; then
        cp .env.example .env.production
        echo "📋 Environment template created from .env.example"
    else
        echo "📋 Creating basic .env.production template..."
        cat << 'ENV_TEMPLATE' > .env.production
# Twilio Configuration
TWILIO_ACCOUNT_SID=your_twilio_account_sid
TWILIO_AUTH_TOKEN=your_twilio_auth_token
TWILIO_PHONE_NUMBER=your_twilio_phone_number

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# ElevenLabs Configuration
ELEVENLABS_API_KEY=your_elevenlabs_api_key

# Deepgram Configuration
DEEPGRAM_API_KEY=your_deepgram_api_key

# Supabase Configuration
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key

# Domain Configuration
PUBLIC_DOMAIN=your_domain.com

# Application Configuration
NODE_ENV=production
PORT=3000
ENV_TEMPLATE
        echo "📋 Basic environment template created"
    fi
    
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

# Check if docker group is accessible
if ! docker ps >/dev/null 2>&1; then
    echo "⚠️  Docker permission issue. Running with newgrp docker..."
    exec newgrp docker "$0" "$@"
fi

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
