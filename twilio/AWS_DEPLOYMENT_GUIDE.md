# 🚀 AWS EC2 Deployment Guide for Twilio Voice App

## Prerequisites
- AWS Account with EC2 access
- Domain name (for SSL/HTTPS - required for WebSockets)
- Twilio Account with phone number
- Deepgram API key
- Supabase database

## Step 1: Launch AWS EC2 Instance

### Instance Configuration:
```bash
Instance Type: t3.medium (minimum - for production use t3.large+)
Operating System: Ubuntu 22.04 LTS
Storage: 20GB gp3 SSD (minimum)
Security Group: Allow ports 22 (SSH), 80 (HTTP), 443 (HTTPS), 3000 (App)
```

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
TWILIO_ACCOUNT_SID=ACxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
TWILIO_AUTH_TOKEN=your_auth_token_here
TWILIO_PHONE_NUMBER=+1234567890
DEEPGRAM_API_KEY=your_deepgram_api_key_here
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
PUBLIC_DOMAIN=https://your-domain.com
```

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

### Test the health endpoint:
```bash
curl https://your-domain.com/api/health
# Should return: {"status":"ok","timestamp":"..."}
```

### Test WebSocket connection:
```bash
# Check if WebSocket endpoint responds
curl -i -N -H "Connection: Upgrade" -H "Upgrade: websocket" \
     -H "Sec-WebSocket-Key: test" -H "Sec-WebSocket-Version: 13" \
     https://your-domain.com/api/calls/media-stream/test/test
```

### Make a test call:
1. Call your Twilio phone number
2. You should hear: "Hello, Welcome to our demo. How can I assist you today?"
3. Speak and wait for AI response (should be 1-3 seconds with optimizations)

## Step 9: Monitor Your Deployment

### View application logs:
```bash
cd core-comm/twilio
docker-compose -f docker-compose.prod.yml logs -f twilio-app
```

### Monitor system resources:
```bash
htop
docker stats
```

### Check Nginx logs:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
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

## Troubleshooting

### Common Issues:

1. **WebSocket connection fails:**
   - Check SSL certificate is valid
   - Verify Nginx WebSocket proxy configuration
   - Ensure port 443 is open in security group

2. **Calls don't connect:**
   - Verify Twilio webhook URL is correct
   - Check application logs for errors
   - Test health endpoint

3. **Slow AI responses:**
   - Check Deepgram API key is valid
   - Monitor server CPU/memory usage
   - Review application logs for timeouts

### View logs:
```bash
# Application logs
docker-compose -f docker-compose.prod.yml logs twilio-app

# Nginx logs
sudo tail -f /var/log/nginx/error.log

# System logs
journalctl -u nginx -f
```

## Expected Performance (After Optimizations)

✅ **First response:** 2-3 seconds  
✅ **Subsequent responses:** 1-2 seconds  
✅ **WebSocket connection:** < 1 second  
✅ **Call setup:** 2-3 seconds  

Your optimized Twilio voice application should now be running efficiently on AWS!
