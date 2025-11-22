# Vercel Deployment Steps for GYMFU Web App

## ✅ Prerequisites Completed
- [x] Vercel CLI installed
- [x] Build tested successfully
- [x] vercel.json configuration created

---

## Step-by-Step Deployment

### Step 1: Login to Vercel

Run this command in your terminal:

```bash
vercel login
```

This will:
1. Open your browser
2. Ask you to sign in with GitHub, GitLab, or Bitbucket
3. Authorize the Vercel CLI

**If you don't have a Vercel account:**
- Go to https://vercel.com/signup
- Sign up with GitHub (recommended)
- Then run `vercel login`

---

### Step 2: Deploy to Vercel

Navigate to the web directory and deploy:

```bash
cd web
vercel
```

**You'll be asked several questions:**

1. **"Set up and deploy"** → Press `Y` (Yes)

2. **"Which scope do you want to deploy to?"** → Select your account

3. **"Link to existing project?"** → Press `N` (No, create new)

4. **"What's your project's name?"** → Type: `gymfu-web` (or your preferred name)

5. **"In which directory is your code located?"** → Press Enter (current directory)

6. **"Want to override the settings?"** → Press `N` (No)

Vercel will now:
- Upload your code
- Build the project
- Deploy to a preview URL

---

### Step 3: Set Environment Variables

After deployment, you need to add your backend API URL:

**Option A: Via Vercel Dashboard (Recommended)**

1. Go to https://vercel.com/dashboard
2. Click on your `gymfu-web` project
3. Go to **Settings** → **Environment Variables**
4. Add:
   - **Name**: `VITE_API_URL`
   - **Value**: `http://localhost:3000` (for now, update later with production backend)
   - **Environment**: Select all (Production, Preview, Development)
5. Click **Save**

**Option B: Via CLI**

```bash
vercel env add VITE_API_URL
# When prompted, enter: http://localhost:3000
# Select: Production, Preview, Development
```

---

### Step 4: Deploy to Production

Now deploy to production with the environment variables:

```bash
vercel --prod
```

This will:
- Build with production settings
- Deploy to your production URL
- Give you a permanent URL like: `https://gymfu-web.vercel.app`

---

### Step 5: Test Your Deployment

1. Open the URL provided by Vercel (e.g., `https://gymfu-web.vercel.app`)
2. Test the following:
   - [ ] Homepage loads
   - [ ] Navigation works
   - [ ] Registration page loads
   - [ ] Login page loads
   - [ ] Gyms page loads

**Note:** API calls will fail until you deploy the backend and update `VITE_API_URL`

---

## Next Steps

### 1. Deploy Backend

You need to deploy your backend to get a production API URL. Options:

**Railway (Recommended):**
```bash
# 1. Sign up at railway.app
# 2. Connect GitHub repository
# 3. Select backend directory
# 4. Add PostgreSQL, MongoDB, Redis
# 5. Deploy
```

**Render:**
```bash
# 1. Sign up at render.com
# 2. Create Web Service from GitHub
# 3. Configure backend settings
# 4. Deploy
```

### 2. Update API URL

Once backend is deployed:

1. Get your backend URL (e.g., `https://gymfu-api.railway.app`)
2. Update Vercel environment variable:
   ```bash
   vercel env rm VITE_API_URL production
   vercel env add VITE_API_URL production
   # Enter your production backend URL
   ```
3. Redeploy:
   ```bash
   vercel --prod
   ```

### 3. Add Custom Domain (Optional)

1. Go to Vercel Dashboard → Your Project → Settings → Domains
2. Add your domain (e.g., `gymfu.com`)
3. Update DNS records as instructed
4. SSL certificate is automatic

---

## Useful Commands

```bash
# Check deployment status
vercel ls

# View deployment logs
vercel logs

# Remove a deployment
vercel rm [deployment-url]

# Open project in browser
vercel open

# View environment variables
vercel env ls

# Pull environment variables locally
vercel env pull
```

---

## Automatic Deployments (GitHub Integration)

For automatic deployments on every git push:

1. Go to https://vercel.com/dashboard
2. Click **"Add New..."** → **"Project"**
3. **Import Git Repository**
4. Select your GitHub repository
5. Configure:
   - **Root Directory**: `web`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
6. Add environment variables
7. Click **Deploy**

Now every push to `main` branch will auto-deploy!

---

## Troubleshooting

### Build Fails

**Error: "Module not found"**
```bash
cd web
npm install
vercel --prod
```

**Error: "Environment variable not set"**
```bash
vercel env add VITE_API_URL
vercel --prod
```

### 404 on Page Refresh

This is already fixed with `vercel.json` rewrites configuration.

### CORS Errors

Update your backend CORS settings to allow your Vercel domain:

```typescript
// backend/src/index.ts
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://gymfu-web.vercel.app',
    'https://your-custom-domain.com'
  ],
  credentials: true,
}));
```

---

## Current Status

✅ Vercel CLI installed
✅ Build successful
✅ Configuration files created
⏳ Ready to deploy

**Run these commands now:**

```bash
vercel login
cd web
vercel
```

Then follow the prompts!

---

## Support

- Vercel Docs: https://vercel.com/docs
- Vercel Support: https://vercel.com/support
- Community: https://github.com/vercel/vercel/discussions

---

**Your deployment URL will be:** `https://gymfu-web-[random].vercel.app`

After deployment, you can customize it in the Vercel dashboard!
