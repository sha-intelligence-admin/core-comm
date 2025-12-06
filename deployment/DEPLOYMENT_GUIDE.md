# 🚀 Production Deployment Guide

## ✅ Pre-Deployment Checklist

### **CRITICAL - Security Requirements**
- [ ] **Rotate all Supabase credentials** (service role key was previously exposed)
- [ ] **Set up proper environment variables** (see `.env.example`)
- [ ] **Configure CSRF_SECRET** for CSRF protection
- [ ] **Set NODE_ENV=production**
- [ ] **Configure Redis** for production rate limiting

### **Infrastructure Setup**
- [ ] **SSL/TLS certificates** configured
- [ ] **Database backups** scheduled
- [ ] **Redis instance** running (recommended)
- [ ] **Load balancer** configured (if needed)
- [ ] **CDN setup** for static assets

## 🔧 Environment Configuration

### Required Environment Variables
```bash
# App Configuration
NODE_ENV=production
NEXT_PUBLIC_APP_URL=https://your-domain.com
API_BASE_URL=https://your-domain.com/api

# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_new_rotated_service_role_key
DATABASE_URL=your_supabase_database_url

# Security
CSRF_SECRET=your_strong_random_secret_here
NEXTAUTH_SECRET=your_nextauth_secret_here

# Redis (Production Rate Limiting)
REDIS_URL=redis://your-redis-host:6379

# Monitoring & Logging (Optional)
SENTRY_DSN=your_sentry_dsn
DATADOG_API_KEY=your_datadog_key
```

## 🐳 Docker Deployment

### Option 1: Docker Compose (Recommended for single server)

```bash
# Clone repository
git clone <your-repo-url>
cd core-comm

# Copy and configure environment
cp .env.example .env.production
# Edit .env.production with your values

# Build and run
docker-compose up -d

# Check health
curl http://localhost:3000/api/health
```

### Option 2: Kubernetes Deployment

```yaml
# k8s-deployment.yaml
apiVersion: apps/v1
kind: Deployment
metadata:
  name: corecomm-app
spec:
  replicas: 3
  selector:
    matchLabels:
      app: corecomm-app
  template:
    metadata:
      labels:
        app: corecomm-app
    spec:
      containers:
      - name: app
        image: your-registry/corecomm:latest
        ports:
        - containerPort: 3000
        env:
        - name: NODE_ENV
          value: "production"
        - name: REDIS_URL
          valueFrom:
            secretKeyRef:
              name: corecomm-secrets
              key: redis-url
        resources:
          requests:
            memory: "256Mi"
            cpu: "250m"
          limits:
            memory: "512Mi"
            cpu: "500m"
        livenessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 30
          periodSeconds: 10
        readinessProbe:
          httpGet:
            path: /api/health
            port: 3000
          initialDelaySeconds: 5
          periodSeconds: 5
```

## ☁️ Cloud Platform Deployment

### Vercel
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy
vercel --prod

# Set environment variables via Vercel dashboard
```

### AWS ECS/Fargate
```bash
# Build and push to ECR
aws ecr get-login-password --region us-east-1 | docker login --username AWS --password-stdin <account>.dkr.ecr.us-east-1.amazonaws.com
docker build -t corecomm .
docker tag corecomm:latest <account>.dkr.ecr.us-east-1.amazonaws.com/corecomm:latest
docker push <account>.dkr.ecr.us-east-1.amazonaws.com/corecomm:latest

# Deploy using ECS task definition
aws ecs update-service --cluster production --service corecomm-service --force-new-deployment
```

### Google Cloud Run
```bash
# Build and deploy
gcloud run deploy corecomm \\
  --source . \\
  --platform managed \\
  --region us-central1 \\
  --allow-unauthenticated \\
  --set-env-vars NODE_ENV=production,REDIS_URL=redis://your-redis
