# Database Access Guide for GYMFU

This guide shows you how to access and manage PostgreSQL, MongoDB, and Redis databases.

## Database Connection Details

Based on your `.env` configuration:

### PostgreSQL
- **Host**: localhost
- **Port**: 5432
- **Database**: gymfu
- **Username**: postgres
- **Password**: postgres

### MongoDB
- **URI**: mongodb://localhost:27017/gymfu
- **Host**: localhost
- **Port**: 27017
- **Database**: gymfu

### Redis
- **Host**: localhost
- **Port**: 6379
- **No password** (default configuration)

---

## 1. PostgreSQL Access

### Option A: Command Line (psql)

```bash
# Connect to PostgreSQL
psql -h localhost -p 5432 -U postgres -d gymfu

# Or use the full connection string
psql postgresql://postgres:postgres@localhost:5432/gymfu
```

**Common Commands:**
```sql
-- List all tables
\dt

-- Describe a table structure
\d users
\d gyms

-- View all users
SELECT * FROM users;

-- View all gyms
SELECT * FROM gyms;

-- Check PostGIS extension
SELECT PostGIS_Version();

-- Exit psql
\q
```

### Option B: pgAdmin (GUI Tool)

1. **Download**: https://www.pgadmin.org/download/
2. **Install** and open pgAdmin
3. **Add Server**:
   - Right-click "Servers" → "Register" → "Server"
   - **General Tab**:
     - Name: GYMFU Local
   - **Connection Tab**:
     - Host: localhost
     - Port: 5432
     - Database: gymfu
     - Username: postgres
     - Password: postgres
4. **Connect** and browse your database

### Option C: DBeaver (Universal Database Tool)

1. **Download**: https://dbeaver.io/download/
2. **Install** and open DBeaver
3. **New Connection**:
   - Select PostgreSQL
   - Host: localhost
   - Port: 5432
   - Database: gymfu
   - Username: postgres
   - Password: postgres
4. **Test Connection** and **Finish**

### Option D: VS Code Extension

1. Install **PostgreSQL** extension by Chris Kolkman
2. Click the PostgreSQL icon in sidebar
3. Add connection:
   ```
   postgresql://postgres:postgres@localhost:5432/gymfu
   ```

---

## 2. MongoDB Access

### Option A: MongoDB Compass (GUI - Recommended)

1. **Download**: https://www.mongodb.com/try/download/compass
2. **Install** and open MongoDB Compass
3. **Connect** using URI:
   ```
   mongodb://localhost:27017/gymfu
   ```
4. **Browse Collections**:
   - users
   - sessions
   - otps
   - notifications

**Common Operations:**
- View documents: Click on collection name
- Filter: Use the filter bar (e.g., `{ role: "partner" }`)
- Add document: Click "Insert Document"
- Edit document: Click on document and modify
- Delete document: Hover and click trash icon

### Option B: Command Line (mongosh)

```bash
# Connect to MongoDB
mongosh mongodb://localhost:27017/gymfu

# Or connect and then select database
mongosh
use gymfu
```

**Common Commands:**
```javascript
// Show all collections
show collections

// View all users
db.users.find().pretty()

// Find specific user
db.users.findOne({ email: "admin@gymfu.com" })

// Count documents
db.users.countDocuments()

// View OTPs
db.otps.find().pretty()

// Delete old OTPs
db.otps.deleteMany({ expiresAt: { $lt: new Date() } })

// Exit mongosh
exit
```

### Option C: MongoDB for VS Code Extension

1. Install **MongoDB for VS Code** extension
2. Click MongoDB icon in sidebar
3. Click "Add Connection"
4. Enter connection string:
   ```
   mongodb://localhost:27017/gymfu
   ```
5. Browse collections and documents

### Option D: Studio 3T (Advanced GUI)

1. **Download**: https://studio3t.com/download/
2. **Install** and open Studio 3T
3. **New Connection**:
   - Connection name: GYMFU Local
   - Server: localhost
   - Port: 27017
   - Database: gymfu
4. **Connect** and explore

---

## 3. Redis Access

### Option A: Redis CLI

```bash
# Connect to Redis
redis-cli

# Or specify host and port
redis-cli -h localhost -p 6379
```

**Common Commands:**
```bash
# View all keys
KEYS *

# Get a specific key value
GET session:abc123

# View key type
TYPE session:abc123

# Get all session keys
KEYS session:*

# Get OTP keys
KEYS otp:*

# View key TTL (time to live)
TTL session:abc123

# Delete a key
DEL session:abc123

# Clear all data (use with caution!)
FLUSHALL

# Get Redis info
INFO

# Monitor real-time commands
MONITOR

# Exit redis-cli
exit
```

### Option B: RedisInsight (GUI - Recommended)

1. **Download**: https://redis.com/redis-enterprise/redis-insight/
2. **Install** and open RedisInsight
3. **Add Database**:
   - Host: localhost
   - Port: 6379
   - Name: GYMFU Local
4. **Connect** and browse keys

**Features:**
- Visual key browser
- Real-time monitoring
- Memory analysis
- Command execution
- Pub/Sub viewer

### Option C: Redis Commander (Web-based)

```bash
# Install globally
npm install -g redis-commander

# Run Redis Commander
redis-commander --redis-host localhost --redis-port 6379

# Open in browser
# http://localhost:8081
```

### Option D: Another Redis Desktop Manager

1. **Download**: https://github.com/qishibo/AnotherRedisDesktopManager/releases
2. **Install** and open
3. **New Connection**:
   - Name: GYMFU Local
   - Host: localhost
   - Port: 6379
