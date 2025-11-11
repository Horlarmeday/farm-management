# 🚀 Kuyash Farm Management System - Render Deployment Guide

## Overview
This guide will walk you through deploying the Kuyash Farm Management System to Render, a cloud platform that makes deployment simple and cost-effective.

## 📋 Prerequisites

Before starting, ensure you have:
- [ ] Git repository with your project
- [ ] Render account (free tier available)
- [ ] Node.js 18+ and Yarn 4+ installed locally
- [ ] Basic understanding of environment variables

## 🏗️ Architecture Overview

```
┌─────────────────────┐     ┌─────────────────────┐     ┌─────────────────────┐
│   React Frontend    │     │   Node.js Backend   │     │   MySQL Database    │
│   (Static Site)     │────▶│   (Web Service)     │────▶│   (Managed DB)      │
│   render.com        │     │   render.com        │     │   render.com        │
└─────────────────────┘     └─────────────────────┘     └─────────────────────┘
```

## 💰 Cost Breakdown (Monthly)

| Service | Plan | Cost | Features |
|---------|------|------|----------|
| Frontend | Static | **FREE** | 100GB bandwidth |
| Backend | Starter | **$7** | 512MB RAM, 1vCPU |
| Database | Starter | **$7** | 1GB storage, backups |
| **Total** | | **$14/month** | |

## 📝 Step-by-Step Deployment

### Step 1: Prepare Your Project

1. **Update your repository**:
   ```bash
   git add .
   git commit -m "Add Render deployment configuration"
   git push origin main
   ```

2. **Make deployment script executable** (if on Unix/Linux/Mac):
   ```bash
   chmod +x deploy-to-render.sh
   ```

### Step 2: Set Up Environment Variables

1. **Copy the environment template**:
   ```bash
   cp .env.render.example .env.render
   ```

2. **Edit `.env.render` with your values**:
   ```bash
   # Generate a secure JWT secret (minimum 32 characters)
   JWT_SECRET=your-super-secure-jwt-secret-key-here
   
   # Frontend URL (will be updated after deployment)
   CORS_ORIGIN=https://your-frontend-url.onrender.com
   ```

### Step 3: Create Render Account & Services

#### Option A: Automated Deployment (Recommended)

1. **Install Render CLI** (optional):
   ```bash
   curl https://render.com/install.sh | sh
   ```

2. **Run the deployment script**:
   ```bash
   ./deploy-to-render.sh
   ```

#### Option B: Manual Deployment

