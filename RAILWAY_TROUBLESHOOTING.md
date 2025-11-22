# Railway Deployment Troubleshooting

## Issue: Deployment Failed When Selecting Repo

### Solution 1: Configure Root Directory

Railway needs to know your backend is in a subdirectory.

**Steps:**

1. In Railway, click on your service
2. Go to **Settings** tab
3. Scroll to **Source** section
4. Set **Root Directory** to: `backend`
5. Click **Save**
6. Go to **Deployments** tab
7. Click **Redeploy** button

---

### Solution 2: Use Railway Configuration Files

I've created configuration files for you:

- ✅ `railway.json` (root level)
- ✅ `backend/railway.toml` (backend specific)
- ✅ `backend/nixpacks.toml` (build configuration)

**Commit and push these files:**

```bash
git add railway.json backend/railway.toml backend/nixpacks.toml
git commit -m "Add Railway configuration files"
git push
```

Then in Railway:
1. Click **Redeploy** or wait for auto-deploy
2. Railway will use these configurations

---

### Solution 3: Manual Service Configuration

If automatic detection fails, configure manually:

1. **Settings** → **Build**:
   - Build Command: `npm install && npm run build`
   - Watch Paths: `backend/**`

2. **Settings** → **Deploy**:
   - Start Command: `npm start`

3. **Settings** → **Source**:
   - Root Directory: `backend`

---

### Solution 4: Check Build Logs

1. Go to **Deployments** tab
2. Click on the failed deployment
3. Check **Build Logs** for specific errors

**Common errors:**

#### Error: "Cannot find module"
```bash
# Solution: Ensure dependencies are installed
# In Settings → Build Command:
npm ci && npm run build
```

#### Error: "TypeScript compilation failed"
```bash
# Solution: Fix TypeScript errors locally first
cd backend
npm run build

# Fix any errors, then push
git add .
git commit -m "Fix TypeScript errors"
git push
```

#### Error: "Port already in use"
```bash
# Solution: Use Railway's PORT environment variable
# Already configured in backend/src/index.ts:
const PORT = process.env.PORT || 3000;
```

---

### Solution 5: Deploy Backend Only

If monorepo causes issues, deploy backend separately:

**Option A: Create separate backend repo**

```bash
# Create new repo for backend only
cd backend
git init
git add .
git commit -m "Backend only"
# Create new GitHub repo, then:
git remote add origin https://github.com/YOUR_USERNAME/gymfu-backend.git
git push -u origin main
```

Then in Railway:
- Deploy from the new backend-only repo
- No need for root directory configuration

**Option B: Use Railway CLI**

```bash
# Install Railway CLI
npm install -g @railway/cli

# Login
railway login

# Link to project
cd backend
railway link

# Deploy
railway up
```

---

### Solution 6: Environment Variables Issue

Make sure environment variables are set BEFORE first deployment:

1. Add databases first (PostgreSQL, MongoDB, Redis)
2. Then add environment variables
3. Then deploy backend service

**Required variables:**
```env
NODE_ENV=production
PORT=3000
POSTGRES_HOST=${{Postgres.PGHOST}}
POSTGRES_PORT=${{Postgres.PGPORT}}
POSTGRES_DB=${{Postgres.PGDATABASE}}
POSTGRES_USER=${{Postgres.PGUSER}}
POSTGRES_PASSWORD=${{Postgres.PGPASSWORD}}
MONGODB_URI=${{MongoDB.MONGO_URL}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
JWT_SECRET=your-secret-key-here
JWT_EXPIRY=7d
```

---

### Solution 7: Check Railway Service Limits

Free tier limits:
- $5/month credit
- 500 hours/month
- 512MB RAM
- 1GB disk

If you hit limits:
1. Check usage in Railway dashboard
2. Upgrade to Pro plan if needed
3. Or optimize your app

---

### Solution 8: Alternative - Use Render Instead

If Railway continues to fail, try Render:

1. Go to https://render.com/
2. **New** → **Web Service**
3. Connect GitHub repo
4. Configure:
   - Name: gymfu-backend
   - Root Directory: `backend`
   - Build Command: `npm install && npm run build`
   - Start Command: `npm start`
   - Instance Type: Free
5. Add environment variables
6. Create service

---

## Step-by-Step: Fresh Railway Deployment

### 1. Commit Configuration Files

```bash
git add railway.json backend/railway.toml backend/nixpacks.toml
git commit -m "Add Railway configuration"
git push
```

### 2. Create New Railway Project

1. Go to https://railway.app/
2. **New Project**
3. **Deploy from GitHub repo**
4. Select your repo

### 3. Configure Service

Railway should auto-detect with the config files. If not:

1. Click on service → **Settings**
2. **Root Directory**: `backend`
3. **Build Command**: `npm install && npm run build`
4. **Start Command**: `npm start`

### 4. Add Databases

1. **New** → **Database** → **PostgreSQL**
2. **New** → **Database** → **MongoDB**
3. **New** → **Database** → **Redis**

### 5. Add Environment Variables

Click on backend service → **Variables**:

```env
NODE_ENV=production
PORT=3000
POSTGRES_HOST=${{Postgres.PGHOST}}
POSTGRES_PORT=${{Postgres.PGPORT}}
POSTGRES_DB=${{Postgres.PGDATABASE}}
POSTGRES_USER=${{Postgres.PGUSER}}
POSTGRES_PASSWORD=${{Postgres.PGPASSWORD}}
MONGODB_URI=${{MongoDB.MONGO_URL}}
REDIS_HOST=${{Redis.REDIS_HOST}}
REDIS_PORT=${{Redis.REDIS_PORT}}
JWT_SECRET=change-this-to-random-string
JWT_EXPIRY=7d
```

### 6. Deploy

Click **Deploy** or push to GitHub to trigger deployment.

### 7. Check Logs

Go to **Deployments** → Latest → **Deploy Logs**

Look for:
- ✅ "Build successful"
- ✅ "Server is running on port..."
- ✅ "All databases connected successfully"

---

## Still Having Issues?

### Get Help:

1. **Railway Discord**: https://discord.gg/railway
2. **Railway Docs**: https://docs.railway.app/
3. **Check Status**: https://status.railway.app/

### Share Error Details:

When asking for help, provide:
- Build logs (copy from Railway)
- Deploy logs (copy from Railway)
- Your configuration (railway.json, package.json)
- Error messages

---

## Quick Test

Test if your backend works locally before deploying:

```bash
cd backend

# Install dependencies
npm install

# Build
npm run build

# Check if build succeeded
ls dist/

# Start
npm start

# Test in another terminal
curl http://localhost:3000/health
```

If this works locally, it should work on Railway with proper configuration.

---

## Summary

✅ Configuration files created
✅ Root directory set to `backend`
✅ Build and start commands configured
✅ Ready to deploy

**Next steps:**
1. Commit and push config files
2. Set root directory in Railway settings
3. Redeploy
4. Check logs for success

Your deployment should work now!
