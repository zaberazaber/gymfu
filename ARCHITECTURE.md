# GYMFU Architecture Overview

## Project Structure

```
gymfu/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── config/      # Database and service configurations
│   │   ├── scripts/     # Database scripts
│   │   └── index.ts     # Main server file
│   ├── .env             # Environment variables
│   └── docker-compose.yml
│
├── web/                  # React web application
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── utils/       # Utilities (API client)
│   │   ├── App.tsx      # Main app component
│   │   └── main.tsx     # Entry point
│   └── .env             # Environment variables
│
├── mobile/               # React Native mobile app
│   ├── src/
│   │   ├── screens/     # Screen components
│   │   ├── utils/       # Utilities (API client)
│   │   └── App.tsx      # Main app component
│   └── app.json         # Expo configuration
│
├── shared/               # Shared code across all apps
│   ├── types/           # TypeScript interfaces
│   ├── constants/       # Shared constants
│   ├── utils/           # Shared utilities
│   └── index.ts         # Main export
│
├── .kiro/                # Kiro IDE specifications
│   └── specs/
│       └── gymfu-hybrid-app/
│           ├── requirements.md
│           ├── design.md
│           └── tasks.md
│
└── Documentation files
    ├── PROGRESS.md
    ├── QUICKSTART.md
    ├── PROJECT_OVERVIEW.md
    ├── TESTING_GUIDE.md
    └── ARCHITECTURE.md (this file)
```

## Technology Stack

### Backend
- **Runtime:** Node.js 18+
- **Framework:** Express.js
- **Language:** TypeScript
- **Databases:**
  - PostgreSQL (primary data)
  - MongoDB (analytics, AI data)
  - Redis (caching, sessions)
- **Containerization:** Docker, Docker Compose

### Frontend (Web)
- **Framework:** React 18
- **Build Tool:** Vite
- **Language:** TypeScript
- **Routing:** React Router DOM
- **State Management:** Redux Toolkit (planned)
- **HTTP Client:** Axios

### Mobile
- **Framework:** React Native with Expo
- **Language:** TypeScript
- **Navigation:** React Navigation
- **HTTP Client:** Axios
- **Platform:** iOS, Android, Web

### Shared
- **Language:** TypeScript
- **Purpose:** Types, constants, utilities
- **Used by:** All applications

## Data Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Applications                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   Web App    │  │  Mobile App  │  │  Admin Panel │     │
│  │  (React)     │  │ (React Native)│  │   (React)    │     │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘     │
│         │                  │                  │              │
│         └──────────────────┴──────────────────┘              │
│                            │                                 │
└────────────────────────────┼─────────────────────────────────┘
                             │
                             ▼
                    ┌────────────────┐
                    │   API Gateway  │
                    │  (Express.js)  │
                    └────────┬───────┘
                             │
        ┌────────────────────┼────────────────────┐
        │                    │                    │
        ▼                    ▼                    ▼
