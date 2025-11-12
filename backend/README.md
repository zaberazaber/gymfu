# GYMFU Backend API

## Setup

### 1. Install dependencies
```bash
npm install
```

### 2. Start databases using Docker
Make sure Docker Desktop is running, then:
```bash
docker-compose up -d
```

This will start PostgreSQL, MongoDB, and Redis containers.

### 3. Create database tables
```bash
npm run db:create
```

### 4. Run development server
```bash
npm run dev
```

### 5. Build for production
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- **GET** `/health` - Check if API is running
- **GET** `/health/db` - Check database connections

## Testing

### Test the health endpoint:
```bash
curl http://localhost:3000/health
```

Expected response:
```json
{
  "success": true,
  "message": "GYMFU API is running",
  "timestamp": "2024-01-01T00:00:00.000Z"
}
```

### Test database health:
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

## Database Management

### Start databases
```bash
docker-compose up -d
```

### Stop databases
```bash
docker-compose down
```

### View database logs
```bash
docker-compose logs -f
```

### Reset databases (WARNING: Deletes all data)
```bash
docker-compose down -v
docker-compose up -d
npm run db:create
```

## Troubleshooting

If you get database connection errors:
1. Make sure Docker Desktop is running
2. Check if containers are running: `docker ps`
3. Check container logs: `docker-compose logs`
4. Verify `.env` file has correct database credentials
