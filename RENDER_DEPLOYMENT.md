# Deploy Backend to Render (Easier Alternative)

Render works great with monorepos and is easier than Railway for this setup.

---

## 🚀 Quick Deployment Steps

### Step 1: Sign Up for Render

1. Go to https://render.com/
2. Click **"Get Started"**
3. Sign up with **GitHub** (recommended)
4. Authorize Render to access your repositories

---

### Step 2: Create Web Service

1. Click **"New +"** → **"Web Service"**
2. Connect your **gymfu** repository
3. Click **"Connect"** next to your repo

---

### Step 3: Configure Service

Fill in these settings:

**Basic Settings:**
- **Name**: `gymfu-backend`
- **Region**: Choose closest to you
- **Branch**: `main` or `task_3_10`
- **Root Directory**: `backend`
- **Runtime**: `Node`

**Build & Deploy:**
- **Build Command**: `npm install && npm run build`
- **Start Command**: `npm start`

**Instance Type:**
- Select **"Free"** (for now)

Click **"Advanced"** to add environment variables (next step)

---

### Step 4: Add Environment Variables

Click **"Add Environment Variable"** for each:

```env
NODE_ENV=production
PORT=10000

# We'll add database URLs after creating them
JWT_SECRET=your-super-secret-random-string-change-this
JWT_EXPIRY=7d
```

**Don't click "Create Web Service" yet!** We need to set up databases first.

---

### Step 5: Create PostgreSQL Database

1. Go back to Render Dashboard
2. Click **"New +"** → **"PostgreSQL"**
3. Configure:
   - **Name**: `gymfu-postgres`
   - **Database**: `gymfu`
   - **User**: `gymfu`
   - **Region**: Same as web service
   - **Plan**: **Free**
4. Click **"Create Database"**
5. Wait for it to provision (1-2 minutes)
6. **Copy the "Internal Database URL"** (starts with `postgresql://`)

---

### Step 6: Create MongoDB Database

Render doesn't offer MongoDB, so use **MongoDB Atlas** (free):

1. Go to https://www.mongodb.com/cloud/atlas/register
2. Sign up (free)
3. Create a **Free Cluster**
4. Create **Database User** (username/password)
YkOsdWVguHutM6yo
5. **Network Access** → Add IP: `0.0.0.0/0` (allow all)
6. Click **"Connect"** → **"Connect your application"**
7. **Copy the connection string**
8. Replace `<password>` with your database password
9. Replace `<dbname>` with `gymfu`
Example: `mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/gymfu`

---

### Step 7: Create Redis Database

Use **Upstash** (free Redis):

1. Go to https://upstash.com/
2. Sign up with GitHub
3. Click **"Create Database"**
4. Configure:
   - **Name**: `gymfu-redis`
   - **Type**: Regional
   - **Region**: Choose closest
5. Click **"Create"**
6. Copy **"Endpoint"** (the host, e.g., `us1-xxx.upstash.io`)
7. Copy **"Port"** (usually `6379` or `37859`)
8. Copy **"Password"**

---

### Step 8: Update Environment Variables

Go back to your Render Web Service configuration:

Add these database variables:

```env
# PostgreSQL (from Render PostgreSQL)
POSTGRES_HOST=<from Internal Database URL>
POSTGRES_PORT=5432
POSTGRES_DB=gymfu
POSTGRES_USER=<from Internal Database URL>
POSTGRES_PASSWORD=<from Internal Database URL>

# Or use the full connection string and parse it
# Easier: Just use individual values from the URL

# MongoDB (from Atlas)
MONGODB_URI=mongodb+srv://user:password@cluster0.xxxxx.mongodb.net/gymfu

# Redis (from Upstash)
REDIS_HOST=us1-xxx.upstash.io
REDIS_PORT=6379
REDIS_PASSWORD=your-upstash-password
```

**Tip:** For PostgreSQL, the Internal Database URL looks like:
```
postgresql://user:password@host:5432/database
postgresql://gymfu:XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX@dpg-d4grar7diees73b4etf0-a/gymfu
```

Extract:
- POSTGRES_HOST = host part
- POSTGRES_USER = user part
- POSTGRES_PASSWORD = password part
- POSTGRES_DB = database part

---

### Step 9: Create Web Service

Now click **"Create Web Service"**

Render will:
1. Clone your repo
2. Install dependencies
3. Build your app
4. Start the server

This takes 3-5 minutes.

---

### Step 10: Enable PostGIS Extension

After PostgreSQL is created:

