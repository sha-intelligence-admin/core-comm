# 🚀 AWS EC2 Deployment Guide for Twilio Voice App with Advanced RAG

## Overview
This guide covers deploying the upgraded Twilio voice application featuring:
- 🧠 **OpenAI GPT-4 integration** for intelligent responses
- 🗣️ **ElevenLabs TTS** for premium voice synthesis
- 📚 **Hybrid RAG system** combining legacy KB and AI reasoning
- ⚡ **Optimized performance** with smart fallbacks

## Prerequisites
- AWS Account with EC2 access
- Domain name (for SSL/HTTPS - required for WebSockets)
- **Twilio Account** with phone number
- **Deepgram API key** for speech-to-text
- **OpenAI API key** for GPT-4 reasoning (**NEW**)
- **ElevenLabs API key** for premium TTS (**NEW**)
- Supabase database

## Step 1: Launch AWS EC2 Instance

### Instance Configuration:
```bash
Instance Type: t3.large (minimum for RAG system - for production use t3.xlarge+)
Operating System: Ubuntu 22.04 LTS
Storage: 30GB gp3 SSD (minimum - increased for AI models cache)
Memory: 8GB+ RAM (required for OpenAI/ElevenLabs concurrent processing)
Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (App)
```

**⚠️ Important**: The upgraded RAG system requires more resources:
- **CPU**: Higher instance type for AI processing
- **Memory**: 8GB+ for concurrent OpenAI/ElevenLabs requests
- **Storage**: Additional space for audio caching and logs

### Security Group Rules:
```
Type        Protocol    Port Range    Source
SSH         TCP         22           Your IP/0.0.0.0/0
HTTP        TCP         80           0.0.0.0/0
HTTPS       TCP         443          0.0.0.0/0
Custom TCP  TCP         3000         0.0.0.0/0 (for testing)
```

## Step 2: Connect to Your EC2 Instance

```bash
# Replace with your key and instance details
ssh -i your-key.pem ubuntu@your-ec2-public-ip
```

## Step 3: Run the Automated Deployment

```bash
# Download and run the deployment script
curl -O https://raw.githubusercontent.com/sha-intelligence-admin/core-comm/main/twilio/deploy-aws.sh
chmod +x deploy-aws.sh
./deploy-aws.sh
```

## Step 4: Configure Environment Variables

```bash
cd core-comm/twilio
cp .env.production.example .env.production
nano .env.production
```

Fill in your credentials:
```env
# Existing Twilio Configuration
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890

# Speech Services
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# NEW: AI Reasoning Service
OPENAI_API_KEY=sk-your_openai_api_key_here

# NEW: Premium TTS Service  
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
USE_ELEVENLABS_TTS=false  # Set to 'true' after audio hosting setup

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server
PUBLIC_DOMAIN=https://your-domain.com
NODE_ENV=production
PORT=3000

# NEW: Optional - Audio hosting for ElevenLabs (Advanced Setup)
# AWS_ACCESS_KEY_ID=your_aws_access_key
# AWS_SECRET_ACCESS_KEY=your_aws_secret_key
# AWS_REGION=us-east-1
# S3_BUCKET_NAME=your-audio-bucket-name
```

### 🔑 API Keys Setup Guide

