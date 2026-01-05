# Deployment Checklists

This document consolidates all checklists required for deploying CoreComm to production.

---

## 1. Pre-Deployment Setup

### Environment Configuration
- [ ] **Create Production Environment File**: Copy `.env.production.example` to `.env.production`.
- [ ] **Configure Twilio**:
  - [ ] `TWILIO_ACCOUNT_SID`
  - [ ] `TWILIO_AUTH_TOKEN`
  - [ ] `TWILIO_PHONE_NUMBER`
- [ ] **Configure AI Services**:
  - [ ] `OPENAI_API_KEY` (GPT-4 access required)
  - [ ] `ELEVENLABS_API_KEY`
  - [ ] `DEEPGRAM_API_KEY`
- [ ] **Configure Database**:
  - [ ] `SUPABASE_URL`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
- [ ] **Server Configuration**:
  - [ ] `PUBLIC_DOMAIN` (e.g., https://api.corecomm.com)

### API Key Validation
- [ ] **OpenAI**: Verify GPT-4 access.
  ```bash
  curl -H "Authorization: Bearer $OPENAI_API_KEY" https://api.openai.com/v1/models
  ```
- [ ] **ElevenLabs**: Verify voice access.
- [ ] **Deepgram**: Verify STT access.

### Local Testing
- [ ] Run `npm install` to ensure dependencies are fresh.
- [ ] Run `./test-deployment.sh` (if available) to verify system locally.
- [ ] Test fallback mechanisms (e.g., disconnect internet and check error handling).

---

## 2. Security Hardening

### Critical Blockers
- [ ] **Rotate Credentials**: Ensure no dev keys are used in production.
- [ ] **Rate Limiting**: Configure Redis for rate limiting.
- [ ] **SSL/TLS**: Ensure valid certificates are installed (handled by Nginx/LetsEncrypt).

### Database Security
- [ ] **RLS Policies**: Verify Row Level Security is enabled on all tables.
- [ ] **Backups**: Enable Point-in-Time Recovery (PITR) in Supabase.
- [ ] **Connection Pooling**: Use Supabase Transaction Pool (port 6543) for serverless functions.

### Application Security
- [ ] **Security Headers**: Verify HSTS, CSP, and X-Frame-Options are set.
- [ ] **CORS**: Restrict `Access-Control-Allow-Origin` to your frontend domain.
- [ ] **Audit Logging**: Ensure critical actions are writing to `audit_logs`.

---

## 3. Production Readiness Verification

### Service Implementations
- [ ] **OpenAI**: Conversation history tracking is working.
- [ ] **ElevenLabs**: Streaming TTS is low latency (<1s).
- [ ] **Vapi**: Webhooks are being received and verified.

### Resilience
- [ ] **Error Handling**: System degrades gracefully if an AI provider is down.
- [ ] **Timeouts**: API requests timeout after 30s (or appropriate limit).
- [ ] **Reconnects**: WebSockets reconnect automatically on disconnect.

### Monitoring
- [ ] **Health Check**: `/api/health` returns 200 OK.
- [ ] **Logging**: Logs are being aggregated (Sentry/Datadog/Supabase).
- [ ] **Alerts**: Alerts set up for high error rates or downtime.

---

## 4. Post-Deployment Verification

- [ ] **Smoke Test**: Make a real phone call to the system.
- [ ] **Latency Check**: Verify voice latency is acceptable.
- [ ] **Data Check**: Verify call logs are appearing in Supabase.
- [ ] **Billing Check**: Verify usage is being tracked.
