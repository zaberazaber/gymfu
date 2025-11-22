# Railway Backend Deployment Guide for GYMFU

Complete step-by-step guide to deploy your Node.js backend with PostgreSQL, MongoDB, and Redis on Railway.

---

## Why Railway?

- ✅ All databases in one place (PostgreSQL, MongoDB, Redis)
- ✅ $5/month free credit
- ✅ Auto-deploy from GitHub
- ✅ Easy environment variable management
- ✅ Built-in monitoring and logs

---

## Prerequisites

- [x] GitHub account
- [x] Railway account (we'll create this)
- [x] Your code pushed to GitHub

---

## Step 1: Push Code to GitHub

If you haven't already, push your code to GitHub:

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - GYMFU app"

# Create repository on GitHub (go to github.com/new)
# Then link and push:
git remote add origin https://github.com/YOUR_USERNAME/gymfu.git
git branch -M main
git push -u origin main
```

---

## Step 2: Sign Up for Railway

1. Go to https://railway.app/
2. Click **"Start a New Project"**
3. Sign in with **GitHub** (recommended)
4. Authorize Railway to access your repositories

---

## Step 3: Create New Project

1. Click **"New Project"**
2. Select **"Deploy from GitHub repo"**
3. Choose your **gymfu** repository
4. Railway will detect your project

---

## Step 4: Add PostgreSQL Database

1. In your Railway project, click **"New"** → **"Database"** → **"Add PostgreSQL"**
2. Railway will create a PostgreSQL instance
3. Note: PostGIS extension will be added later

---

## Step 5: Add MongoDB Database

1. Click **"New"** → **"Database"** → **"Add MongoDB"**
2. Railway will create a MongoDB instance
3. Connection string will be auto-generated

---

## Step 6: Add Redis Database

1. Click **"New"** → **"Database"** → **"Add Redis"**
2. Railway will create a Redis instance
3. Connection details will be auto-generated

---

## Step 7: Configure Backend Service

1. Click on your **backend service** (the one from GitHub)
2. Go to **"Settings"**
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
   - **Watch Paths**: `backend/**`

---

## Step 8: Add Environment Variables

Click on your backend service → **"Variables"** tab

Add these variables:

```env
NODE_ENV=production
PORT=3000

# PostgreSQL (use Railway's reference variables)
POSTGRES_HOST=${{Postgres.PGHOST}}
POSTGRES_PORT=${{Postgres.PGPORT}}
POSTGRES_DB=${{Postgres.PGDATABASE}}
POSTGRES_USER=${{Postgres.PGUSER}}
POSTGRES_PASSWORD=${{Postgres.PGPASSWORD}}

# MongoDB (use Railway's reference variables)
MONGODB_URI=${{MongoDB.MONGO_URL}}

# Redis (use Railway's reference variables)
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}

# JWT Secret (generate a strong random string)
JWT_SECRET=your-super-secret-production-key-change-this-to-random-string
JWT_EXPIRY=7d
```

**To use Railway's reference variables:**
- Type `${{` and Railway will show autocomplete
- Select the database and field you need

---

## Step 9: Enable PostGIS Extension

After PostgreSQL is created:

1. Click on **PostgreSQL** service
2. Go to **"Data"** tab
3. Click **"Query"**
4. Run this SQL:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Or connect via command line:
```bash
# Get connection string from PostgreSQL service → Connect tab
psql postgresql://postgres:password@host:port/railway

# Then run:
CREATE EXTENSION IF NOT EXISTS postgis;
```

---

## Step 10: Create Database Tables

You need to run your database migrations. Two options:

### Option A: Using Railway CLI

1. Install Railway CLI:
```bash
npm install -g @railway/cli
```

2. Login:
```bash
railway login
```

3. Link to your project:
```bash
cd backend
railway link
```

4. Run migrations:
```bash
railway run npm run migrate
```

### Option B: Using One-Time Command

1. Go to backend service → **"Settings"**
2. Scroll to **"Deploy"** section
3. Add **"Custom Start Command"** temporarily:
```bash
npm run migrate && npm start
```
4. Deploy
5. After first deploy, change back to: `npm start`

---

## Step 11: Deploy

Railway will automatically deploy when you:
- Push to GitHub
- Change environment variables
- Manually trigger deployment

**Manual Deploy:**
1. Go to your backend service
2. Click **"Deploy"** button
3. Wait for build to complete (2-5 minutes)

---

## Step 12: Get Your Backend URL

1. Click on your backend service
2. Go to **"Settings"** → **"Networking"**
3. Click **"Generate Domain"**
4. You'll get a URL like: `https://gymfu-backend-production.up.railway.app`

**Copy this URL** - you'll need it for the frontend!

---

## Step 13: Update Frontend Environment Variable

Now update your Vercel deployment with the backend URL:

```bash
# Add the production backend URL
vercel env add VITE_API_URL production

# When prompted, enter your Railway backend URL:
# https://gymfu-backend-production.up.railway.app

# Redeploy frontend
cd web
vercel --prod
```

---

## Step 14: Update CORS in Backend

Update your backend to allow your Vercel frontend:

**File: `backend/src/index.ts`**

```typescript
app.use(cors({
  origin: process.env.NODE_ENV === 'production' 
    ? [
        'https://web-mrihx0f7r-zubairs-projects-f8e9173e.vercel.app',
        'https://your-custom-domain.com' // if you have one
      ]
    : '*',
  credentials: true,
}));
```

Commit and push:
```bash
git add .
git commit -m "Update CORS for production"
git push
```

Railway will auto-deploy!

---

## Step 15: Seed Initial Data (Optional)

Run your seed scripts:

```bash
# Using Railway CLI
railway run npm run seed:admin
railway run npm run seed:gyms
```

Or create a one-time service:
1. Railway project → **"New"** → **"Empty Service"**
2. Add same environment variables
3. Set start command: `npm run seed:admin && npm run seed:gyms`
4. Deploy once, then delete the service

---

## Step 16: Test Your Deployment

1. **Test Backend Health:**
   ```bash
   curl https://your-backend-url.railway.app/health
   ```

2. **Test Database Connection:**
   ```bash
   curl https://your-backend-url.railway.app/health/db
   ```

3. **Test Frontend:**
   - Open your Vercel URL
   - Try registering a user
   - Try logging in
   - Check if gyms load

---

## Monitoring & Logs

### View Logs

1. Click on your backend service
2. Go to **"Deployments"** tab
3. Click on latest deployment
4. View **"Build Logs"** and **"Deploy Logs"**

### Monitor Resources

1. Go to **"Metrics"** tab
2. View CPU, Memory, Network usage

### Set Up Alerts

1. Go to **"Settings"** → **"Notifications"**
2. Add webhook or email for deployment notifications

---

## Cost Estimate

Railway pricing:
- **Free Tier**: $5/month credit
- **Usage-based**: ~$0.000463/GB-hour for compute
- **Databases**: Included in compute costs

**Estimated monthly cost:**
- Small app: $5-10/month (covered by free credit)
- Medium traffic: $10-20/month
- High traffic: $20-50/month

---

## Automatic Deployments

Railway automatically deploys when you push to GitHub!

```bash
# Make changes
git add .
git commit -m "Update feature"
git push

# Railway automatically:
# 1. Detects push
# 2. Builds backend
# 3. Runs tests (if configured)
# 4. Deploys to production
```

---

## Environment-Specific Deployments

### Production (main branch)
```bash
git push origin main
```

### Staging (develop branch)
1. Create new Railway environment
2. Link to `develop` branch
3. Push to develop:
```bash
git push origin develop
```

---

## Troubleshooting

### Build Fails

**Check logs:**
1. Go to Deployments → Latest → Build Logs
2. Look for errors

**Common issues:**
- Missing dependencies: `npm install` in backend
- TypeScript errors: Fix and push
- Wrong Node version: Add to `package.json`:
  ```json
  "engines": {
    "node": "18.x"
  }
  ```

### Database Connection Fails

**Check variables:**
1. Go to Variables tab
2. Verify all database variables are set
3. Use Railway's reference variables: `${{Postgres.PGHOST}}`

**Test connection:**
```bash
railway run node -e "require('./src/config/database').testPostgresConnection()"
```

### App Crashes on Start

**Check logs:**
1. Deploy Logs tab
2. Look for startup errors

**Common issues:**
- Missing environment variables
- Database not ready (add retry logic)
- Port already in use (Railway handles this)

### CORS Errors

Update CORS origins in `backend/src/index.ts`:
```typescript
origin: [
  'https://your-vercel-url.vercel.app',
  'https://your-custom-domain.com'
]
```

---

## Database Backups

### Automatic Backups

Railway automatically backs up databases.

### Manual Backup

**PostgreSQL:**
```bash
# Get connection string from Railway
railway run pg_dump $DATABASE_URL > backup.sql
```

**MongoDB:**
```bash
railway run mongodump --uri=$MONGODB_URI --out=./backup
```

---

## Scaling

### Vertical Scaling (More Resources)

1. Go to Service → Settings
2. Adjust resources (Railway auto-scales)

### Horizontal Scaling (Multiple Instances)

1. Railway Pro plan required
2. Go to Settings → Scaling
3. Add replicas

---

## Security Checklist

- [ ] Change JWT_SECRET to strong random string
- [ ] Update CORS to specific domains
- [ ] Enable HTTPS only (Railway does this automatically)
- [ ] Set up rate limiting
- [ ] Review database access (Railway handles this)
- [ ] Enable 2FA on Railway account
- [ ] Set up monitoring/alerts
- [ ] Regular security updates

---

## Next Steps

1. ✅ Backend deployed on Railway
2. ✅ Databases configured
3. ✅ Frontend updated with backend URL
4. 🔄 Test end-to-end functionality
5. 🔄 Set up custom domain
6. 🔄 Configure CI/CD pipeline
7. 🔄 Set up monitoring (Sentry, LogRocket)
8. 🔄 Deploy mobile app

---

## Useful Railway Commands

```bash
# Install CLI
npm install -g @railway/cli

# Login
railway login

# Link project
railway link

# View logs
railway logs

# Run command in Railway environment
railway run <command>

# Open project in browser
railway open

# View variables
railway variables

# Add variable
railway variables set KEY=value
```

---

## Support Resources

- Railway Docs: https://docs.railway.app/
- Railway Discord: https://discord.gg/railway
- Railway Status: https://status.railway.app/
- Railway Blog: https://blog.railway.app/

---

## Summary

Your GYMFU backend is now:
- ✅ Deployed on Railway
- ✅ Connected to PostgreSQL (with PostGIS)
- ✅ Connected to MongoDB
- ✅ Connected to Redis
- ✅ Auto-deploying from GitHub
- ✅ Accessible via HTTPS
- ✅ Monitored and logged

**Your Stack:**
- Frontend: Vercel (https://web-mrihx0f7r-zubairs-projects-f8e9173e.vercel.app)
- Backend: Railway (https://your-backend.railway.app)
- Databases: Railway (PostgreSQL, MongoDB, Redis)

🎉 **You're live in production!**
