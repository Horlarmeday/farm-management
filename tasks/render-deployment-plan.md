# Kuyash Farm Management System - Render Deployment Plan

## 📋 Table of Contents

1. [Project Analysis](#project-analysis)
2. [Render Deployment Strategy](#render-deployment-strategy)
3. [Environment Configuration](#environment-configuration)
4. [Database Setup](#database-setup)
5. [Build Configuration](#build-configuration)
6. [Service Configuration](#service-configuration)
7. [Domain & SSL Setup](#domain--ssl-setup)
8. [Monitoring & Logging](#monitoring--logging)
9. [Cost Optimization](#cost-optimization)
10. [Backup & Recovery](#backup--recovery)
11. [Deployment Checklist](#deployment-checklist)
12. [Post-Deployment Tasks](#post-deployment-tasks)

---

## 1. Project Analysis

### Current Architecture
- **Monorepo Structure**: Yarn workspaces with 3 packages
  - `client/`: React frontend (Vite + TypeScript)
  - `server/`: Node.js backend (Express + TypeORM)
  - `shared/`: Shared types and utilities
- **Database**: MySQL with TypeORM
- **Authentication**: JWT-based
- **File Storage**: Local uploads (needs migration to cloud storage)

### Dependencies Analysis
```json
// Key dependencies that need Render compatibility
{
  "client": {
    "vite": "^5.0.0",
    "react": "^18.2.0",
    "typescript": "^5.3.2"
  },
  "server": {
    "express": "^4.18.2",
    "typeorm": "^0.3.17",
    "mysql2": "^3.6.5",
    "jsonwebtoken": "^9.0.2"
  }
}
```

---

## 2. Render Deployment Strategy

### Deployment Architecture
```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   React App     │     │  Node.js API    │     │   MySQL DB      │
│   (Static)      │────▶│  (Web Service)  │────▶│  (Managed)    │
│  render.com     │     │  render.com     │     │  render.com     │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Service Breakdown
1. **Frontend**: Static site deployment (Free tier eligible)
2. **Backend**: Web service with auto-scaling
3. **Database**: Managed MySQL database
4. **File Storage**: Need to migrate to cloud storage (AWS S3 or Cloudinary)

---

## 3. Environment Configuration

### Frontend Environment Variables (.env.production)
```bash
VITE_API_BASE_URL=https://kuyash-farm-api.onrender.com
VITE_APP_ENV=production
VITE_JWT_SECRET=your-jwt-secret
```

### Backend Environment Variables (.env.production)
```bash
# Database
DB_HOST=your-mysql-host.onrender.com
DB_PORT=3306
DB_USERNAME=your-db-user
DB_PASSWORD=your-db-password
DB_DATABASE=kuyash_farm_db

# JWT
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d

# CORS
CORS_ORIGIN=https://kuyash-farm.onrender.com

# Node Environment
NODE_ENV=production
PORT=10000

# File Upload (temporary solution)
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10485760
```

---

## 4. Database Setup

### Render MySQL Configuration
```sql
-- Create database and user
CREATE DATABASE kuyash_farm_db;
CREATE USER 'kuyash_user'@'%' IDENTIFIED BY 'secure-password';
GRANT ALL PRIVILEGES ON kuyash_farm_db.* TO 'kuyash_user'@'%';
FLUSH PRIVILEGES;
```

### Database Migration Strategy
1. Export current database schema
2. Create migration scripts
3. Set up automated migrations on deployment

---

## 5. Build Configuration

### Frontend Build Configuration
```json
// client/package.json
{
  "scripts": {
    "build": "tsc && vite build",
    "build:render": "NODE_ENV=production yarn build"
  }
}
```

### Backend Build Configuration
```json
// server/package.json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "start:prod": "NODE_ENV=production node dist/server.js",
    "migrate": "typeorm migration:run -d dist/data-source.js"
  }
}
```

### Root Package Configuration
```json
// package.json
{
  "scripts": {
    "build:client": "cd client && yarn build",
    "build:server": "cd server && yarn build",
    "build:shared": "cd shared && yarn build",
    "build:all": "yarn build:shared && yarn build:server && yarn build:client"
  }
}
```

---

## 6. Service Configuration

### Frontend (Static Site)
**render.yaml** configuration:
```yaml
services:
  - type: web
    name: kuyash-farm-frontend
    env: static
    buildCommand: cd client && yarn install && yarn build
    staticPublishPath: client/dist
    envVars:
      - key: VITE_API_BASE_URL
        sync: false
      - key: VITE_APP_ENV
        value: production
```

### Backend (Web Service)
**render.yaml** configuration:
```yaml
services:
  - type: web
    name: kuyash-farm-api
    env: node
    buildCommand: |
      yarn install
      yarn build:all
    startCommand: cd server && yarn start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DB_HOST
        sync: false
      - key: DB_PORT
        value: 3306
      - key: DB_USERNAME
        sync: false
      - key: DB_PASSWORD
        sync: false
      - key: DB_DATABASE
        sync: false
      - key: JWT_SECRET
        sync: false
      - key: CORS_ORIGIN
        sync: false
```

### Database (Managed MySQL)
**render.yaml** configuration:
```yaml
databases:
  - name: kuyash-farm-db
    databaseName: kuyash_farm_db
    user: kuyash_user
    plan: starter
```

---

## 7. Domain & SSL Setup

### Custom Domain Configuration
1. **Frontend Domain**: `app.yourfarm.com`
2. **Backend Domain**: `api.yourfarm.com`
3. **SSL**: Automatic SSL certificates provided by Render

### DNS Configuration
```
A     app.yourfarm.com     → [Render Frontend IP]
CNAME api.yourfarm.com   → [Render Backend URL]
```

---

## 8. Monitoring & Logging

### Application Monitoring
- **Frontend**: Google Analytics, Sentry for error tracking
- **Backend**: Application logs via Render dashboard
- **Database**: Query performance monitoring

### Health Checks
```typescript
// server/src/routes/health.ts
import { Router } from 'express';

const router = Router();

router.get('/health', (req, res) => {
  res.status(200).json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV
  });
});

export default router;
```

---

## 9. Cost Optimization

### Render Pricing Analysis
| Service | Plan | Monthly Cost | Features |
|---------|------|-------------|----------|
| Frontend | Static | Free | 100GB bandwidth |
| Backend | Starter | $7 | 512MB RAM, 1vCPU |
| Database | Starter | $7 | 1GB storage |
| **Total** | | **$14/month** | |

### Optimization Strategies
1. **Frontend**: Use CDN for static assets
2. **Backend**: Implement caching (Redis)
3. **Database**: Optimize queries, add indexes
4. **File Storage**: Migrate to cloud storage

---

## 10. Backup & Recovery

### Database Backups
- **Automated**: Render provides daily backups
- **Manual**: Export data regularly
- **Retention**: 7 days for starter plan

### Application Recovery
1. **Code**: Git repository backup
2. **Configuration**: Environment variables backup
3. **Files**: Cloud storage backup

---

## 11. Deployment Checklist

### Pre-Deployment
- [ ] Update environment variables
- [ ] Test build process locally
- [ ] Create database backup
- [ ] Review security settings
- [ ] Set up monitoring

### Deployment Steps
1. [ ] Create Render account
2. [ ] Set up MySQL database
3. [ ] Deploy backend service
4. [ ] Run database migrations
5. [ ] Deploy frontend static site
6. [ ] Configure custom domains
7. [ ] Set up SSL certificates
8. [ ] Test all functionality

### Post-Deployment
- [ ] Verify all endpoints
- [ ] Test file uploads
- [ ] Check authentication flow
- [ ] Monitor performance
- [ ] Set up alerts

---

## 12. Post-Deployment Tasks

### Immediate Tasks (Week 1)
1. **File Storage Migration**: Move from local to cloud storage
2. **Email Service**: Set up email notifications
3. **Performance Monitoring**: Implement comprehensive monitoring
4. **Security Audit**: Review all security configurations

### Short-term Tasks (Month 1)
1. **CDN Setup**: Implement CDN for static assets
2. **Caching Layer**: Add Redis caching
3. **API Rate Limiting**: Implement rate limiting
4. **Error Tracking**: Set up Sentry integration

### Long-term Tasks (Quarter 1)
1. **Auto-scaling**: Configure auto-scaling rules
2. **Load Testing**: Perform load testing
3. **Disaster Recovery**: Test backup restoration
4. **Performance Optimization**: Optimize database queries

---

## Required Configuration Files

### 1. render.yaml (Root Level)
```yaml
previewsEnabled: true
services:
  - type: web
    name: kuyash-farm-frontend
    env: static
    buildCommand: cd client && yarn install && yarn build
    staticPublishPath: client/dist
    headers:
      - path: /*
        name: X-Frame-Options
        value: DENY
      - path: /*
        name: X-Content-Type-Options
        value: nosniff
    envVars:
      - key: VITE_API_BASE_URL
        fromService:
          name: kuyash-farm-api
          type: web
          envVarKey: RENDER_EXTERNAL_URL

  - type: web
    name: kuyash-farm-api
    env: node
    buildCommand: |
      yarn install
      yarn build:all
    startCommand: cd server && yarn start:prod
    envVars:
      - key: NODE_ENV
        value: production
      - key: PORT
        value: 10000
      - key: DB_HOST
        fromDatabase:
          name: kuyash-farm-db
          property: host
      - key: DB_PORT
        fromDatabase:
          name: kuyash-farm-db
          property: port
      - key: DB_USERNAME
        fromDatabase:
          name: kuyash-farm-db
          property: user
      - key: DB_PASSWORD
        fromDatabase:
          name: kuyash-farm-db
          property: password
      - key: DB_DATABASE
        fromDatabase:
          name: kuyash-farm-db
          property: database

databases:
  - name: kuyash-farm-db
    databaseName: kuyash_farm_db
    user: kuyash_user
    plan: starter
```

### 2. Build Script Updates

#### Root package.json
```json
{
  "scripts": {
    "build:client": "cd client && yarn build",
    "build:server": "cd server && yarn build",
    "build:shared": "cd shared && yarn build",
    "build:all": "yarn build:shared && yarn build:server && yarn build:client",
    "install:all": "yarn install && cd client && yarn install && cd ../server && yarn install && cd ../shared && yarn install"
  }
}
```

#### Server package.json
```json
{
  "scripts": {
    "build": "tsc",
    "start": "node dist/server.js",
    "start:prod": "NODE_ENV=production node dist/server.js",
    "migrate": "typeorm migration:run -d dist/data-source.js",
    "migrate:prod": "NODE_ENV=production yarn migrate"
  }
}
```

### 3. Environment Variables Template

#### .env.render (Root Level)
```bash
# Frontend
VITE_API_BASE_URL=https://kuyash-farm-api.onrender.com
VITE_APP_ENV=production

# Backend
NODE_ENV=production
PORT=10000
JWT_SECRET=your-super-secret-jwt-key-change-this
JWT_EXPIRES_IN=7d
CORS_ORIGIN=https://kuyash-farm.onrender.com

# Database (will be provided by Render)
DB_HOST=render-mysql-host
DB_PORT=3306
DB_USERNAME=render-db-user
DB_PASSWORD=render-db-password
DB_DATABASE=kuyash_farm_db

# File Upload (temporary)
UPLOAD_DIR=/tmp/uploads
MAX_FILE_SIZE=10485760
```

---

## Estimated Timeline

| Phase | Duration | Tasks |
|-------|----------|--------|
| **Preparation** | 2-3 hours | Environment setup, configuration |
| **Database Setup** | 1 hour | MySQL configuration, migrations |
| **Backend Deployment** | 2-3 hours | Service deployment, testing |
| **Frontend Deployment** | 1-2 hours | Static site setup, domain config |
| **Testing & Optimization** | 2-4 hours | End-to-end testing, performance |
| **Total** | **8-13 hours** | Complete deployment |

---

## Support & Troubleshooting

### Common Issues
1. **Build Failures**: Check Node.js version compatibility
2. **Database Connection**: Verify credentials and network access
3. **CORS Issues**: Ensure proper CORS configuration
4. **File Uploads**: Temporary directory permissions
5. **Memory Issues**: Monitor resource usage

### Debug Commands
```bash
# Check logs
render logs kuyash-farm-api
render logs kuyash-farm-frontend

# SSH into service (if needed)
render ssh kuyash-farm-api
```

---

**Next Steps**: Review this plan and let me know when you're ready to proceed with the deployment. I'll help you implement each step systematically.