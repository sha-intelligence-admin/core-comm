# 🚀 Core-Comm Deployment Hub

This directory contains all deployment scripts, configurations, and documentation for the Core-Comm AI Voice Agent Platform.

## 📁 Directory Structure

### 🔧 Deployment Scripts
- **`deploy-aws.sh`** - Full AWS EC2 deployment with Git clone
- **`deploy-no-git.sh`** - Local deployment (use existing repository)  
- **`deploy-local.sh`** - Alternative local deployment script
- **`setup-auth.sh`** - GitHub authentication setup helper
- **`test-deployment.sh`** - Deployment testing and validation

### 📚 Documentation
- **`DEPLOYMENT_GUIDE.md`** - Complete production deployment guide
- **`AWS_DEPLOYMENT_GUIDE.md`** - AWS-specific deployment instructions
- **`QUICK_START_GUIDE.md`** - Fast deployment for experienced users
- **`RAG_UPGRADE_GUIDE.md`** - RAG system upgrade documentation
- **`PRODUCTION_SECURITY_CHECKLIST.md`** - Security checklist for production
- **`DEPLOYMENT_CHECKLIST.md`** - Pre-deployment verification steps
- **`PRODUCTION_READINESS_CHECKLIST.md`** - Production readiness validation
- **`AUDIT.md`** - System audit documentation
- **`IMPROVEMENTS.md`** - Deployment improvements and optimizations

### ⚙️ Configuration Files
- **`docker-compose.prod.yml`** - Production Docker Compose configuration
- **`twilio-Dockerfile`** - Twilio service Docker configuration
- **`nginx.conf`** - Nginx reverse proxy configuration
- **`.env.example`** - Environment variables example
- **`.env.template`** - Environment template

---

## 🚀 Quick Start

### Option 1: Fresh EC2 Deployment
```bash
# Download and run the full deployment script
wget https://raw.githubusercontent.com/sha-intelligence-admin/core-comm/main/deployment/deploy-aws.sh
chmod +x deploy-aws.sh
./deploy-aws.sh
```

### Option 2: Local Deployment (Repository Already Downloaded)
```bash
# If you already have the repository
cd core-comm/deployment
chmod +x deploy-no-git.sh
./deploy-no-git.sh
```

### Option 3: Manual Setup
```bash
# Download repository manually
wget https://github.com/sha-intelligence-admin/core-comm/archive/refs/heads/main.zip
unzip main.zip && mv core-comm-main core-comm
cd core-comm/deployment
chmod +x deploy-no-git.sh
./deploy-no-git.sh
```

---

## 🔑 Authentication Setup

If you encounter Git authentication issues:

```bash
chmod +x setup-auth.sh
./setup-auth.sh
```

This script will help you set up:
- SSH key authentication
- GitHub CLI authentication  
- Manual repository download

---

## 📋 Pre-Deployment Requirements

### System Requirements
- **OS**: Ubuntu 20.04+ or similar Linux distribution
- **RAM**: Minimum 7GB (recommended: 8GB+) 
- **Storage**: 20GB+ free space
- **Instance**: AWS EC2 t3.large or larger recommended

### API Keys Required
- **Twilio**: Account SID, Auth Token, Phone Number
- **OpenAI**: API Key with GPT-4 access
- **ElevenLabs**: API Key for voice synthesis
- **Deepgram**: API Key for speech recognition
- **Supabase**: URL, Anon Key, Service Role Key

### Domain & Networking
- Public domain name (for webhooks)
- SSL certificate (automated via Let's Encrypt)
- Security groups/firewall configured for ports 80, 443, 3000

---

## 🏗️ Deployment Process

1. **System Setup** - Install Docker, Docker Compose, dependencies
2. **Authentication** - Configure Git access (if needed)
3. **Repository** - Clone or download source code
4. **Environment** - Set up API keys and configuration
5. **Build** - Build Docker containers and services
6. **Deploy** - Start services and perform health checks
7. **Validate** - Run tests and verify functionality

---

## 🔍 Health Checks & Monitoring

After deployment, verify your system:

```bash
# Basic health check
curl http://localhost:3000/api/health

# Detailed health check  
curl http://localhost:3000/api/health/detailed

# View logs
docker-compose -f docker-compose.prod.yml logs -f

# System monitoring
htop
docker stats
```

---

## 🛠️ Troubleshooting

### Common Issues

1. **Git Authentication Failures**
   - Run `./setup-auth.sh` to configure authentication
   - Use Personal Access Token instead of password

2. **Docker Permission Issues** 
   - Run `sudo usermod -aG docker $USER`
   - Log out and back in, or run `newgrp docker`

3. **Insufficient RAM**
   - Upgrade to larger EC2 instance (t3.large+)
   - Monitor with `free -h` and `htop`

4. **API Key Issues**
   - Verify all keys in `.env.production`
   - Test connectivity before deployment

5. **Port Conflicts**
   - Check for existing services on ports 3000, 80, 443
   - Use `netstat -tulpn` to identify conflicts

---

## 📞 Support & Resources

- **Documentation**: Check relevant guide files in this directory
- **Logs**: Use Docker Compose logs for debugging
- **Monitoring**: Built-in health checks and metrics
- **Security**: Follow production security checklist

---

## 🔄 Updates & Maintenance

To update your deployment:

```bash
# Pull latest changes
git pull origin main

# Rebuild and redeploy
docker-compose -f deployment/docker-compose.prod.yml up -d --build

# Run health checks
curl http://localhost:3000/api/health
```

---

*Last updated: $(date)*
