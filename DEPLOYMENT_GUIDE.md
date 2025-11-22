# GYMFU Deployment & CI/CD Guide

Complete guide for hosting your web app and backend with automated CI/CD pipelines.

---

## Table of Contents
1. [Hosting Options](#hosting-options)
2. [Frontend Deployment](#frontend-deployment)
3. [Backend Deployment](#backend-deployment)
4. [Database Hosting](#database-hosting)
5. [CI/CD Setup](#cicd-setup)
6. [Domain & SSL](#domain--ssl)

---

## Hosting Options

### Best Options for GYMFU Stack

| Component | Recommended Hosting | Free Tier | Best For |
|-----------|-------------------|-----------|----------|
| **Frontend (React)** | Vercel, Netlify, Cloudflare Pages | ✅ Yes | Static sites, auto-deploy |
| **Backend (Node.js)** | Railway, Render, Fly.io | ✅ Limited | Full-stack apps |
| **PostgreSQL** | Supabase, Neon, Railway | ✅ Limited | Managed PostgreSQL |
| **MongoDB** | MongoDB Atlas | ✅ 512MB | Managed MongoDB |
| **Redis** | Upstash, Redis Cloud | ✅ Limited | Managed Redis |

---

## Frontend Deployment

### Option 1: Vercel (Recommended - Easiest)

**Why Vercel:**
- Zero configuration for Vite/React
- Automatic deployments from Git
- Free SSL certificates
- Global CDN
- Preview deployments for PRs

**Steps:**

1. **Install Vercel CLI**
```bash
npm install -g vercel
```

2. **Login to Vercel**
```bash
vercel login
```

3. **Deploy from web directory**
```bash
cd web
vercel
```

4. **Follow prompts:**
   - Set up and deploy: Yes
   - Which scope: Your account
   - Link to existing project: No
   - Project name: gymfu-web
   - Directory: ./
   - Override settings: No

5. **Set Environment Variables** (in Vercel Dashboard):
   - `VITE_API_URL`: Your backend URL (e.g., https://gymfu-api.railway.app)

6. **Production Deployment**
```bash
vercel --prod
```

**Vercel Configuration** (`web/vercel.json`):
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

### Option 2: Netlify

**Steps:**

1. **Install Netlify CLI**
```bash
npm install -g netlify-cli
```

2. **Login**
```bash
netlify login
```

3. **Deploy**
```bash
cd web
netlify deploy --prod
```

4. **Configuration** (`web/netlify.toml`):
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200

[build.environment]
  NODE_VERSION = "18"
```

---

### Option 3: Cloudflare Pages

**Steps:**

1. Go to https://pages.cloudflare.com/
2. Connect your GitHub repository
3. Configure build:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Root directory: `web`
4. Add environment variables
5. Deploy

---

## Backend Deployment

### Option 1: Railway (Recommended)

**Why Railway:**
- Easy PostgreSQL, MongoDB, Redis setup
- Automatic deployments from Git
- Free $5/month credit
- Simple environment management

**Steps:**

1. **Sign up**: https://railway.app/
2. **Create New Project** → Deploy from GitHub
3. **Select your repository**
4. **Add Services:**
   - PostgreSQL (click "New" → "Database" → "PostgreSQL")
   - MongoDB (click "New" → "Database" → "MongoDB")
   - Redis (click "New" → "Database" → "Redis")

5. **Configure Backend Service:**
   - Root directory: `backend`
   - Build command: `npm install && npm run build`
   - Start command: `npm start`

6. **Set Environment Variables:**
```env
NODE_ENV=production
PORT=3000

# PostgreSQL (auto-filled by Railway)
POSTGRES_HOST=${{Postgres.PGHOST}}
POSTGRES_PORT=${{Postgres.PGPORT}}
POSTGRES_DB=${{Postgres.PGDATABASE}}
POSTGRES_USER=${{Postgres.PGUSER}}
POSTGRES_PASSWORD=${{Postgres.PGPASSWORD}}

# MongoDB (auto-filled by Railway)
MONGODB_URI=${{MongoDB.MONGO_URL}}

# Redis (auto-filled by Railway)
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}

# JWT
JWT_SECRET=your-production-secret-key-change-this
JWT_EXPIRY=7d
```

7. **Deploy**: Railway auto-deploys on git push

---

### Option 2: Render

**Steps:**

1. **Sign up**: https://render.com/
2. **Create Web Service** from GitHub
3. **Configure:**
   - Name: gymfu-backend
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: Free

4. **Add Databases:**
   - PostgreSQL: New → PostgreSQL
   - Use external MongoDB Atlas
   - Use external Upstash Redis

5. **Environment Variables**: Same as Railway

---

### Option 3: Fly.io

**Steps:**

1. **Install Fly CLI**
```bash
curl -L https://fly.io/install.sh | sh
```

2. **Login**
```bash
fly auth login
```

3. **Create app**
```bash
cd backend
fly launch
```

4. **Deploy**
```bash
fly deploy
```

---

## Database Hosting

### PostgreSQL Options

#### Option 1: Supabase (Recommended)
- Free tier: 500MB database
- Built-in PostGIS support
- Automatic backups
- https://supabase.com/

**Setup:**
1. Create project at supabase.com
2. Get connection string from Settings → Database
3. Update `POSTGRES_*` env variables

#### Option 2: Neon
- Serverless PostgreSQL
- Free tier: 3GB storage
- https://neon.tech/

#### Option 3: Railway PostgreSQL
- Included with Railway backend
- $5/month credit covers small usage

---

### MongoDB Options

#### MongoDB Atlas (Recommended)
- Free tier: 512MB storage
- Global clusters
- https://www.mongodb.com/cloud/atlas

**Setup:**
1. Create cluster at mongodb.com/cloud/atlas
2. Create database user
3. Whitelist IP (0.0.0.0/0 for all)
4. Get connection string
5. Update `MONGODB_URI`

---

### Redis Options

#### Upstash (Recommended)
- Free tier: 10,000 commands/day
- Serverless Redis
- https://upstash.com/

**Setup:**
1. Create database at upstash.com
2. Get connection details
3. Update `REDIS_HOST` and `REDIS_PORT`

#### Redis Cloud
- Free tier: 30MB
- https://redis.com/try-free/

---

## CI/CD Setup

### GitHub Actions (Recommended)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy GYMFU

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  # Backend Tests
  backend-test:
    runs-on: ubuntu-latest
    
    services:
      postgres:
        image: postgis/postgis:14-3.2
        env:
          POSTGRES_PASSWORD: postgres
          POSTGRES_DB: gymfu_test
        ports:
          - 5432:5432
      
      mongodb:
        image: mongo:6
        ports:
          - 27017:27017
      
      redis:
        image: redis:7
        ports:
          - 6379:6379

    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json
      
      - name: Install dependencies
        run: |
          cd backend
          npm ci
      
      - name: Run tests
        run: |
          cd backend
          npm test
        env:
          NODE_ENV: test
          POSTGRES_HOST: localhost
          POSTGRES_PORT: 5432
          POSTGRES_DB: gymfu_test
          POSTGRES_USER: postgres
          POSTGRES_PASSWORD: postgres
          MONGODB_URI: mongodb://localhost:27017/gymfu_test
          REDIS_HOST: localhost
          REDIS_PORT: 6379
          JWT_SECRET: test-secret

  # Frontend Build
  frontend-build:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          cache: 'npm'
          cache-dependency-path: web/package-lock.json
      
      - name: Install dependencies
        run: |
          cd web
          npm ci
      
      - name: Build
        run: |
          cd web
          npm run build
        env:
          VITE_API_URL: ${{ secrets.VITE_API_URL }}
      
      - name: Upload build artifacts
        uses: actions/upload-artifact@v3
        with:
          name: web-build
          path: web/dist

  # Deploy to Vercel
  deploy-frontend:
    needs: [frontend-build]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Download build artifacts
        uses: actions/download-artifact@v3
        with:
          name: web-build
          path: web/dist
      
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          working-directory: ./web
          vercel-args: '--prod'

  # Deploy Backend (Railway auto-deploys, this is for manual trigger)
  deploy-backend:
    needs: [backend-test]
    runs-on: ubuntu-latest
    if: github.ref == 'refs/heads/main'
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Trigger Railway Deployment
        run: |
          curl -X POST ${{ secrets.RAILWAY_WEBHOOK_URL }}
```

---

### Setup GitHub Secrets

Go to GitHub Repository → Settings → Secrets and variables → Actions

Add these secrets:

```
VERCEL_TOKEN=your-vercel-token
VERCEL_ORG_ID=your-org-id
VERCEL_PROJECT_ID=your-project-id
VITE_API_URL=https://your-backend-url.com
RAILWAY_WEBHOOK_URL=your-railway-webhook (optional)
```

**Get Vercel Token:**
```bash
vercel login
vercel whoami
# Go to https://vercel.com/account/tokens
```

---

### Alternative: Vercel + Railway Auto-Deploy

**Simpler Option** (No GitHub Actions needed):

1. **Connect Vercel to GitHub**:
   - Go to vercel.com
   - Import your repository
   - Select `web` as root directory
   - Auto-deploys on every push to main

2. **Connect Railway to GitHub**:
   - Go to railway.app
   - Create project from GitHub
   - Select `backend` as root directory
   - Auto-deploys on every push to main

---

## Domain & SSL

### Custom Domain Setup

#### For Vercel (Frontend):
1. Go to Project Settings → Domains
2. Add your domain (e.g., `gymfu.com`)
3. Update DNS records as instructed
4. SSL is automatic

#### For Railway (Backend):
1. Go to Project → Settings → Domains
2. Add custom domain (e.g., `api.gymfu.com`)
3. Update DNS CNAME record
4. SSL is automatic

---

## Production Checklist

### Before Deploying:

- [ ] Update all environment variables for production
- [ ] Change JWT_SECRET to a strong random string
- [ ] Set NODE_ENV=production
- [ ] Enable CORS for your frontend domain only
- [ ] Set up database backups
- [ ] Configure error monitoring (Sentry)
- [ ] Set up logging (LogRocket, Datadog)
- [ ] Test all API endpoints
- [ ] Test frontend on production build
- [ ] Set up monitoring/alerts
- [ ] Configure rate limiting
- [ ] Review security headers
- [ ] Set up CDN for static assets
- [ ] Configure database connection pooling
- [ ] Set up health check endpoints

### Security Updates:

**Backend** (`backend/src/index.ts`):
```typescript
// Update CORS for production
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? ['https://gymfu.com', 'https://www.gymfu.com']
    : '*',
  credentials: true,
}));
```

---

## Cost Estimates

### Free Tier (Good for MVP):
- Frontend (Vercel): Free
- Backend (Railway): $5/month credit
- PostgreSQL (Supabase): Free (500MB)
- MongoDB (Atlas): Free (512MB)
- Redis (Upstash): Free (10k commands/day)
- **Total: $0-5/month**

### Paid Tier (Production):
- Frontend (Vercel Pro): $20/month
- Backend (Railway): ~$10-20/month
- PostgreSQL (Supabase Pro): $25/month
- MongoDB (Atlas M10): $57/month
- Redis (Upstash): $10/month
- **Total: ~$122-152/month**

---

## Quick Start Commands

### Deploy Everything:

```bash
# 1. Deploy Frontend to Vercel
cd web
vercel --prod

# 2. Deploy Backend to Railway
# (Push to GitHub, Railway auto-deploys)
git add .
git commit -m "Deploy to production"
git push origin main

# 3. Run database migrations
# SSH into Railway or use Railway CLI
npm run migrate
```

---

## Monitoring & Maintenance

### Recommended Tools:
- **Error Tracking**: Sentry (sentry.io)
- **Uptime Monitoring**: UptimeRobot (uptimerobot.com)
- **Analytics**: Google Analytics, Plausible
- **Performance**: Lighthouse CI
- **Logs**: Railway logs, Vercel logs

### Health Check Endpoint:
Already implemented at `/health` and `/health/db`

---

## Troubleshooting

### Common Issues:

**1. CORS Errors:**
- Update backend CORS origin to match frontend URL
- Check environment variables

**2. Database Connection Fails:**
- Verify connection strings
- Check IP whitelist (MongoDB Atlas)
- Ensure databases are running

**3. Build Fails:**
- Check Node version (use 18.x)
- Clear cache: `npm ci` instead of `npm install`
- Check environment variables

**4. 404 on Refresh:**
- Add rewrite rules (see Vercel/Netlify config above)

---

## Next Steps

1. Choose hosting providers
2. Set up accounts
3. Deploy backend first
4. Deploy frontend with backend URL
5. Set up custom domain
6. Configure CI/CD
7. Set up monitoring
8. Test thoroughly
9. Go live! 🚀

---

## Support Resources

- Vercel Docs: https://vercel.com/docs
- Railway Docs: https://docs.railway.app/
- Render Docs: https://render.com/docs
- GitHub Actions: https://docs.github.com/actions

---

**Need help?** Check the troubleshooting section or reach out to the hosting provider's support.