4. **Connect** and manage keys

---

## 4. Quick Database Queries

### Check User Data (PostgreSQL)

```bash
psql postgresql://postgres:postgres@localhost:5432/gymfu -c "SELECT id, email, role, created_at FROM users;"
```

### Check MongoDB Collections

```bash
mongosh mongodb://localhost:27017/gymfu --eval "db.users.find().pretty()"
```

### Check Redis Keys

```bash
redis-cli KEYS "*"
```

---

## 5. Database Management Scripts

### Backup Databases

**PostgreSQL Backup:**
```bash
cd backend
pg_dump -h localhost -U postgres -d gymfu > backup_postgres.sql
```

**MongoDB Backup:**
```bash
mongodump --uri="mongodb://localhost:27017/gymfu" --out=backup_mongodb
```

**Redis Backup:**
```bash
redis-cli SAVE
# Backup file location: /var/lib/redis/dump.rdb (Linux)
# or C:\Program Files\Redis\dump.rdb (Windows)
```

### Restore Databases

**PostgreSQL Restore:**
```bash
psql -h localhost -U postgres -d gymfu < backup_postgres.sql
```

**MongoDB Restore:**
```bash
mongorestore --uri="mongodb://localhost:27017/gymfu" backup_mongodb/gymfu
```

**Redis Restore:**
```bash
# Copy dump.rdb to Redis data directory and restart Redis
redis-cli SHUTDOWN
# Copy backup dump.rdb
# Start Redis again
```

---

## 6. Useful Database Queries for GYMFU

### PostgreSQL Queries

```sql
-- View all users with their roles
SELECT id, email, phone_number, role, is_verified, created_at 
FROM users 
ORDER BY created_at DESC;

-- View all gyms with owner info
SELECT g.id, g.name, g.city, g.base_price, u.email as owner_email
FROM gyms g
JOIN users u ON g.owner_id = u.id
ORDER BY g.created_at DESC;

-- Find gyms near a location (using PostGIS)
SELECT id, name, city, 
       ST_Distance(location, ST_MakePoint(72.8777, 19.0760)::geography) / 1000 as distance_km
FROM gyms
WHERE ST_DWithin(location, ST_MakePoint(72.8777, 19.0760)::geography, 10000)
ORDER BY distance_km;

-- Count users by role
SELECT role, COUNT(*) as count
FROM users
GROUP BY role;

-- View gym amenities
SELECT name, amenities
FROM gyms
WHERE 'yoga' = ANY(amenities);
```

### MongoDB Queries

```javascript
// Find all active sessions
db.sessions.find({ expiresAt: { $gt: new Date() } })

// Find recent OTPs
db.otps.find().sort({ createdAt: -1 }).limit(10)

// Find users by role
db.users.find({ role: "partner" })

// Count verified users
db.users.countDocuments({ isVerified: true })

// Find expired OTPs
db.otps.find({ expiresAt: { $lt: new Date() } })
```

### Redis Queries

```bash
# View all session keys
KEYS session:*

# Get session data
GET session:abc123

# View all OTP keys
KEYS otp:*

# Check if key exists
EXISTS session:abc123

# Get remaining TTL
TTL session:abc123
```

---

## 7. Database Health Checks

### Check if Databases are Running

```bash
# PostgreSQL
psql -h localhost -U postgres -c "SELECT version();"

# MongoDB
mongosh --eval "db.adminCommand('ping')"

# Redis
redis-cli ping
```

### Via Backend API

```bash
# Check all databases
curl http://localhost:3000/health/db

# Response shows status of all three databases
```

---

## 8. Troubleshooting

### PostgreSQL Connection Issues

```bash
# Check if PostgreSQL is running
# Windows:
sc query postgresql-x64-14

# Check port availability
netstat -an | findstr :5432

# Restart PostgreSQL service
# Windows: Services → PostgreSQL → Restart
```

### MongoDB Connection Issues

```bash
# Check if MongoDB is running
# Windows:
sc query MongoDB

# Check port availability
netstat -an | findstr :27017

# Restart MongoDB service
# Windows: Services → MongoDB → Restart
```

### Redis Connection Issues

```bash
# Check if Redis is running
# Windows:
sc query Redis

# Check port availability
netstat -an | findstr :6379

# Restart Redis service
# Windows: Services → Redis → Restart
```

---

## 9. Security Best Practices

1. **Change Default Passwords**: Update PostgreSQL password in production
2. **Enable Redis Password**: Add `requirepass` in redis.conf
3. **Use Environment Variables**: Never commit credentials to git
4. **Restrict Network Access**: Use firewall rules in production
5. **Regular Backups**: Schedule automated backups
6. **Monitor Access**: Enable database logging

---

## 10. Recommended Tools Summary

| Database | Best GUI Tool | Best CLI Tool |
|----------|---------------|---------------|
| PostgreSQL | pgAdmin or DBeaver | psql |
| MongoDB | MongoDB Compass | mongosh |
| Redis | RedisInsight | redis-cli |

---

## Quick Reference Card

```bash
# PostgreSQL
psql postgresql://postgres:postgres@localhost:5432/gymfu

# MongoDB
mongosh mongodb://localhost:27017/gymfu

# Redis
redis-cli -h localhost -p 6379

# Backend Health Check
curl http://localhost:3000/health/db
```

---

For more help, refer to official documentation:
- PostgreSQL: https://www.postgresql.org/docs/
- MongoDB: https://docs.mongodb.com/
- Redis: https://redis.io/documentation