```

## 📊 Monitoring & Alerting

### Health Check Endpoints
- `GET /api/health` - Comprehensive health status
- Returns database, Redis, and memory status
- Use for load balancer health checks

### Recommended Monitoring Stack
- **APM**: DataDog, New Relic, or Sentry
- **Logs**: ELK Stack or Cloud Logging
- **Uptime**: Pingdom, UptimeRobot
- **Alerts**: PagerDuty, Slack webhooks

### Key Metrics to Monitor
- Response time (< 2s target)
- Error rate (< 1% target)
- Memory usage (< 80% target)
- Database connections
- Rate limit violations
- Authentication failures

## 🔒 Security Configuration

### Supabase Auth Settings
1. **Enable email verification**
2. **Configure session timeout** (8 hours max)
3. **Set up proper CORS** for your domain
4. **Enable audit logging**
5. **Configure password requirements** (12+ chars)

### WAF/Security Headers
All security headers are configured in `next.config.mjs` and `nginx.conf`:
- Content Security Policy
- HSTS (HTTPS Strict Transport Security)
- X-Frame-Options: DENY
- X-Content-Type-Options: nosniff

### Rate Limiting
- Auth endpoints: 5 requests per 15 minutes
- API endpoints: 100 requests per minute
- Upload endpoints: 10 requests per minute
- Automatically uses Redis in production

## 🧪 Testing Production Build

```bash
# Build and test locally
npm run build
npm start

# Run health check
curl http://localhost:3000/api/health

# Load test (optional)
npx artillery quick --count 10 --num 5 http://localhost:3000/api/health
```

## 🚨 Rollback Plan

### Quick Rollback Steps
1. **Revert to previous Docker image**:
   ```bash
   docker-compose down
   docker-compose up -d --scale app=0
   docker tag corecomm:previous corecomm:latest
   docker-compose up -d
   ```

2. **Database rollback** (if needed):
   - Use Supabase dashboard to restore from backup
   - Run any rollback migrations

3. **DNS/Load Balancer**:
   - Point traffic back to previous version
   - Monitor error rates

## 📱 Post-Deployment Verification

### Automated Checks
```bash
#!/bin/bash
# post-deploy-check.sh

BASE_URL="https://your-domain.com"

echo "🔍 Running post-deployment checks..."

# Health check
if curl -f $BASE_URL/api/health > /dev/null 2>&1; then
  echo "✅ Health check passed"
else
  echo "❌ Health check failed"
  exit 1
fi

# Auth test (optional)
echo "✅ All checks passed!"
```

### Manual Verification
- [ ] Login/logout functionality
- [ ] API endpoints responding
- [ ] Database connectivity
- [ ] Redis connectivity (if configured)
- [ ] SSL certificate valid
- [ ] Monitoring dashboards showing data

## 🛠️ Troubleshooting

### Common Issues

**Build Failures**
```bash
# Clear Next.js cache
rm -rf .next
npm run build
```

**Memory Issues**
```bash
# Increase Docker memory limits
# In docker-compose.yml, add:
deploy:
  resources:
    limits:
      memory: 1G
```

**Database Connection Issues**
- Verify Supabase URL and keys
- Check database connection limits
- Verify network connectivity

### Logs and Debugging
```bash
# Docker logs
docker-compose logs -f app

# Application logs (in production, these go to your logging service)
tail -f /var/log/corecomm/app.log
```

## 🔄 Maintenance

### Regular Tasks
- **Weekly**: Review security alerts
- **Monthly**: Update dependencies
- **Quarterly**: Security audit
- **Annually**: Credential rotation

### Backup Strategy
- **Database**: Daily automated backups via Supabase
- **Files**: S3/Cloud Storage backups
- **Configuration**: Version controlled

---

## 📞 Support

For deployment issues:
1. Check this guide first
2. Review application logs
3. Check health endpoint status
4. Contact system administrator

**Emergency Contacts**:
- On-call engineer: [Your contact info]
- Infrastructure team: [Your contact info]

---

*Last updated: $(date)*
*Production Status: Ready for deployment after completing checklist*