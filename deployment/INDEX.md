# 📂 Deployment Directory Index

## 🔧 Deployment Scripts

| Script | Purpose | Use When |
|--------|---------|----------|
| [`deploy-aws.sh`](./deploy-aws.sh) | Full AWS EC2 deployment with Git clone | Fresh EC2 instance, need to clone repo |
| [`deploy-no-git.sh`](./deploy-no-git.sh) | Local deployment (skip Git clone) | Repository already downloaded |
| [`deploy-local.sh`](./deploy-local.sh) | Alternative local deployment | Alternative to deploy-no-git.sh |
| [`setup-auth.sh`](./setup-auth.sh) | GitHub authentication helper | Git authentication issues |
| [`test-deployment.sh`](./test-deployment.sh) | Deployment validation | After deployment completion |

## 📚 Documentation

| Document | Description | Audience |
|----------|-------------|----------|
| [`README.md`](./README.md) | Main deployment hub documentation | All users |
| [`DEPLOYMENT_GUIDE.md`](./DEPLOYMENT_GUIDE.md) | Complete production deployment guide | DevOps/Administrators |
| [`QUICK_START_GUIDE.md`](./QUICK_START_GUIDE.md) | Fast deployment for experienced users | Experienced developers |
| [`AWS_DEPLOYMENT_GUIDE.md`](./AWS_DEPLOYMENT_GUIDE.md) | AWS-specific deployment instructions | AWS users |
| [`RAG_UPGRADE_GUIDE.md`](./RAG_UPGRADE_GUIDE.md) | RAG system upgrade documentation | System upgrades |

## 📋 Checklists & Security

| Document | Description | Usage |
|----------|-------------|-------|
| [`PRODUCTION_SECURITY_CHECKLIST.md`](./PRODUCTION_SECURITY_CHECKLIST.md) | Security checklist for production | Before production |
| [`DEPLOYMENT_CHECKLIST.md`](./DEPLOYMENT_CHECKLIST.md) | Pre-deployment verification | Before deployment |
| [`PRODUCTION_READINESS_CHECKLIST.md`](./PRODUCTION_READINESS_CHECKLIST.md) | Production readiness validation | Production prep |

## 📊 Analysis & Improvements

| Document | Description | Target |
|----------|-------------|--------|
| [`AUDIT.md`](./AUDIT.md) | System audit documentation | System analysis |
| [`IMPROVEMENTS.md`](./IMPROVEMENTS.md) | Deployment improvements and optimizations | Continuous improvement |

## ⚙️ Configuration Files

| File | Description | Used By |
|------|-------------|---------|
| [`docker-compose.prod.yml`](./docker-compose.prod.yml) | Production Docker Compose | All deployment scripts |
| [`twilio-Dockerfile`](./twilio-Dockerfile) | Twilio service Docker configuration | Docker builds |
| [`nginx.conf`](./nginx.conf) | Nginx reverse proxy configuration | Web server setup |
| [`.env.example`](./.env.example) | Environment variables example | Configuration |
| [`.env.template`](./.env.template) | Environment template | Configuration |

---

## 🚀 Quick Commands

### First-time AWS Deployment
```bash
chmod +x deploy-aws.sh && ./deploy-aws.sh
```

### Local Deployment (Repository Downloaded)
```bash
chmod +x deploy-no-git.sh && ./deploy-no-git.sh
```

### Authentication Setup
```bash
chmod +x setup-auth.sh && ./setup-auth.sh
```

### Test Deployment
```bash
chmod +x test-deployment.sh && ./test-deployment.sh
```

---

*All scripts are designed to be run from the deployment directory*
