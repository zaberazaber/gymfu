# Quick Admin Login Reference

## 🚀 Instant Login

### Default Admin Account
```
Email: admin@varzio.com
Password: (any or leave empty)
```

### Magic Rule
**Any email with `@varzio` = Instant Login!**

## ✨ NEW: Auto-Detection UI

**Just type `@varzio` in the email field and watch:**
- ✅ UI automatically transforms to admin mode
- ✅ Checkbox disappears
- ✅ Purple admin badge appears
- ✅ Password becomes optional
- ✅ Button changes to "🚀 Admin Login"

## 📱 Mobile App

1. Open GymFu app
2. Tap "Email" tab
3. Type: `admin@varzio.com`
4. **Watch UI transform automatically!**
5. Leave password empty or type anything
6. Tap "🚀 Admin Login"
7. ✅ Done!

## 💻 Web App

1. Go to http://localhost:5173/login
2. Click "Email" tab
3. Type: `admin@varzio.com`
4. **Watch UI transform automatically!**
5. Leave password empty or type anything
6. Click "🚀 Admin Login"
7. ✅ Done!

## 🎯 Quick Test Accounts

Create instantly by logging in with:
- `dev@varzio.com` + any password
- `test@varzio.com` + any password
- `qa@varzio.com` + any password
- `yourname@varzio.com` + any password

## 🔧 Setup (One Time)

```bash
cd backend
npm run db:seed-admin
```

## ⚡ API Test

```bash
curl -X POST http://localhost:3000/api/v1/auth/login-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@varzio.com","password":"admin123"}'
```

## ✨ Features

- ✅ No OTP required
- ✅ Auto-creates users
- ✅ Works on mobile & web
- ✅ Instant access
- ✅ Perfect for development

## ⚠️ Remember

This is for **development only**. Disable before production!

---

**That's it! Just use any `@varzio` email and you're in!** 🎉
