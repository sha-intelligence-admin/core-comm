# 🚀 AWS Deployment Checklist

## Pre-Deployment (Complete these first)

### 1. Environment Setup ✏️
- [ ] Copy `.env.production` and fill in your credentials:
  - [ ] `TWILIO_ACCOUNT_SID` - From Twilio Console
  - [ ] `TWILIO_AUTH_TOKEN` - From Twilio Console  
  - [ ] `TWILIO_PHONE_NUMBER` - Your Twilio phone number
  - [ ] `DEEPGRAM_API_KEY` - From Deepgram Dashboard
  - [ ] `SUPABASE_URL` - From Supabase Dashboard
  - [ ] `SUPABASE_SERVICE_ROLE_KEY` - From Supabase API settings
  - [ ] `PUBLIC_DOMAIN` - Your domain (e.g., https://yourdomain.com)

### 2. Local Testing 🧪
- [ ] Run `./test-deployment.sh` to verify everything works locally
- [ ] Fix any issues found in local testing
- [ ] Commit all deployment files to git

### 3. AWS Preparation 🌩️
- [ ] AWS Account with EC2 access
- [ ] Domain name registered (required for HTTPS/WebSockets)
- [ ] SSH key pair for EC2 access

## AWS Deployment Steps

### 4. Launch EC2 Instance 🖥️
- [ ] Instance Type: `t3.medium` minimum (recommend `t3.large` for production)
- [ ] OS: `Ubuntu 22.04 LTS`
- [ ] Storage: `20GB` minimum
- [ ] Security Group: Allow ports `22, 80, 443, 3000`
- [ ] Assign Elastic IP (recommended for production)

### 5. Domain Configuration 🌐
- [ ] Point A record: `yourdomain.com` → EC2 Public IP
- [ ] Point CNAME: `www.yourdomain.com` → `yourdomain.com`
- [ ] Wait for DNS propagation (5-30 minutes)

### 6. Server Setup 🔧
- [ ] SSH into your EC2 instance
- [ ] Run the deployment script: `./deploy-aws.sh`
- [ ] Configure environment variables in `.env.production`
- [ ] Start the application with Docker Compose

### 7. SSL Certificate 🔒
- [ ] Install SSL certificate with Let's Encrypt
- [ ] Configure Nginx reverse proxy
- [ ] Test HTTPS access: `https://yourdomain.com/api/health`

### 8. Twilio Configuration 📞
- [ ] Update webhook URL in Twilio Console to: `https://yourdomain.com/api/calls/voice`
- [ ] Set HTTP method to `POST`
- [ ] Test webhook connectivity

## Post-Deployment Testing

### 9. Functionality Tests ✅
- [ ] Health check: `curl https://yourdomain.com/api/health`
- [ ] WebSocket connection test (see deployment guide)
- [ ] Make test call to Twilio number
- [ ] Verify AI responds within 1-3 seconds (with optimizations)
- [ ] Test conversation flow (multiple exchanges)

### 10. Monitoring Setup 📊
- [ ] Set up log monitoring: `docker-compose logs -f`
- [ ] Configure server monitoring (htop, docker stats)
- [ ] Set up automatic restarts on reboot
- [ ] Configure log rotation

## Performance Validation

### Expected Results (After Our Optimizations):
- ✅ **Initial response:** 2-3 seconds (down from 5-6 seconds)
- ✅ **Follow-up responses:** 1-2 seconds (down from 3-4 seconds) 
- ✅ **No duplicate WebSocket connections**
- ✅ **No "Session not ready" errors**
- ✅ **Continuous conversation without call drops**

## Troubleshooting

### Common Issues:
- **WebSocket fails:** Check SSL certificate and Nginx config
- **Slow responses:** Monitor CPU/memory, check Deepgram API
- **Call drops:** Verify webhook URL and TwiML responses
- **Connection timeout:** Check security group and firewall rules

### Quick Commands:
```bash
# View app logs
docker-compose -f docker-compose.prod.yml logs twilio-app

# Restart app
docker-compose -f docker-compose.prod.yml restart

# Check app status  
docker-compose -f docker-compose.prod.yml ps

# Test health
curl https://yourdomain.com/api/health
```

---

## 🎯 Success Criteria

Your deployment is successful when:
1. ✅ Health endpoint returns 200 OK
2. ✅ Twilio calls connect and AI responds quickly  
3. ✅ No duplicate WebSocket connection logs
4. ✅ Conversation continues without call termination
5. ✅ Response times are 1-3 seconds consistently

**Ready to deploy? Start with Step 1! 🚀**
