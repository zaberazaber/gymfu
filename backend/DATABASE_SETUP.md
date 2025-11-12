# Database Setup Guide

This guide will help you set up PostgreSQL, MongoDB, and Redis for the GYMFU application.

## Prerequisites

You need to have the following installed:
- PostgreSQL
- MongoDB
- Redis

## Installation Instructions

### Windows

#### PostgreSQL
1. Download from: https://www.postgresql.org/download/windows/
2. Install and remember your password
3. Default port: 5432

#### MongoDB
1. Download from: https://www.mongodb.com/try/download/community
2. Install MongoDB Community Edition
3. Default port: 27017

#### Redis
1. Download from: https://github.com/microsoftarchive/redis/releases
2. Or use Docker: `docker run -d -p 6379:6379 redis`
3. Default port: 6379

### Using Docker (Recommended for Development)

```bash
# PostgreSQL
docker run -d \
  --name gymfu-postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=gymfu \
  -p 5432:5432 \
  postgres:15

# MongoDB
docker run -d \
  --name gymfu-mongo \
  -p 27017:27017 \
  mongo:7

# Redis
docker run -d \
  --name gymfu-redis \
  -p 6379:6379 \
  redis:7
```

## Configuration

Update the `.env` file with your database credentials:

```env
# PostgreSQL
POSTGRES_HOST=localhost
POSTGRES_PORT=5432
POSTGRES_DB=gymfu
POSTGRES_USER=postgres
POSTGRES_PASSWORD=your_password

# MongoDB
MONGODB_URI=mongodb://localhost:27017/gymfu

# Redis
REDIS_HOST=localhost
REDIS_PORT=6379
```

## Create Database Tables

After setting up the databases, run:

```bash
npm run db:create
```

This will create the initial `users` table in PostgreSQL.

## Verify Connection

Start the server:
```bash
npm run dev
```

Check database health:
```bash
curl http://localhost:3000/health/db
```

Expected response:
```json
{
  "success": true,
  "databases": {
    "postgres": true,
    "mongodb": true,
    "redis": true
  },
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

## Troubleshooting

### PostgreSQL Connection Issues
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Ensure port 5432 is not blocked

### MongoDB Connection Issues
- Verify MongoDB is running: `mongosh`
- Check connection string in `.env`
- Ensure port 27017 is not blocked

### Redis Connection Issues
- Verify Redis is running: `redis-cli ping` (should return PONG)
- Check host and port in `.env`
- Ensure port 6379 is not blocked
