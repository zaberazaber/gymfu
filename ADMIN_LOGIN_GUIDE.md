# Admin Login Guide - Development Mode

## Quick Start

### Admin Credentials
```
Email: admin@varzio.com
Password: admin123
```

Or use **ANY** email with `@varzio` domain - it will auto-login!

## How It Works

### Magic @varzio Login
Any email containing `@varzio` will bypass normal authentication:

**Examples that work:**
- `admin@varzio.com`
- `test@varzio.com`
- `dev@varzio.io`
- `john@varzio.dev`
- `anything@varzio`

**What happens:**
1. You enter an email with `@varzio` and any password
2. Backend checks if user exists
3. If not, creates the user automatically
4. Logs you in immediately without OTP or password verification
5. Returns a valid JWT token

## Using Admin Login

### Web App
1. Go to Login page
2. Enter: `admin@varzio.com`
3. Enter any password (or `admin123`)
4. Click "Login with Password"
5. ✅ Logged in instantly!

### Mobile App
1. Open the app
2. Go to Login screen
3. Enter: `admin@varzio.com`
4. Enter any password (or `admin123`)
5. Tap "Login with Password"
6. ✅ Logged in instantly!

## Creating More Admin Users

### Method 1: Auto-Create on Login
Just login with any `@varzio` email:
```
Email: myname@varzio.com
Password: anything
```
User will be created automatically!

### Method 2: Run Seed Script
```bash
cd backend
npm run db:seed-admin
```

### Method 3: Manual Database Insert
```sql
INSERT INTO users (email, name, password, created_at, updated_at)
VALUES (
  'newadmin@varzio.com',
  'New Admin',
  '$2b$10$hashedpassword',
  NOW(),
  NOW()
);
```

## Security Notes

### ⚠️ Development Only
This feature is for **development and testing only**. 

**For production:**
1. Remove or disable the `@varzio` bypass logic
2. Use proper authentication for all users
3. Implement role-based access control

### Where to Disable
File: `backend/src/controllers/authController.ts`

Find and remove/comment this section:
```typescript
// Admin bypass for development: @varzio emails
const isVarzioAdmin = email && email.includes('@varzio');

if (isVarzioAdmin) {
  // ... bypass logic
}
```

## Testing Scenarios

### Test 1: Quick Login
```
Email: test@varzio.com
Password: test123
Result: ✅ Instant login
```

### Test 2: Multiple Admins
```
User 1: admin@varzio.com
User 2: dev@varzio.com
User 3: qa@varzio.com
Result: ✅ All work independently
```

### Test 3: Regular User
```
Email: user@gmail.com
Password: password123
Result: ❌ Normal auth flow (OTP required)
```

## API Endpoint

### POST /api/v1/auth/login/password

**Request:**
```json
{
  "email": "admin@varzio.com",
  "password": "admin123"
}
```

**Response (Admin):**
```json
{
  "success": true,
  "data": {
    "token": "eyJhbGciOiJIUzI1NiIs...",
    "user": {
      "id": 11,
      "email": "admin@varzio.com",
      "name": "admin",
      "phoneNumber": null,
      "createdAt": "2025-11-13T19:21:44.123Z"
    }
  },
  "message": "Admin login successful (development mode)",
  "timestamp": "2025-11-13T19:21:44.456Z"
}
```

## Troubleshooting

### "Invalid email or password"
- Make sure email contains `@varzio`
- Check backend logs for errors
- Verify database connection

### User not created
- Check database permissions
- Verify users table exists
- Check backend logs

### Token not working
- Verify JWT_SECRET in .env
- Check token expiration
- Ensure authMiddleware is working

## Code Reference

### Backend Logic
```typescript
// backend/src/controllers/authController.ts
static async loginWithPassword(req: Request, res: Response) {
  const { email, password } = req.body;
  
  // Admin bypass
  const isVarzioAdmin = email && email.includes('@varzio');
  
  if (isVarzioAdmin) {
    let user = await UserModel.findByEmail(email);
    
    if (!user) {
      // Auto-create admin user
      const hashedPassword = await bcrypt.hash(password || 'admin123', 10);
      user = await UserModel.create({
        email,
        name: email.split('@')[0],
        password: hashedPassword,
      });
    }
    
    const token = JWTService.generateToken(user);
    return res.json({ success: true, data: { token, user } });
  }
  
  // Regular auth flow...
}
```

## Benefits

✅ **Fast Development** - No OTP waiting
✅ **Easy Testing** - Multiple test accounts instantly
✅ **No Setup** - Auto-creates users on demand
✅ **Flexible** - Use any @varzio email
✅ **Reversible** - Easy to disable for production

## Best Practices

1. **Use for development only**
2. **Don't commit @varzio emails to production**
3. **Document which emails are test accounts**
4. **Clean up test users periodically**
5. **Disable before deploying to production**

## Quick Commands

```bash
# Seed default admin user
npm run db:seed-admin

# Check if admin exists
psql -d gymfu -c "SELECT * FROM users WHERE email LIKE '%@varzio%';"

# Delete all admin users
psql -d gymfu -c "DELETE FROM users WHERE email LIKE '%@varzio%';"

# Create custom admin
psql -d gymfu -c "INSERT INTO users (email, name, password) VALUES ('custom@varzio.com', 'Custom Admin', '\$2b\$10\$hash');"
```

## Summary

The `@varzio` admin bypass makes development faster by:
- Skipping OTP verification
- Auto-creating users
- Instant login
- No password validation

Perfect for rapid development and testing! 🚀