1. **Create Render Blueprint**:
   - Go to [render.com/blueprints](https://render.com/blueprints)
   - Connect your GitHub repository
   - Render will automatically detect `render.yaml`
   - Click "Apply" to create all services

2. **Manual Service Creation** (if blueprint fails):

   **Create Database First**:
   - Go to [render.com/databases](https://render.com/databases)
   - Click "New Database"
   - Choose "MySQL"
   - Name: `kuyash-farm-db`
   - Plan: Starter ($7/month)
   - Save the connection details

   **Create Backend Service**:
   - Go to [render.com/web-services](https://render.com/web-services)
   - Click "New Web Service"
   - Connect your GitHub repo
   - Name: `kuyash-farm-api`
   - Environment: Node
   - Build Command: `yarn install && yarn build:all`
   - Start Command: `cd server && yarn start:prod`
   - Add environment variables from `.env.render`

   **Create Frontend Service**:
   - Go to [render.com/static-sites](https://render.com/static-sites)
   - Click "New Static Site"
   - Connect your GitHub repo
   - Name: `kuyash-farm-frontend`
   - Build Command: `cd client && yarn install && yarn build`
   - Publish Directory: `client/dist`
   - Add environment variables

### Step 4: Configure Services

1. **Update CORS Configuration**:
   - Get your frontend URL from Render dashboard
   - Update backend environment variable: `CORS_ORIGIN=https://your-frontend-url.onrender.com`
   - Redeploy backend service

2. **Update Frontend API URL**:
   - Get your backend URL from Render dashboard
   - Update frontend environment variable: `VITE_API_BASE_URL=https://your-backend-url.onrender.com`
   - Redeploy frontend service

### Step 5: Database Migration

1. **Access your backend service shell**:
   - Go to your backend service dashboard
   - Click "Shell" tab
   - Run migration command:
   ```bash
   cd server && yarn migrate:prod
   ```

2. **Alternative: Use Render CLI**:
   ```bash
   render ssh kuyash-farm-api
   cd server && yarn migrate:prod
   exit
   ```

### Step 6: Test Your Deployment

1. **Check Health Endpoints**:
   - Frontend: `https://your-frontend-url.onrender.com`
   - Backend: `https://your-backend-url.onrender.com/api/health`
   - Database: Should be accessible from backend

2. **Test Core Functionality**:
   - User registration/login
   - Farm creation
   - Data persistence
   - File uploads (note: temporary storage)

## 🔧 Post-Deployment Configuration

### File Storage Migration (Important!)

**Current Issue**: File uploads use local storage, which is ephemeral on Render.

**Solution**: Migrate to cloud storage

1. **Set up AWS S3** (recommended):
   - Create AWS account
   - Create S3 bucket
   - Generate access keys
   - Update backend to use S3

2. **Alternative: Cloudinary** (easier):
   - Sign up for Cloudinary
   - Get API credentials
   - Update file upload logic

### Custom Domain Setup

1. **Add custom domain in Render**:
   - Frontend: `app.yourfarm.com`
   - Backend: `api.yourfarm.com`

2. **Update DNS records**:
   ```
   CNAME app.yourfarm.com → [Render Frontend URL]
   CNAME api.yourfarm.com → [Render Backend URL]
   ```

3. **Update environment variables**:
   - Frontend: `VITE_API_BASE_URL=https://api.yourfarm.com`
   - Backend: `CORS_ORIGIN=https://app.yourfarm.com`

## 📊 Monitoring & Maintenance

### Monitoring Setup

1. **Application Monitoring**:
   - Sign up for [Sentry](https://sentry.io) (free tier)
   - Add Sentry DSN to environment variables
   - Monitor errors and performance

2. **Uptime Monitoring**:
   - Use [UptimeRobot](https://uptimerobot.com) (free)
   - Monitor health endpoints
   - Set up alerts

### Regular Maintenance

1. **Weekly Tasks**:
   - Check application logs
   - Monitor resource usage
   - Review error reports

2. **Monthly Tasks**:
   - Update dependencies
   - Review security settings
   - Check backup status

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**:
   ```bash
   # Check Node.js version compatibility
   node --version  # Should be 18+
   
   # Clear build cache in Render dashboard
   # Redeploy service
   ```

2. **Database Connection Issues**:
   - Verify database credentials
   - Check if database is running
   - Ensure network access from backend

3. **CORS Errors**:
   - Verify CORS_ORIGIN matches frontend URL
   - Check if backend is using correct protocol (https)

4. **File Upload Issues**:
   - Check /tmp directory permissions
   - Monitor disk space usage
   - Consider migrating to cloud storage

5. **Memory Issues**:
   - Monitor memory usage in Render dashboard
   - Optimize database queries
   - Consider upgrading plan if needed

### Getting Help

- **Render Documentation**: [docs.render.com](https://docs.render.com)
- **Render Community**: [community.render.com](https://community.render.com)
- **Project Issues**: Check GitHub issues in your repository

## 🎯 Next Steps

### Immediate (Week 1)
- [ ] Set up file storage migration
- [ ] Configure monitoring
- [ ] Test all functionality thoroughly
- [ ] Set up custom domain

### Short-term (Month 1)
- [ ] Implement caching (Redis)
- [ ] Set up email notifications
- [ ] Add rate limiting
- [ ] Optimize database queries

### Long-term (Quarter 1)
- [ ] Load testing
- [ ] Auto-scaling configuration
- [ ] Disaster recovery testing
- [ ] Performance optimization

## 📞 Support

If you encounter issues:

1. **Check logs**: Render dashboard → Service → Logs
2. **Review configuration**: Double-check environment variables
3. **Test locally**: Ensure everything works locally first
4. **Community help**: Render community forums
5. **Professional support**: Consider Render's paid support

---

**🎉 Congratulations!** Your Kuyash Farm Management System should now be successfully deployed on Render. Remember to monitor your application regularly and keep your dependencies updated.