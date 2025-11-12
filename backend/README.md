# GYMFU Backend API

## Setup

1. Install dependencies:
```bash
npm install
```

2. Create `.env` file with required environment variables (see `.env` file)

3. Run development server:
```bash
npm run dev
```

4. Build for production:
```bash
npm run build
npm start
```

## API Endpoints

### Health Check
- **GET** `/health` - Check if API is running

## Testing

Test the health endpoint:
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
