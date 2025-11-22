# Windows Database Access Guide for GYMFU

Quick guide for accessing databases on Windows without command-line tools.

## Easiest Method: Use GUI Tools (No CLI Required)

### 1. PostgreSQL - Use pgAdmin

**Download & Install:**
1. Download pgAdmin: https://www.pgadmin.org/download/pgadmin-4-windows/
2. Run the installer
3. Open pgAdmin 4

**Connect to Database:**
1. Right-click "Servers" → "Register" → "Server"
2. **General Tab**:
   - Name: `GYMFU Local`
3. **Connection Tab**:
   - Host: `localhost`
   - Port: `5432`
   - Database: `gymfu`
   - Username: `postgres`
   - Password: `postgres`
4. Click "Save"
5. Expand: Servers → GYMFU Local → Databases → gymfu → Schemas → public → Tables

**View Data:**
- Right-click on "users" table → "View/Edit Data" → "All Rows"
- Right-click on "gyms" table → "View/Edit Data" → "All Rows"

---

### 2. MongoDB - Use MongoDB Compass

**Download & Install:**
1. Download Compass: https://www.mongodb.com/try/download/compass
2. Run the installer
3. Open MongoDB Compass

**Connect to Database:**
1. In the connection string field, paste:
   ```
   mongodb://localhost:27017/gymfu
   ```
2. Click "Connect"
3. You'll see the "gymfu" database
4. Click on collections: users, sessions, otps, notifications

**View Data:**
- Click on any collection name to see documents
- Use the filter bar to search (e.g., `{ role: "partner" }`)
- Click on documents to edit them

---

### 3. Redis - Use RedisInsight

**Download & Install:**
1. Download RedisInsight: https://redis.com/redis-enterprise/redis-insight/
2. Run the installer
3. Open RedisInsight

**Connect to Database:**
1. Click "Add Redis Database"
2. Fill in:
   - Host: `localhost`
   - Port: `6379`
   - Database Alias: `GYMFU Local`
3. Click "Add Redis Database"

**View Data:**
- Click on "GYMFU Local"
- Browse keys in the left panel
- Click on any key to see its value
- Use the search bar to filter keys

---

## Alternative: Use VS Code Extensions

### PostgreSQL Extension

1. Open VS Code
2. Go to Extensions (Ctrl+Shift+X)
3. Search for "PostgreSQL" by Chris Kolkman
4. Install it
5. Click the PostgreSQL icon in the sidebar
6. Click "+" to add connection
7. Enter: `postgresql://postgres:postgres@localhost:5432/gymfu`

### MongoDB Extension

1. In VS Code Extensions
2. Search for "MongoDB for VS Code"
3. Install it
4. Click MongoDB icon in sidebar
5. Click "Add Connection"
6. Enter: `mongodb://localhost:27017/gymfu`

---

## Check Database Status (Windows)

### Check if Services are Running

**Method 1: Services App**
1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Look for:
   - PostgreSQL (postgresql-x64-14 or similar)
   - MongoDB Server
   - Redis

**Method 2: Task Manager**
1. Press `Ctrl + Shift + Esc`
2. Go to "Services" tab
3. Look for PostgreSQL, MongoDB, Redis

**Method 3: PowerShell**
```powershell
# Check PostgreSQL
Get-Service | Where-Object {$_.Name -like "*postgres*"}

# Check MongoDB
Get-Service | Where-Object {$_.Name -like "*mongo*"}

# Check Redis
Get-Service | Where-Object {$_.Name -like "*redis*"}
```

---

## Start/Stop Database Services (Windows)

### Using Services App

1. Press `Win + R`
2. Type `services.msc` and press Enter
3. Find the service (PostgreSQL, MongoDB, or Redis)
4. Right-click → Start/Stop/Restart

### Using PowerShell (Run as Administrator)

```powershell
# Start PostgreSQL
Start-Service postgresql-x64-14

# Start MongoDB
Start-Service MongoDB

# Start Redis
Start-Service Redis

# Stop services
Stop-Service postgresql-x64-14
Stop-Service MongoDB
Stop-Service Redis
```

---

## Quick Database Check via Backend API

Since your backend is running, you can check database status without any tools:

**Open in Browser:**
```
http://localhost:3000/health/db
```

This will show you if all three databases are connected.

---

## View Sample Data

### Check Users Table (PostgreSQL)

**Using pgAdmin:**
1. Navigate to: Servers → GYMFU Local → Databases → gymfu → Schemas → public → Tables
2. Right-click "users" → "View/Edit Data" → "All Rows"

**Sample Query in pgAdmin:**
```sql
SELECT id, email, role, is_verified, created_at 
FROM users 
ORDER BY created_at DESC;
```

### Check Users Collection (MongoDB)

**Using MongoDB Compass:**
1. Connect to `mongodb://localhost:27017/gymfu`
2. Click on "users" collection
3. You'll see all user documents

**Filter Examples:**
- Find partners: `{ role: "partner" }`
- Find verified users: `{ isVerified: true }`
- Find by email: `{ email: "admin@gymfu.com" }`

### Check Redis Keys

**Using RedisInsight:**
1. Connect to localhost:6379
2. Browse keys in the left panel
3. Keys starting with `session:` are user sessions
4. Keys starting with `otp:` are OTP codes

---

## Install CLI Tools (Optional)

If you want to use command-line tools later:

### PostgreSQL (psql)

Already installed with PostgreSQL. Add to PATH:
1. Find PostgreSQL bin folder (usually `C:\Program Files\PostgreSQL\14\bin`)
2. Add to System PATH environment variable
3. Restart terminal

### MongoDB (mongosh)

Download from: https://www.mongodb.com/try/download/shell
Or use MongoDB Compass (includes mongosh)

### Redis (redis-cli)

Download Redis for Windows: https://github.com/microsoftarchive/redis/releases
Or use RedisInsight (includes CLI)

---

## Common Database Locations on Windows

### PostgreSQL Data Directory
```
C:\Program Files\PostgreSQL\14\data
```

### MongoDB Data Directory
```
C:\Program Files\MongoDB\Server\6.0\data
```

### Redis Data Directory
```
C:\Program Files\Redis
```

---

## Troubleshooting

### "Cannot connect to database"

1. **Check if service is running:**
   - Open Services (services.msc)
   - Find the database service
   - Make sure Status is "Running"

2. **Check firewall:**
   - Windows Firewall might be blocking connections
   - Add exception for ports: 5432 (PostgreSQL), 27017 (MongoDB), 6379 (Redis)

3. **Check backend logs:**
   - Your backend should show connection errors
   - Look at the terminal where backend is running

### "Access Denied"

- Make sure you're using correct credentials:
  - PostgreSQL: username `postgres`, password `postgres`
  - MongoDB: no authentication by default
  - Redis: no authentication by default

### "Port already in use"

- Another application might be using the port
- Check with: `netstat -ano | findstr :5432` (replace with your port)
- Stop the conflicting service or change port in .env

---

## Quick Reference

| Database | GUI Tool | Connection |
|----------|----------|------------|
| PostgreSQL | pgAdmin | localhost:5432, user: postgres, pass: postgres |
| MongoDB | Compass | mongodb://localhost:27017/gymfu |
| Redis | RedisInsight | localhost:6379 |

**Backend Health Check:**
```
http://localhost:3000/health/db
```

---

## Recommended Setup for Windows

1. **Install pgAdmin** for PostgreSQL
2. **Install MongoDB Compass** for MongoDB  
3. **Install RedisInsight** for Redis
4. **Use VS Code extensions** for quick access

No command-line tools needed!