1. Go to your PostgreSQL database in Render
2. Click **"Connect"** → **"External Connection"**
3. Use the provided command or connection string
4. Connect with a PostgreSQL client (pgAdmin, DBeaver, or psql)
5. Run:

```sql
CREATE EXTENSION IF NOT EXISTS postgis;
```

Or use Render's **"Shell"** tab:
```bash
psql $DATABASE_URL -c "CREATE EXTENSION IF NOT EXISTS postgis;"
```

---

### Step 11: Get Your Backend URL

After deployment succeeds:

1. Go to your web service dashboard
2. Find your URL at the top (e.g., `https://gymfu-backend.onrender.com`)
3. **Copy this URL** - you'll need it for the frontend!

---

### Step 12: Test Your Backend

```bash
# Test health endpoint
curl https://gymfu-backend.onrender.com/health

# Test database connection
curl https://gymfu-backend.onrender.com/health/db
```

You should see:
```json
{
  "status": "healthy",
  "databases": {
    "postgres": "connected",
    "mongodb": "connected",
    "redis": "connected"
  }
}
```

---

### Step 13: Update Frontend

Update your Vercel deployment with the Render backend URL:

```bash
# Remove old variable
vercel env rm VITE_API_URL production

# Add new variable with Render URL
vercel env add VITE_API_URL production
# Enter: https://gymfu-backend.onrender.com

# Redeploy frontend
cd web
vercel --prod
```

---

### Step 14: Update CORS

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
git add backend/src/index.ts
git commit -m "Update CORS for production"
git push
```

Render will auto-deploy!

---

## ✅ Deployment Complete!

Your stack is now:
- ✅ Frontend: Vercel
- ✅ Backend: Render
- ✅ PostgreSQL: Render
- ✅ MongoDB: Atlas
- ✅ Redis: Upstash

---

## 🔄 Auto-Deployment

Render automatically deploys when you push to GitHub!

```bash
git add .
git commit -m "Update feature"
git push
```

Render detects the push and redeploys automatically.

---

## 💰 Cost

**Free Tier:**
- Render Web Service: Free (spins down after 15 min inactivity)
- Render PostgreSQL: Free (90 days, then $7/month)
- MongoDB Atlas: Free (512MB)
- Upstash Redis: Free (10k commands/day)

**Note:** Free Render services spin down after inactivity. First request after spin-down takes 30-60 seconds.

**Upgrade to keep always-on:** $7/month for Render

---

## 📊 Monitoring

### View Logs

1. Go to your web service
2. Click **"Logs"** tab
3. See real-time logs

### View Metrics

1. Click **"Metrics"** tab
2. See CPU, Memory, Response times

### Set Up Alerts

1. Go to **"Settings"**
2. Scroll to **"Notifications"**
3. Add email or Slack webhook

---

## 🐛 Troubleshooting

### Build Fails

**Check logs:**
1. Go to **"Events"** tab
2. Click on failed deploy
3. Read build logs

**Common fixes:**
- Ensure `backend/package.json` has `build` script
- Check TypeScript errors locally: `npm run build`
- Verify Node version in `package.json`:
  ```json
  "engines": {
    "node": "18.x"
  }
  ```

### App Crashes

**Check deploy logs:**
1. **"Logs"** tab
2. Look for startup errors

**Common issues:**
- Missing environment variables
- Database connection failed
- Port not set correctly (must use `process.env.PORT`)

### Database Connection Issues

**PostgreSQL:**
- Use Internal Database URL (not External)
- Check if PostGIS extension is enabled

**MongoDB:**
- Verify connection string
- Check IP whitelist (should be `0.0.0.0/0`)
- Ensure password doesn't have special characters

**Redis:**
- Verify host, port, and password
- Check Upstash dashboard for connection details

---

## 🚀 Next Steps

1. ✅ Backend deployed on Render
2. ✅ Databases configured
3. ✅ Frontend updated with backend URL
4. 🔄 Test end-to-end functionality
5. 🔄 Set up custom domain
6. 🔄 Add monitoring (Sentry)
7. 🔄 Deploy mobile app

---

## 📚 Resources

- Render Docs: https://render.com/docs
- MongoDB Atlas: https://docs.atlas.mongodb.com/
- Upstash Docs: https://docs.upstash.com/
- Render Community: https://community.render.com/

---

## Summary

Render is much easier than Railway for monorepos:
- ✅ Simple root directory configuration
- ✅ Clear build/start commands
- ✅ Great free tier
- ✅ Auto-deployment from GitHub
- ✅ Easy environment variables
- ✅ Built-in monitoring

**Your backend will be live at:** `https://gymfu-backend.onrender.com`

🎉 **Ready to deploy!**
