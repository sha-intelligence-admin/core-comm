# 🚀 Advanced RAG System Deployment Checklist

## Pre-Deployment (Complete these first)

### 1. Environment Setup ✏️
- [ ] Copy `.env.production.example` to `.env.production` and fill in credentials:
  - [ ] **Twilio Configuration**:
    - [ ] `TWILIO_ACCOUNT_SID` - From Twilio Console
    - [ ] `TWILIO_AUTH_TOKEN` - From Twilio Console  
    - [ ] `TWILIO_PHONE_NUMBER` - Your Twilio phone number
  - [ ] **AI Services** (NEW):
    - [ ] `OPENAI_API_KEY` - From OpenAI Platform (GPT-4 access required)
    - [ ] `ELEVENLABS_API_KEY` - From ElevenLabs Dashboard
    - [ ] `DEEPGRAM_API_KEY` - From Deepgram Dashboard
  - [ ] **Database**:
    - [ ] `SUPABASE_URL` - From Supabase Dashboard
    - [ ] `SUPABASE_SERVICE_ROLE_KEY` - From Supabase API settings
  - [ ] **Server Configuration**:
    - [ ] `PUBLIC_DOMAIN` - Your domain (https://yourdomain.com)
    - [ ] `USE_ELEVENLABS_TTS=false` (enable after audio hosting setup)

### 2. API Key Validation 🔑
- [ ] **OpenAI Setup**:
  - [ ] Account created with billing method
  - [ ] GPT-4 API access confirmed
  - [ ] Usage limits configured (optional)
  - [ ] Test API key: `curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models`
- [ ] **ElevenLabs Setup**:
  - [ ] Account created with appropriate plan (Starter: 10k chars/month)
  - [ ] Test API key: `curl -H "xi-api-key: $ELEVENLABS_API_KEY" https://api.elevenlabs.io/v1/voices`
- [ ] **Deepgram Setup**:
  - [ ] API key active and tested

### 3. Local Testing 🧪
- [ ] Run `npm install` to install new dependencies (OpenAI, ElevenLabs)
- [ ] Run `./test-deployment.sh` to verify RAG system works locally
- [ ] Test both legacy KB and OpenAI responses:
  - [ ] "What is your business model?" (should use legacy KB < 1 sec)
  - [ ] "How do you ensure AI safety in healthcare?" (should use OpenAI 2-4 sec)
- [ ] Fix any issues found in local testing
- [ ] Commit all deployment files to git

### 4. AWS Preparation 🌩️
- [ ] AWS Account with EC2 access
- [ ] Domain name registered (required for HTTPS/WebSockets)
- [ ] SSH key pair for EC2 access

## AWS Deployment Steps

### 5. Launch EC2 Instance 🖥️
- [ ] **Instance Type**: `t3.large` minimum (RAG system requires more resources)
- [ ] **OS**: `Ubuntu 22.04 LTS`
- [ ] **Storage**: `30GB` minimum (increased for AI model caching)
- [ ] **Security Group**: Allow ports `22, 80, 443, 3000`
- [ ] **Memory**: 8GB+ RAM (required for concurrent AI processing)
- [ ] Assign Elastic IP (recommended for production)

### 6. Domain Configuration 🌐
- [ ] Point A record: `yourdomain.com` → EC2 Public IP
- [ ] Point CNAME: `www.yourdomain.com` → `yourdomain.com`
- [ ] Wait for DNS propagation (5-30 minutes)

### 7. Server Setup 🔧
- [ ] SSH into your EC2 instance
- [ ] Run the deployment script: `./deploy-aws.sh`
- [ ] Configure environment variables in `.env.production`
- [ ] **Verify Environment Variables**:
  ```bash
  grep -E "(OPENAI|ELEVENLABS)" .env.production
  ```
- [ ] Start the application with Docker Compose

### 8. SSL Certificate 🔒
- [ ] Install SSL certificate with Let's Encrypt
- [ ] Configure Nginx reverse proxy
- [ ] Test HTTPS access: `https://yourdomain.com/api/health`
- [ ] Verify WebSocket over SSL works

### 9. Twilio Configuration 📞
- [ ] Update webhook URL in Twilio Console to: `https://yourdomain.com/api/calls/voice`
- [ ] Set HTTP method to `POST`
- [ ] Test webhook connectivity

## Post-Deployment Testing (RAG System)

### 10. System Health Validation ✅
- [ ] **Basic Health**: `curl https://yourdomain.com/api/health`
- [ ] **Detailed Health**: `curl https://yourdomain.com/api/health/detailed`
- [ ] **Environment Validation**: Check logs for "Environment validation successful"
- [ ] **API Key Validation**: Verify all required keys are present

### 11. RAG System Testing 🧠
- [ ] **Legacy Knowledge Base Test**:
  - [ ] Call Twilio number
  - [ ] Ask: "What is your business model?"
  - [ ] Expected: Fast response (< 1 second)
  - [ ] Check logs for: "Using legacy KB response"
- [ ] **OpenAI Integration Test**:
  - [ ] Ask: "How does your AI ensure safety in healthcare applications?"
  - [ ] Expected: Intelligent response (2-4 seconds)
  - [ ] Check logs for: "Using OpenAI for response generation"
- [ ] **Conversation Context Test**:
  - [ ] Ask: "What is Sha Intelligence?"
  - [ ] Follow up: "Tell me more about that"
  - [ ] Expected: Context-aware response referencing previous answer
  - [ ] Check logs for conversation history tracking
- [ ] **Fallback System Test**:
  - [ ] Temporarily set `OPENAI_API_KEY=invalid`
  - [ ] Restart application
  - [ ] Ask complex question
  - [ ] Expected: Graceful fallback response
  - [ ] Restore correct API key

### 12. TTS System Testing 🗣️
- [ ] **Twilio TTS (Default)**:
  - [ ] Make test call
  - [ ] Expected: Standard "Alice" voice
  - [ ] Check logs for: "TTS sent successfully"
- [ ] **ElevenLabs TTS (Optional)**:
  - [ ] Set: `USE_ELEVENLABS_TTS=true`
  - [ ] Restart application
  - [ ] Make test call  
  - [ ] Expected: Log shows "ElevenLabs audio generated" then fallback
  - [ ] Note: Full integration requires audio hosting setup

### 13. Performance Validation 📊
- [ ] **Response Time Benchmarks**:
  - [ ] Legacy KB queries: < 1 second
  - [ ] OpenAI queries: 2-4 seconds
  - [ ] Fallback responses: < 1 second
  - [ ] WebSocket setup: < 1 second
- [ ] **Resource Monitoring**:
  - [ ] CPU usage: 30-60% during calls
  - [ ] Memory usage: 4-6GB with conversation history
  - [ ] No memory leaks after multiple calls
- [ ] **Concurrent Call Testing**:
  - [ ] Test 3-5 simultaneous calls
  - [ ] Verify all calls handled properly
  - [ ] Monitor system resources

### 14. Monitoring Setup 📊
- [ ] **Application Monitoring**:
  ```bash
  # Monitor AI service usage
  docker-compose logs app | grep -E "(OpenAI|ElevenLabs|legacy KB)"
  
  # Track conversation history
  docker-compose logs app | grep "conversation history"
  
  # Monitor errors
  docker-compose logs app | grep "Error"
  ```
- [ ] **System Monitoring**:
  ```bash
  # Resource usage
  htop
  docker stats
  
  # Disk space
  df -h
  ```
- [ ] **Cost Monitoring**:
  - [ ] Track OpenAI token usage in logs
  - [ ] Monitor ElevenLabs character usage
  - [ ] Set up usage alerts if desired
- [ ] Set up automatic restarts on reboot
- [ ] Configure log rotation

## Advanced Configuration (Optional)

### 15. ElevenLabs Audio Hosting Setup 🎵
- [ ] **AWS S3 Setup**:
  - [ ] Create S3 bucket for audio files
  - [ ] Configure bucket policy for public access
  - [ ] Add AWS credentials to environment
- [ ] **Update TwilioService**:
  - [ ] Implement audio upload functionality
  - [ ] Update TTS methods to use hosted audio
- [ ] **Enable ElevenLabs**:
  - [ ] Set `USE_ELEVENLABS_TTS=true`
  - [ ] Test full ElevenLabs integration

### 16. Performance Optimization 🚀
- [ ] **Conversation History Tuning**:
  - [ ] Monitor memory usage with history
  - [ ] Adjust history limit if needed
- [ ] **API Response Optimization**:
  - [ ] Monitor OpenAI response times
  - [ ] Adjust confidence thresholds if needed
- [ ] **Caching Setup** (for high traffic):
  - [ ] Implement Redis for frequent responses
  - [ ] Cache OpenAI responses for common queries

## Troubleshooting

### Common RAG System Issues:
- **OpenAI Errors**: Check API key, billing, and usage limits
- **ElevenLabs Failures**: Verify API key and character limits  
- **Slow Responses**: Monitor AI service latency and system resources
- **Memory Issues**: Check conversation history size and cleanup
- **Context Loss**: Verify conversation history tracking in logs
- **High Costs**: Monitor token/character usage, adjust thresholds

### Diagnostic Commands:
```bash
# Check environment variables
docker-compose exec app env | grep -E "(OPENAI|ELEVENLABS)"

# Monitor real-time performance
docker-compose logs -f app | grep -E "(response generation|tokensUsed|audioSize)"

# Check service health
curl https://yourdomain.com/api/health/detailed

# Test individual AI services
# (OpenAI test)
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# (ElevenLabs test)  
curl -H "xi-api-key: $ELEVENLABS_API_KEY" https://api.elevenlabs.io/v1/voices
```

---

## 🎯 Success Criteria

Your RAG deployment is successful when:

1. ✅ **System Health**: All health endpoints return 200 OK
2. ✅ **AI Integration**: Both legacy KB and OpenAI responses work
3. ✅ **Performance**: Response times meet benchmarks (< 1s legacy, 2-4s OpenAI)
4. ✅ **Conversation Flow**: Context maintained across multiple exchanges  
5. ✅ **Error Handling**: Graceful fallbacks for all failure scenarios
6. ✅ **Resource Usage**: System runs efficiently within expected limits
7. ✅ **Monitoring**: Comprehensive logging and metrics collection working

## 🚀 Expected Performance (RAG System)

- ✅ **Legacy KB responses**: < 1 second (60-70% of queries)
- ✅ **OpenAI responses**: 2-4 seconds (complex queries)
- ✅ **Context-aware follow-ups**: 2-4 seconds with conversation history
- ✅ **Fallback responses**: < 1 second (error scenarios)
- ✅ **Memory management**: Automatic conversation cleanup
- ✅ **Cost optimization**: Smart routing minimizes AI API usage

**Ready to deploy your advanced RAG system? Start with Step 1! 🚀**