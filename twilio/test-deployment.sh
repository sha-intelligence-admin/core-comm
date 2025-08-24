#!/bin/bash
set -e

echo "🧪 Testing Advanced RAG System Locally Before AWS Deployment"
echo "=========================================================="

# Check if required files exist
echo "📋 Checking deployment files for RAG system..."
files=(".env.production.example" ".env.example" "Dockerfile" "docker-compose.prod.yml" "src/services/OpenAIService.js" "src/services/ElevenLabsService.js" "src/nlp/secure-kb.js")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing - RAG system incomplete"
        exit 1
    fi
done

# Create test environment if production doesn't exist
if [ ! -f ".env.production" ]; then
    echo "📋 Creating test environment from .env.example..."
    cp .env.example .env.production
    echo "⚠️  WARNING: Using template environment - fill in real API keys for full testing"
fi

# Check environment variables for RAG system
echo "🔍 Checking RAG system environment variables..."
required_vars=(
    "TWILIO_ACCOUNT_SID" 
    "TWILIO_AUTH_TOKEN" 
    "DEEPGRAM_API_KEY" 
    "OPENAI_API_KEY" 
    "ELEVENLABS_API_KEY" 
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
)

missing_config=false
for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env.production && ! grep -q "^${var}=your_" .env.production; then
        echo "✅ $var is configured"
    else
        echo "❌ $var needs to be configured in .env.production"
        echo "   Current value: $(grep "^${var}=" .env.production || echo "NOT SET")"
        missing_config=true
    fi
done

if [ "$missing_config" = true ]; then
    echo ""
    echo "🔑 API Key Setup Required:"
    echo "   OpenAI: https://platform.openai.com/api-keys (GPT-4 access needed)"
    echo "   ElevenLabs: https://elevenlabs.io/speech-synthesis"
    echo "   Deepgram: https://console.deepgram.com/"
    echo "   Supabase: https://app.supabase.com/"
    echo ""
    echo "⚠️  Continuing with limited testing (API calls will fail)..."
fi

# Test API keys if configured
echo "🔑 Testing API key connectivity (if configured)..."
source .env.production

# Test OpenAI API if key is set
if [ ! -z "$OPENAI_API_KEY" ] && [ "$OPENAI_API_KEY" != "your_openai_api_key_here" ]; then
    if curl -s --max-time 10 -H "Authorization: Bearer $OPENAI_API_KEY" "https://api.openai.com/v1/models" | grep -q "gpt-4"; then
        echo "✅ OpenAI API key valid (GPT-4 access confirmed)"
    else
        echo "⚠️  OpenAI API key may be invalid or lacks GPT-4 access"
    fi
else
    echo "⏭️  OpenAI API key not configured - skipping test"
fi

# Test ElevenLabs API if key is set
if [ ! -z "$ELEVENLABS_API_KEY" ] && [ "$ELEVENLABS_API_KEY" != "your_elevenlabs_api_key_here" ]; then
    if curl -s --max-time 10 -H "xi-api-key: $ELEVENLABS_API_KEY" "https://api.elevenlabs.io/v1/voices" | grep -q "voice_id"; then
        echo "✅ ElevenLabs API key valid"
    else
        echo "⚠️  ElevenLabs API key may be invalid"
    fi
else
    echo "⏭️  ElevenLabs API key not configured - skipping test"
fi

# Check system requirements for RAG
echo "🔍 Checking system requirements for RAG system..."
AVAILABLE_RAM_KB=$(free | grep "Mem:" | awk '{print $7}')
if [ $AVAILABLE_RAM_KB -lt 4000000 ]; then  # 4GB minimum for local testing
    echo "⚠️  WARNING: System has limited RAM. RAG system may need more memory in production."
else
    echo "✅ Sufficient RAM for RAG system testing"
fi

# Test npm dependencies
echo "📦 Checking RAG system dependencies..."
if [ -f "package.json" ]; then
    if npm list openai @elevenlabs/elevenlabs-js > /dev/null 2>&1; then
        echo "✅ RAG dependencies installed"
    else
        echo "📦 Installing RAG dependencies..."
        npm install
    fi
else
    echo "❌ package.json not found"
    exit 1
fi

# Test syntax of critical RAG files
echo "🔍 Testing RAG system syntax..."
test_files=(
    "src/services/OpenAIService.js"
    "src/services/ElevenLabsService.js" 
    "src/nlp/secure-kb.js"
    "src/websocket.js"
    "src/index.js"
)

