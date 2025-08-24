#!/bin/bash
set -e

echo "🧪 Testing Twilio App Locally Before AWS Deployment"
echo "=================================================="

# Check if required files exist
echo "📋 Checking deployment files..."
files=(".env.production" "Dockerfile" "docker-compose.prod.yml")
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file exists"
    else
        echo "❌ $file missing"
        exit 1
    fi
done

# Check if environment variables are set
echo "🔍 Checking environment variables in .env.production..."
required_vars=("TWILIO_ACCOUNT_SID" "TWILIO_AUTH_TOKEN" "DEEPGRAM_API_KEY" "SUPABASE_URL")
for var in "${required_vars[@]}"; do
    if grep -q "^${var}=" .env.production && ! grep -q "^${var}=your_" .env.production; then
        echo "✅ $var is configured"
    else
        echo "❌ $var needs to be configured in .env.production"
        echo "   Current value: $(grep "^${var}=" .env.production || echo "NOT SET")"
    fi
done

# Test Docker build
echo "🏗️ Testing Docker build..."
if docker build -t twilio-app-test . > /dev/null 2>&1; then
    echo "✅ Docker build successful"
else
    echo "❌ Docker build failed"
    exit 1
fi

# Test application startup
echo "🚀 Testing application startup..."
docker run --rm -d --name twilio-test -p 3001:3000 --env-file .env.production twilio-app-test

# Wait for app to start
echo "⏳ Waiting for app to start..."
sleep 10

# Test health endpoint
if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
    echo "✅ Health check passed!"
    echo "✅ App is ready for AWS deployment!"
else
    echo "❌ Health check failed"
    echo "📋 Check logs:"
    docker logs twilio-test
fi

# Cleanup
docker stop twilio-test > /dev/null 2>&1 || true
docker rmi twilio-app-test > /dev/null 2>&1 || true

echo ""
echo "🎉 Local testing complete!"
echo "📋 Next steps:"
echo "   1. Commit all deployment files to git"
echo "   2. Launch AWS EC2 instance" 
echo "   3. Run deploy-aws.sh on your server"
echo "   4. Configure domain and SSL"
echo "   5. Update Twilio webhook URL"
