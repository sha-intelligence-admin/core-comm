# ⚡ Quick Start Guide - Advanced RAG Voice AI System

Get your intelligent voice assistant running in **under 30 minutes**!

## 🎯 What You're Building

A voice AI that can:
- **Answer company questions instantly** (< 1 second using knowledge base)
- **Handle complex queries intelligently** (2-4 seconds using GPT-4)
- **Remember conversation context** (maintains dialogue history)
- **Gracefully handle errors** (multiple fallback layers)

---

## 🛠️ Prerequisites (5 minutes)

### Required Accounts & API Keys:
1. **Twilio Account** → [console.twilio.com](https://console.twilio.com)
   - Phone number purchased
   - Account SID & Auth Token ready

2. **OpenAI Account** → [platform.openai.com](https://platform.openai.com)
   - GPT-4 API access (requires billing setup)
   - API key generated

3. **ElevenLabs Account** → [elevenlabs.io](https://elevenlabs.io)
   - API key generated
   - Starter plan (10k characters/month) sufficient

4. **Deepgram Account** → [console.deepgram.com](https://console.deepgram.com)
   - API key generated

5. **Supabase Account** → [app.supabase.com](https://app.supabase.com)
   - Database created
   - API URL & Service Role Key ready

---

## 🚀 Fast Setup (Development - 15 minutes)

### 1. Clone & Install (2 minutes)
```bash
git clone <your-repo-url>
cd twilio
npm install
```

### 2. Configure Environment (5 minutes)
```bash
cp .env.example .env
```

Edit `.env` with your API keys:
```bash
# Twilio
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here

# AI Services  
OPENAI_API_KEY=sk-your_openai_api_key_here
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
DEEPGRAM_API_KEY=your_deepgram_api_key_here

# Database
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# Server
PORT=3000
NODE_ENV=development
USE_ELEVENLABS_TTS=false  # Keep false for now
```

### 3. Test System (3 minutes)
```bash
# Test configuration
npm run dev

# Should see:
# ✅ Environment validation successful  
# ✅ Server running on port 3000
# ✅ OpenAI service initialized
# ✅ ElevenLabs service initialized
```

### 4. Expose & Configure Webhook (5 minutes)
```bash
# In another terminal
npx ngrok http 3000
# Copy the HTTPS URL (e.g., https://abc123.ngrok.io)
```

**Configure Twilio Webhook:**
1. Go to [Twilio Console](https://console.twilio.com) → Phone Numbers
2. Click your phone number
3. Set Webhook URL: `https://abc123.ngrok.io/api/calls/voice`
4. HTTP Method: `POST`
5. Save configuration

### 5. Test Voice AI! (1 minute)
Call your Twilio number and try:

**Legacy Knowledge Base (Fast):**
- "What is your business model?"
- "What is your revenue?"
- "Who is on your team?"

**OpenAI Intelligence (Smart):**
- "How do you ensure AI safety in healthcare?"
- "What are the biggest challenges in AI development?"
- Ask follow-up questions to test context memory!

---

## 🌐 Production Setup (AWS - 30 minutes)

### 1. Launch AWS EC2 (5 minutes)
- **Instance**: t3.large minimum (8GB RAM required)
- **OS**: Ubuntu 22.04 LTS
- **Storage**: 30GB SSD
- **Security**: Allow ports 22, 80, 443
- **Domain**: Point your domain to instance IP

### 2. Deploy to AWS (10 minutes)
```bash
# SSH to your instance
ssh -i your-key.pem ubuntu@your-server-ip

# Run deployment script
curl -O https://raw.githubusercontent.com/your-repo/deploy-aws.sh
chmod +x deploy-aws.sh
./deploy-aws.sh

# Follow prompts to configure .env.production
```

### 3. Configure SSL & Domain (10 minutes)
```bash
# Install SSL certificate
sudo certbot --nginx -d yourdomain.com

# Test HTTPS
curl https://yourdomain.com/api/health
# Should return: {"status":"ok"}
```

### 4. Update Twilio & Test (5 minutes)
- Update webhook: `https://yourdomain.com/api/calls/voice`
- Call and test the same queries as development

---

## 🧪 Testing Your RAG System

### Response Types & Expected Performance:

#### 🏃‍♂️ **Fast Responses (< 1 second)**
Knowledge base handles these instantly:
```
"What is your business model?"
"What is your revenue?"  
"What is your pricing?"
"Who is on your team?"
"How can I contact you?"
```

#### 🧠 **Intelligent Responses (2-4 seconds)**
OpenAI handles complex reasoning:
```
"How do you ensure AI safety in healthcare applications?"
"What are the ethical implications of your AI approach?"
"How does your solution compare to competitors?"
"What industries would benefit most from your technology?"
```

#### 💬 **Context-Aware Responses**
Test conversation memory:
```
You: "What is Sha Intelligence?"
AI: [Explains company]
You: "Tell me more about that"
AI: [References previous answer with more detail]
You: "What challenges do you face?"
AI: [Responds in context of previous conversation]
```

---

## 🔍 Monitoring Your System

### Health Checks:
```bash
# Development
curl http://localhost:3000/api/health
curl http://localhost:3000/api/health/detailed

# Production  
curl https://yourdomain.com/api/health
curl https://yourdomain.com/api/health/detailed
```

### Real-Time Monitoring:
```bash
# Monitor AI service usage
docker-compose logs -f app | grep -E "(OpenAI|ElevenLabs|legacy KB)"

# Track conversations
docker-compose logs -f app | grep "conversation history"

# Watch for errors
docker-compose logs -f app | grep "Error"
```

### Performance Metrics:
- **Legacy KB**: < 1 second (60-70% of queries)
- **OpenAI**: 2-4 seconds (complex queries)
- **Memory usage**: 4-6GB with conversation history
- **CPU usage**: 30-60% during active calls

---

## ⚡ Performance Optimization Tips

### 1. **Cost Optimization**
```bash
# In src/config/config.js - adjust thresholds
CONFIDENCE_THRESHOLD: 0.7,        # Higher = more legacy KB usage
NLP_CONFIDENCE_THRESHOLD: 0.6,    # Lower = more OpenAI fallback
```

### 2. **Response Speed**
- Legacy KB handles 60-70% of queries instantly
- OpenAI processes only complex/unknown queries
- Conversation history auto-cleans (20 message limit)

### 3. **Voice Quality**
```bash
# Enable premium TTS (requires audio hosting)
USE_ELEVENLABS_TTS=true

# Customize voice in src/services/ElevenLabsService.js
this.defaultVoiceId = 'EXAVITQu4vr4xnSDxMaL'; // Bella (female)
```

---

## 🔧 Common Issues & Solutions

### API Key Issues:
```bash
# Test OpenAI
curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models

# Test ElevenLabs  
curl -H "xi-api-key: $ELEVENLABS_API_KEY" https://api.elevenlabs.io/v1/voices
```

### Slow Responses:
- Check internet connection
- Monitor API service status  
- Verify system resources (RAM/CPU)

### WebSocket Errors:
- Ensure HTTPS/SSL configured
- Check domain DNS propagation
- Verify Twilio webhook URL

### Memory Issues:
```bash
# Check conversation history size
docker-compose logs app | grep "historyLength"

# Restart if needed
docker-compose restart app
```

---

## 💡 Customization Examples

### Add New Knowledge:
```javascript
// In src/nlp/secure-kb.js
secureKB.addKnowledge(
  'pricing.enterprise',
  ['enterprise pricing', 'bulk discount', 'volume pricing'],
  'Enterprise pricing starts at $X per month with volume discounts available.'
);
```

### Modify System Prompt:
```javascript
// In src/services/OpenAIService.js
this.systemPrompt = `You are an AI assistant for [Your Company]...
- Keep responses under 100 words for phone calls
- Be helpful and professional
- For pricing, say "Contact sales@company.com"`;
```

### Change Voice Settings:
```javascript
// In src/services/ElevenLabsService.js
this.voiceSettings = {
  stability: 0.8,      // More stable = less expressive
  similarity_boost: 0.7,
  style: 0.3,          // Lower = more neutral
};
```

---

## 🎉 You're Done!

Your Advanced RAG Voice AI System is now running with:

✅ **Sub-second responses** for common questions  
✅ **GPT-4 intelligence** for complex queries  
✅ **Conversation memory** for natural dialogue  
✅ **Production-grade reliability** with fallbacks  
✅ **Cost optimization** through smart routing  
✅ **Premium TTS capability** (when configured)  

### Next Steps:
- 📊 Monitor usage and costs
- 🔧 Customize knowledge base for your domain
- 🎤 Enable ElevenLabs for premium voice quality
- 📈 Scale up infrastructure as usage grows

**Need help?** Check the comprehensive guides:
- `README.md` - Complete system overview
- `AWS_DEPLOYMENT_GUIDE.md` - Production deployment
- `RAG_UPGRADE_GUIDE.md` - Architecture deep-dive

**Happy building! 🚀**