┌───────────────┐   ┌───────────────┐   ┌───────────────┐
│  PostgreSQL   │   │   MongoDB     │   │     Redis     │
│  (Primary DB) │   │  (Analytics)  │   │    (Cache)    │
└───────────────┘   └───────────────┘   └───────────────┘
```

## API Architecture

### RESTful API Design

All API endpoints follow REST principles:

```
GET    /api/v1/resource       # List resources
GET    /api/v1/resource/:id   # Get single resource
POST   /api/v1/resource       # Create resource
PUT    /api/v1/resource/:id   # Update resource
DELETE /api/v1/resource/:id   # Delete resource
```

### Response Format

All API responses follow a consistent format:

```typescript
{
  "success": boolean,
  "data": any,              // Present on success
  "error": {                // Present on error
    "code": string,
    "message": string,
    "details": any
  },
  "timestamp": string
}
```

### Authentication

- JWT-based authentication
- Token stored in localStorage (web) / AsyncStorage (mobile)
- Token sent in Authorization header: `Bearer <token>`
- Protected routes require valid JWT token

## Database Schema

### PostgreSQL (Relational Data)

**Users Table:**
- id, phoneNumber, email, name, password
- age, gender, location, fitnessGoals
- profileImage, referralCode, referredBy, rewardPoints
- createdAt, updatedAt

**Gyms Table:**
- id, name, ownerId, address, latitude, longitude
- city, pincode, amenities, basePrice, capacity
- rating, isVerified, createdAt, updatedAt

**Bookings Table:**
- id, userId, gymId, sessionDate, price, status
- qrCode, qrCodeExpiry, paymentId
- checkInTime, checkOutTime, createdAt

**Payments Table:**
- id, bookingId, userId, gymId, amount
- platformCommission, gymEarnings, paymentMethod
- razorpayOrderId, razorpayPaymentId, status
- createdAt, updatedAt

### MongoDB (Flexible Data)

**FitnessProfiles Collection:**
- userId, goals, fitnessLevel, bodyMetrics
- workoutPlan, nutritionPlan, activityLog
- createdAt, updatedAt

**Analytics Collection:**
- Various analytics and metrics data

### Redis (Cache & Sessions)

- OTP storage (key: phone/email, value: OTP, TTL: 10 min)
- Session data
- API response caching
- Rate limiting counters

## Security

### Authentication & Authorization
- JWT tokens with expiry
- Password hashing with bcrypt
- OTP-based verification
- Role-based access control (planned)

### Data Protection
- HTTPS/TLS for data in transit
- Encrypted sensitive data at rest
- CORS configuration
- Rate limiting
- Input validation and sanitization

### API Security
- Helmet.js for security headers
- Express rate limiter
- SQL injection prevention (parameterized queries)
- XSS prevention (input sanitization)

## Scalability Considerations

### Horizontal Scaling
- Stateless API design
- Session data in Redis (shared across instances)
- Load balancer ready

### Caching Strategy
- Redis for frequently accessed data
- API response caching
- CDN for static assets

### Database Optimization
- Indexes on frequently queried fields
- Connection pooling
- Query optimization
- Read replicas (future)

## Development Workflow

1. **Local Development:**
   - Docker Compose for databases
   - Hot reload for all applications
   - Shared types for consistency

2. **Code Organization:**
   - Monorepo structure
   - Shared package for common code
   - Clear separation of concerns

3. **Testing:**
   - Unit tests for utilities
   - Integration tests for APIs
   - E2E tests for user flows

4. **Deployment:**
   - Docker containers
   - Kubernetes orchestration (planned)
   - CI/CD pipeline (planned)

## Environment Configuration

### Development
- Local databases via Docker
- Hot reload enabled
- Debug logging
- Test API keys

### Staging
- Cloud databases
- Production-like environment
- Limited logging
- Test API keys

### Production
- Cloud databases with backups
- Error logging only
- Production API keys
- CDN enabled
- Auto-scaling

## Third-Party Integrations

### Payment Gateway
- **Razorpay:** UPI, cards, wallets
- Webhook handling for payment status
- Refund processing

### Maps & Location
- **Google Maps API:** Gym discovery, location services
- Geospatial queries with PostGIS

### Notifications
- **Firebase Cloud Messaging:** Push notifications
- **Twilio/MSG91:** SMS and OTP
- **SendGrid:** Email notifications

### Storage
- **AWS S3:** Media storage (images, videos)
- **CloudFront:** CDN for static assets

### AI/ML (Planned)
- **TensorFlow/PyTorch:** Fitness recommendations
- Custom ML models for personalization

## Monitoring & Logging

### Application Monitoring
- Winston for structured logging
- Sentry for error tracking (planned)
- Custom metrics dashboard (planned)

### Infrastructure Monitoring
- Docker container health checks
- Database connection monitoring
- API response time tracking

### Business Metrics
- User registrations
- Booking conversions
- Revenue tracking
- Gym partner analytics

## Future Enhancements

1. **Microservices Architecture:** Split into independent services
2. **GraphQL API:** Alternative to REST for complex queries
3. **Real-time Features:** WebSocket for live updates
4. **Advanced Analytics:** ML-powered insights
5. **Multi-language Support:** i18n implementation
6. **Progressive Web App:** Offline support for web
7. **Video Streaming:** Workout videos and live classes
8. **Social Features:** User profiles, following, sharing

## Contributing

See individual README files in each directory for specific contribution guidelines.

## License

[To be determined]