#### OpenAI API Key:
1. Go to [OpenAI Platform](https://platform.openai.com)
2. Navigate to API Keys
3. Create new key with GPT-4 access
4. Add billing method (required for GPT-4)
5. Set usage limits if desired

#### ElevenLabs API Key:
1. Sign up at [ElevenLabs](https://elevenlabs.io)
2. Go to Profile → API Keys
3. Generate new API key
4. Choose appropriate plan (Starter: 10k characters/month)

## Step 5: Set Up Domain and SSL

### A) Point your domain to EC2:
1. Go to your domain registrar
2. Create an A record: `your-domain.com` → `your-ec2-public-ip`
3. Create CNAME record: `www.your-domain.com` → `your-domain.com`

### B) Install SSL certificate:
```bash
# Install certbot (already done in deploy script)
sudo certbot --nginx -d your-domain.com -d www.your-domain.com

# Update nginx configuration
sudo cp nginx.conf /etc/nginx/sites-available/twilio-app
sudo ln -s /etc/nginx/sites-available/twilio-app /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

## Step 6: Start Your Application

```bash
cd core-comm/twilio

# Build and start with Docker Compose
docker-compose -f docker-compose.prod.yml up -d --build

# Check if it's running
docker-compose -f docker-compose.prod.yml ps
curl https://your-domain.com/api/health
```

## Step 7: Configure Twilio Webhook

1. Go to [Twilio Console](https://console.twilio.com/)
2. Navigate to Phone Numbers → Manage → Active numbers
3. Click on your Twilio phone number
4. Set Webhook URL to: `https://your-domain.com/api/calls/voice`
5. Set HTTP method to: `POST`
6. Save configuration

## Step 8: Test Your Deployment

### 8A: Basic System Tests

#### Test the health endpoint:
```bash
curl https://your-domain.com/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

#### Test WebSocket connection:
```bash
# Check if WebSocket endpoint responds
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" \
     https://your-domain.com/api/calls/media-stream/test/test
```

#### Verify API Keys:
```bash
# Check application logs for API key validation
docker-compose -f docker-compose.prod.yml logs twilio-app | grep "Environment validation"
# Should see: "Environment validation successful"
```

### 8B: RAG System Tests

#### Test Legacy Knowledge Base (Fast Response):
1. Call your Twilio phone number
2. Say: **"What is your business model?"**
3. Expected: Fast response (< 1 second) from cached knowledge
4. Check logs for: `"Using legacy KB response"`

#### Test OpenAI Integration (Intelligent Response):
1. Call your Twilio phone number  
2. Say: **"How does your AI ensure safety in healthcare applications?"**
3. Expected: Thoughtful response (2-4 seconds) from GPT-4
4. Check logs for: `"Using OpenAI for response generation"`

#### Test Conversation Context:
1. Ask: **"What is Sha Intelligence?"**
2. Follow up: **"Tell me more about that"** 
3. Expected: Context-aware response referencing previous answer
4. Check logs for conversation history tracking

#### Test Fallback Behavior:
1. Temporarily remove OpenAI key: `OPENAI_API_KEY=invalid`
2. Restart: `docker-compose -f docker-compose.prod.yml restart`
3. Ask complex question
4. Expected: Graceful fallback with helpful response
5. Restore key when done

### 8C: TTS System Tests

#### Test Twilio TTS (Default):
1. Make test call with any question
2. Expected: Standard Twilio "Alice" voice response
3. Check logs for: `"TTS sent successfully"`

#### Test ElevenLabs TTS (Optional):
1. Set: `USE_ELEVENLABS_TTS=true` in .env.production
2. Restart application
3. Make test call
4. Expected: Log showing `"ElevenLabs audio generated"` then fallback
5. Note: Full integration requires audio hosting setup

### 8D: Performance Tests

#### Response Time Benchmarks:
- **Known topics**: < 1 second (legacy KB)
- **Complex topics**: 2-4 seconds (OpenAI processing)
- **WebSocket setup**: < 1 second
- **Call connection**: 2-3 seconds

#### Load Testing:
```bash
# Monitor resources during multiple concurrent calls
docker stats
htop

# Check for memory leaks with conversation history
# Make 10+ calls with multiple exchanges each
```

## Step 9: Monitor Your RAG Deployment

### 9A: Application Monitoring

#### View RAG system logs:
```bash
cd core-comm/twilio
# All application logs
docker-compose -f docker-compose.prod.yml logs -f twilio-app

# Filter for AI-specific logs
docker-compose -f docker-compose.prod.yml logs twilio-app | grep -E "(OpenAI|ElevenLabs|legacy KB)"

# Monitor conversation tracking
docker-compose -f docker-compose.prod.yml logs twilio-app | grep "conversation history"
```

#### Key Log Patterns to Monitor:
```bash
# Successful OpenAI requests
"Using OpenAI for response generation" 
"OpenAI response generated"

# Legacy KB hits (fast responses)
"Using legacy KB response"

# TTS operations
"TTS sent successfully"
"ElevenLabs speech generated successfully" 

# Error patterns
"Error generating OpenAI response"
"ElevenLabs TTS failed, falling back"
"Error in advanced response generation"
```

### 9B: Resource Monitoring

#### Monitor AI processing resources:
```bash
# System resources
htop

# Container resources
docker stats

# Memory usage (important for conversation history)
free -h

# Disk space (logs and caching)
df -h
```

#### API Usage Monitoring:
```bash
# Extract API usage from logs
grep "tokensUsed" /var/log/docker/twilio-app.log | tail -20
grep "audioSize" /var/log/docker/twilio-app.log | tail -20
```

### 9C: Performance Metrics

#### Response Time Analysis:
```bash
# Create performance monitoring script
cat > monitor_performance.sh << 'EOF'
#!/bin/bash
echo "=== RAG System Performance Monitor ==="
echo "Monitoring application logs for response times..."

docker-compose -f docker-compose.prod.yml logs --since 1h twilio-app | \
grep -E "(legacy KB|OpenAI|response generation)" | \
while read line; do
    echo "$line" | grep -o '[0-9]*ms\|[0-9]*\.[0-9]*s'
done | sort -n
EOF

chmod +x monitor_performance.sh
./monitor_performance.sh
```

### 9D: Cost Monitoring

#### Track API costs:
```bash
# Monitor OpenAI token usage
grep "tokensUsed" logs/app.log | \
awk '{sum+=$NF} END {print "Total tokens used:", sum}'

# Monitor ElevenLabs character usage  
grep "textLength" logs/app.log | \
awk '{sum+=$NF} END {print "Total characters processed:", sum}'
```

### 9E: Health Checks

#### Automated health monitoring:
```bash
# Create health check script
cat > health_check.sh << 'EOF'
#!/bin/bash
echo "=== RAG System Health Check ==="

# Test basic health
health=$(curl -s https://your-domain.com/api/health)
echo "Health endpoint: $health"

# Test API keys validation
validation=$(docker-compose -f docker-compose.prod.yml logs --since 5m twilio-app | grep "Environment validation")
echo "Environment validation: $validation"

# Check container status
echo "Container status:"
docker-compose -f docker-compose.prod.yml ps

# Check system resources
echo "Memory usage:"
free -h | head -2

echo "Disk usage:"
df -h / | tail -1
EOF

chmod +x health_check.sh
./health_check.sh
```

### 9F: Nginx and SSL Monitoring

#### Check Nginx logs:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Monitor WebSocket connections
sudo grep "websocket" /var/log/nginx/access.log | tail -10
```

## Step 10: Production Optimizations

### Auto-restart on reboot:
```bash
# Add to crontab
@reboot cd /home/ubuntu/core-comm/twilio && docker-compose -f docker-compose.prod.yml up -d
```

### Log rotation:
```bash
# Logs are automatically rotated via Docker logging config
# Max 10MB per file, keep 3 files
```

### Performance monitoring:
- Set up CloudWatch for EC2 monitoring
- Use application logs for debugging call issues
- Monitor Deepgram API usage

## Troubleshooting RAG System

### Common Issues:

1. **OpenAI Integration Issues:**
   ```bash
   # Symptoms: "Error generating OpenAI response" in logs
   # Check API key validity
   curl -H "Authorization: Bearer $OPENAI_API_KEY" \
        https://api.openai.com/v1/models

   # Check billing and usage limits
   # Visit: https://platform.openai.com/usage

   # Verify environment variable
   docker-compose -f docker-compose.prod.yml exec twilio-app env | grep OPENAI
   ```

2. **ElevenLabs TTS Issues:**
   ```bash
   # Symptoms: "ElevenLabs TTS failed" in logs
   # Test API key
   curl -H "xi-api-key: $ELEVENLABS_API_KEY" \
        https://api.elevenlabs.io/v1/voices

   # Check character usage limits
   # Visit: https://elevenlabs.io/usage

   # Disable temporarily if needed
   echo "USE_ELEVENLABS_TTS=false" >> .env.production
   ```

3. **Slow or No AI Responses:**
   ```bash
   # Check which service is being used
   docker-compose -f docker-compose.prod.yml logs twilio-app | \
   grep -E "(legacy KB|OpenAI|fallback)"

   # Monitor response times
   docker-compose -f docker-compose.prod.yml logs twilio-app | \
   grep "response generation" | tail -10

   # Check system resources (AI processing is CPU/memory intensive)
   htop
   docker stats
   ```

4. **Memory Issues with Conversation History:**
   ```bash
   # Symptoms: High memory usage, slow responses
   # Check conversation history size in logs
   grep "historyLength" logs/app.log | tail -20

   # Restart to clear memory if needed
   docker-compose -f docker-compose.prod.yml restart twilio-app
   ```

5. **WebSocket connection fails:**
   - Check SSL certificate is valid
   - Verify Nginx WebSocket proxy configuration
   - Ensure port 443 is open in security group

6. **Calls don't connect:**
   - Verify Twilio webhook URL is correct
   - Check application logs for errors
   - Test health endpoint

7. **Legacy Knowledge Base Issues:**
   ```bash
   # If simple questions aren't getting fast responses
   # Check node-nlp model training
   docker-compose -f docker-compose.prod.yml logs twilio-app | grep "nlp"

   # Test specific knowledge base queries
   grep "legacy KB" logs/app.log | tail -10
   ```

### View logs:
```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs twilio-app

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

## Expected Performance & Costs

### 🚀 Performance Expectations

#### Response Times (RAG System):
✅ **Legacy KB queries** (known topics): < 1 second  
✅ **OpenAI queries** (complex topics): 2-4 seconds  
✅ **Fallback responses**: < 1 second  
✅ **WebSocket connection**: < 1 second  
✅ **Call setup**: 2-3 seconds  

#### System Resources (t3.large minimum):
✅ **CPU utilization**: 30-60% during active calls  
✅ **Memory usage**: 4-6GB with conversation history  
✅ **Concurrent calls**: 5-10 simultaneous calls  

### 💰 Cost Breakdown

#### AWS Infrastructure:
- **t3.large EC2**: ~$67/month (24/7 uptime)
- **30GB EBS storage**: ~$2.40/month  
- **Data transfer**: ~$9/100GB outbound
- **Total AWS**: ~$70-80/month base cost

#### AI Services (per call estimates):
- **OpenAI GPT-4**: $0.01-0.05 per call (150 token responses)
- **ElevenLabs TTS**: $0.02-0.08 per call (100-400 characters)
- **Deepgram STT**: $0.004-0.012 per call (1-3 minutes)
- **Twilio voice**: $0.013/minute + $0.0075/message

#### Cost Control Features:
✅ **Smart routing**: Legacy KB used for 60-70% of common queries (free)  
✅ **Token limits**: Max 150 tokens per OpenAI response  
✅ **Conversation cleanup**: Automatic history management  
✅ **Fallback systems**: Prevent failed API calls from costing money  
✅ **Environment toggles**: Disable premium services if needed

#### Monthly Cost Estimates:
- **100 calls/month**: $80 infrastructure + $15 AI services = **~$95/month**
- **500 calls/month**: $80 infrastructure + $75 AI services = **~$155/month**  
- **1000 calls/month**: $85 infrastructure + $150 AI services = **~$235/month**

### 🔧 Advanced Setup: ElevenLabs Audio Hosting

To enable full ElevenLabs TTS, you'll need audio hosting:

#### Option 1: AWS S3 Audio Hosting
```bash
# Create S3 bucket for audio files
aws s3 mb s3://your-audio-bucket-name

# Update environment variables
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-east-1
S3_BUCKET_NAME=your-audio-bucket-name

# Set bucket policy for public read access
cat > bucket-policy.json << 'EOF'
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "PublicReadGetObject",
      "Effect": "Allow",
      "Principal": "*",
      "Action": "s3:GetObject",
      "Resource": "arn:aws:s3:::your-audio-bucket-name/*"
    }
  ]
}
EOF

