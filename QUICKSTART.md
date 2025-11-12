# GYMFU Quick Start Guide

## Prerequisites
- Node.js (v18 or higher)
- Docker Desktop (for databases)

## Getting Started

### 1. Start Docker Desktop
Make sure Docker Desktop is running on your machine.

### 2. Start the Databases
```bash
cd backend
docker-compose up -d
```

This will start:
- PostgreSQL on port 5432
- MongoDB on port 27017
- Redis on port 6379

### 3. Install Dependencies
```bash
npm install
```

### 4. Create Database Tables
```bash
npm run db:create
```

### 5. Start the Development Server
```bash
npm run dev
```

The server will start on http://localhost:3000

## Verify Everything is Working

### Test API Health
```bash
curl http://localhost:3000/health
```

### Test Database Connections
```bash
curl http://localhost:3000/health/db
```

You should see all databases showing `true`:
```json
{
  "success": true,
  "databases": {
    "postgres": true,
    "mongodb": true,
    "redis": true
  }
}
```

## Common Commands

### Stop Databases
```bash
cd backend
docker-compose down
```

### View Database Logs
```bash
docker-compose logs -f
```

### Restart Everything
```bash
docker-compose restart
```

## Troubleshooting

### "Docker daemon is not running"
- Start Docker Desktop application

### "Port already in use"
- Check if another service is using ports 3000, 5432, 27017, or 6379
- Stop the conflicting service or change ports in `.env` and `docker-compose.yml`

### "Cannot connect to database"
- Verify Docker containers are running: `docker ps`
- Check container logs: `docker-compose logs`
- Verify credentials in `.env` file

## Start the Web Application

### 1. Install web dependencies
```bash
cd web
npm install
```

### 2. Start the web development server
```bash
npm run dev
```

The web app will start on http://localhost:5173

## Access the Application

- **Web App:** http://localhost:5173
- **Backend API:** http://localhost:3000
- **API Health Check:** http://localhost:3000/health
- **Database Health:** http://localhost:3000/health/db

## Next Steps

Once everything is running:
1. ✅ Backend API is ready at http://localhost:3000
2. ✅ Web app is ready at http://localhost:5173
3. ✅ You can see the GYMFU homepage with backend status
4. Next task: Set up the React Native mobile app (Task 1.4)