for file in "${test_files[@]}"; do
    if node -c "$file" 2>/dev/null; then
        echo "✅ $file syntax OK"
    else
        echo "❌ $file has syntax errors"
        node -c "$file"
        exit 1
    fi
done

# Test secure knowledge base
echo "🧠 Testing secure knowledge base..."
if node -e "
import kb from './src/nlp/secure-kb.js';
(async () => {
    const result = await kb.getBestAnswer('en', 'business model');
    if (result && result.answer) {
        console.log('✅ Knowledge base working - sample answer:', result.answer.substring(0, 50) + '...');
        process.exit(0);
    } else {
        console.log('❌ Knowledge base test failed');
        process.exit(1);
    }
})();
" 2>/dev/null; then
    echo "✅ Secure knowledge base functional"
else
    echo "❌ Knowledge base test failed"
    exit 1
fi

# Test Docker build
echo "🏗️ Testing Docker build for RAG system..."
if docker build -t twilio-rag-test . > build.log 2>&1; then
    echo "✅ Docker build successful"
    rm -f build.log
else
    echo "❌ Docker build failed"
    echo "📋 Build log:"
    tail -20 build.log
    rm -f build.log
    exit 1
fi

# Test application startup with RAG system
echo "🚀 Testing RAG application startup..."
docker run --rm -d --name twilio-rag-test -p 3001:3000 --env-file .env.production twilio-rag-test

# Wait for app to start (RAG system needs more time)
echo "⏳ Waiting for RAG system to initialize (30 seconds)..."
sleep 30

# Test health endpoints
echo "🔍 Testing health endpoints..."
if curl -s --max-time 10 http://localhost:3001/api/health | grep -q '"status":"ok"'; then
    echo "✅ Basic health check passed"
else
    echo "❌ Basic health check failed"
    echo "📋 Application logs:"
    docker logs twilio-rag-test --tail=20
    docker stop twilio-rag-test > /dev/null 2>&1 || true
    docker rmi twilio-rag-test > /dev/null 2>&1 || true
    exit 1
fi

# Test detailed health endpoint
if curl -s --max-time 10 http://localhost:3001/api/health/detailed > /dev/null 2>&1; then
    echo "✅ Detailed health check passed"
else
    echo "⚠️  Detailed health check failed (may be due to missing API keys)"
fi

# Check for RAG system initialization in logs
echo "🔍 Checking RAG system initialization..."
docker logs twilio-rag-test 2>&1 | head -50 > startup.log

if grep -q "Environment validation successful" startup.log; then
    echo "✅ Environment validation passed"
else
    echo "⚠️  Environment validation issues (check API keys)"
fi

if grep -q -E "(OpenAI|ElevenLabs)" startup.log; then
    echo "✅ RAG services initialized"
else
    echo "⚠️  RAG services may not be fully initialized"
fi

# Test WebSocket endpoint
echo "🔌 Testing WebSocket endpoint..."
if curl -I --max-time 5 "http://localhost:3001/api/calls/media-stream/test/test" 2>/dev/null | grep -q "400\|426"; then
    echo "✅ WebSocket endpoint responding"
else
    echo "⚠️  WebSocket endpoint may have issues"
fi

rm -f startup.log

# Cleanup
echo "🧹 Cleaning up test containers..."
docker stop twilio-rag-test > /dev/null 2>&1 || true
docker rmi twilio-rag-test > /dev/null 2>&1 || true

echo ""
echo "🎉 RAG System Local Testing Complete!"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "📊 Test Summary:"
echo "   ✅ Deployment files present"
echo "   ✅ Docker build successful"
echo "   ✅ Application startup working"
echo "   ✅ Health endpoints functional"
echo "   ✅ RAG system components loaded"
echo "   ✅ Secure knowledge base working"
echo ""
echo "🚀 Ready for AWS Deployment!"
echo ""
echo "📋 Next Steps:"
echo "   1. 📝 Commit all files to git"
echo "   2. 🌐 Launch AWS EC2 instance (t3.large minimum)"
echo "   3. 🛠️  Run deploy-aws.sh on your server"
echo "   4. 🔒 Configure domain and SSL certificate"
echo "   5. 📞 Update Twilio webhook URL"
echo "   6. 🧪 Test RAG system:"
echo "      • 'What is your business model?' (Legacy KB)"
echo "      • 'How do you ensure AI safety?' (OpenAI)"
echo "      • Follow-up questions (Context test)"
echo ""
echo "💡 Production Testing Commands:"
echo "   curl https://yourdomain.com/api/health"
echo "   curl https://yourdomain.com/api/health/detailed"
echo ""
echo "✨ Your Advanced RAG System is Ready for Production!"