aws s3api put-bucket-policy --bucket your-audio-bucket-name --policy file://bucket-policy.json
```

#### Option 2: Cloudinary Audio Hosting
```bash
# Sign up at cloudinary.com
# Add to environment variables
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

### 📊 Monitoring Dashboard Setup

#### CloudWatch Metrics:
1. Go to AWS CloudWatch Console
2. Create custom dashboard
3. Add metrics:
   - EC2 CPU Utilization
   - EC2 Memory Utilization  
   - EBS Volume Read/Write
   - Application-specific metrics

#### Log Analysis:
```bash
# Set up log aggregation
docker-compose -f docker-compose.prod.yml logs twilio-app | \
aws logs create-log-group --log-group-name twilio-rag-app
```

### 🚀 Scale-Up Recommendations

#### For Higher Traffic (1000+ calls/month):
1. **Upgrade instance**: t3.large → c5.xlarge (better CPU for AI processing)
2. **Load balancing**: Application Load Balancer + multiple instances
3. **Database optimization**: Connection pooling for Supabase
4. **Caching**: Redis for frequent OpenAI responses
5. **CDN**: CloudFront for audio file delivery

#### Production-Ready Enhancements:
1. **Auto-scaling**: Based on call volume
2. **Health checks**: Automated failover
3. **Backup strategy**: Database and configuration backups
4. **Security hardening**: VPC, security groups, WAF
5. **Monitoring alerts**: PagerDuty/Slack integration

---

## ✅ Deployment Complete!

Your advanced RAG-powered Twilio voice application is now running on AWS with:

- 🧠 **Intelligent AI responses** via OpenAI GPT-4
- 🗣️ **Premium TTS capability** via ElevenLabs  
- ⚡ **Optimized performance** with hybrid response system
- 🛡️ **Robust fallbacks** ensuring 99%+ uptime
- 📊 **Comprehensive monitoring** for production operations
- 💰 **Cost-optimized architecture** with smart service selection

The system intelligently balances speed, quality, and cost while providing an exceptional voice AI experience.
