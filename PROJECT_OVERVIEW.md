# GYMFU Project Overview

## Project Structure

```
gymfu/
├── backend/              # Node.js + Express + TypeScript API
├── web/                  # React + Vite + TypeScript web app
├── mobile/               # React Native + Expo + TypeScript mobile app
├── .kiro/                # Kiro IDE specifications
│   └── specs/
│       └── gymfu-hybrid-app/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
├── PROGRESS.md           # Development progress tracker
├── QUICKSTART.md         # Quick start guide
└── PROJECT_OVERVIEW.md   # This file
```

## Technology Stack

### Backend
- **Runtime:** Node.js with TypeScript
- **Framework:** Express.js
- **Databases:**
  - PostgreSQL (primary relational database)
  - MongoDB (analytics and AI data)
  - Redis (caching and sessions)
- **Tools:** Docker, Docker Compose

### Web Frontend
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Routing:** React Router DOM
- **HTTP Client:** Axios
- **Styling:** CSS (inline styles for now)

### Mobile App
- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation
- **HTTP Client:** Axios
- **Platform:** iOS, Android, Web (via Expo)

## Current Implementation Status

### ✅ Completed Tasks

1. **Task 1.1:** Backend with Express server
   - Health check endpoint
   - Basic server configuration
   - TypeScript setup

2. **Task 1.2:** Database connections
   - PostgreSQL connection
   - MongoDB connection
   - Redis connection
   - User table schema
   - Docker Compose configuration

3. **Task 1.3:** React web app
   - Basic routing
   - Homepage with backend integration
   - API utility
   - Responsive design

4. **Task 1.4:** React Native mobile app
   - Navigation setup
   - HomeScreen with backend integration
   - API utility with platform-specific URLs
   - Pull-to-refresh

### ⏳ Pending Tasks

- Task 1.5: Environment variables and shared utilities
- Task 1.6: Error handling and logging
- Task 1.7: Testing infrastructure
- Task 2.x: Authentication and user management
- Task 3.x: Gym discovery and management
- Task 4.x: Booking and QR code system
- Task 5.x: Payment processing
- And more...

## Running the Application

### Prerequisites
- Node.js v18+
- Docker Desktop
- (Optional) Android Studio or Xcode for mobile development

### Start Everything

1. **Start Databases:**
   ```bash
   cd backend
   docker-compose up -d
   npm run db:create
   ```

2. **Start Backend:**
   ```bash
   cd backend
   npm install
   npm run dev
   ```
   Backend runs on http://localhost:3000

3. **Start Web App:**
   ```bash
   cd web
   npm install
   npm run dev
   ```
   Web app runs on http://localhost:5173

4. **Start Mobile App:**
   ```bash
   cd mobile
   npm install
   npm start
   ```
   Then press 'a' for Android or 'i' for iOS

## API Endpoints

### Current Endpoints

- `GET /health` - API health check
- `GET /health/db` - Database health check

### Planned Endpoints

See `backend/README.md` and design documents for full API specification.

## Development Workflow

1. Check `PROGRESS.md` for current status
2. Review task in `.kiro/specs/gymfu-hybrid-app/tasks.md`
3. Implement the task
4. Test the implementation
5. Update `PROGRESS.md`
6. Commit changes

## Testing

### Backend
```bash
cd backend
npm test
```

### Web
```bash
cd web
npm test
```

### Mobile
```bash
cd mobile
npm test
```

## Database Management

### View Running Containers
```bash
docker ps
```

### Stop Databases
```bash
cd backend
docker-compose down
```

### Reset Databases (WARNING: Deletes all data)
```bash
cd backend
docker-compose down -v
docker-compose up -d
npm run db:create
```

## Troubleshooting

### Backend won't start
- Check if port 3000 is available
- Verify databases are running: `docker ps`
- Check database logs: `docker-compose logs`

### Web app can't connect to backend
- Verify backend is running on port 3000
- Check browser console for errors
- Verify CORS is enabled in backend

### Mobile app can't connect to backend
- For Android emulator: Use `http://10.0.2.2:3000`
- For iOS simulator: Use `http://localhost:3000`
- For physical device: Use your computer's IP address
- Ensure backend is accessible from your network

## Documentation

- **Backend:** `backend/README.md`
- **Web:** `web/README.md`
- **Mobile:** `mobile/README.md`
- **Database Setup:** `backend/DATABASE_SETUP.md`
- **Quick Start:** `QUICKSTART.md`
- **Progress:** `PROGRESS.md`

## Key Features (Planned)

1. **User Authentication** - OTP-based registration and login
2. **Gym Discovery** - Find nearby gyms with geospatial search
3. **Pay-per-Session Booking** - Book gym sessions without memberships
4. **QR Code Access** - Digital entry system
5. **Payment Integration** - Razorpay for UPI, cards, wallets
6. **AI Fitness Coach** - Personalized workout and nutrition plans
7. **Marketplace** - Shop supplements, gear, and healthy foods
8. **Fitness Classes** - Book yoga, Zumba, dance classes
9. **Referral System** - Earn rewards for referrals
10. **Corporate Wellness** - Bulk packages for companies
11. **Analytics** - Gym partner dashboards
12. **Admin Platform** - System management

## Contributing

1. Follow the task list in `.kiro/specs/gymfu-hybrid-app/tasks.md`
2. Each task should be testable after completion
3. Update documentation as you go
4. Keep code clean and well-commented

## License

[To be determined]

## Contact

[To be determined]
