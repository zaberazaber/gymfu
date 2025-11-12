# Design Document

## Overview

GYMFU is a hybrid fitness-tech platform built using React Native for mobile (Android/iOS) and React for web, sharing a common codebase where possible. The architecture follows a microservices pattern with a Node.js backend, PostgreSQL for relational data, MongoDB for flexible data storage, Redis for caching, and AWS S3 for media storage. The system integrates third-party services for payments (Razorpay), maps (Google Maps), SMS/notifications (Firebase), and AI/ML capabilities for personalized recommendations.

### Technology Stack

**Frontend:**
- React Native (Mobile - Android & iOS)
- React.js (Web)
- Redux Toolkit (State Management)
- React Navigation (Mobile routing)
- React Router (Web routing)
- Axios (API communication)

**Backend:**
- Node.js with Express.js
- TypeScript for type safety
- Microservices architecture

**Database:**
- PostgreSQL (Primary relational database for users, bookings, transactions)
- MongoDB (Flexible storage for AI recommendations, logs, analytics)
- Redis (Caching, session management, real-time data)

**Cloud & Infrastructure:**
- AWS EC2/ECS (Application hosting)
- AWS S3 (Media storage - images, videos)
- AWS CloudFront (CDN for static assets)
- AWS Lambda (Serverless functions for background jobs)
- Docker & Kubernetes (Containerization and orchestration)

**Third-Party Integrations:**
- Razorpay (Payment gateway for UPI, cards, wallets)
- Google Maps API (Gym discovery and location services)
- Firebase Cloud Messaging (Push notifications)
- Twilio/MSG91 (SMS and OTP services)
- SendGrid (Email notifications)
- TensorFlow/PyTorch (AI/ML models for fitness recommendations)

**Development Tools:**
- Git & GitHub (Version control)
- Jest & React Testing Library (Testing)
- ESLint & Prettier (Code quality)
- Postman (API testing)
- Sentry (Error tracking)

## Architecture

### High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Client Layer                             │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │   Android    │  │     iOS      │  │     Web      │      │
│  │ React Native │  │ React Native │  │   React.js   │      │
│  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    API Gateway Layer                         │
│              (Load Balancer + Rate Limiting)                 │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                  Microservices Layer                         │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   User   │ │   Gym    │ │ Booking  │ │ Payment  │      │
│  │ Service  │ │ Service  │ │ Service  │ │ Service  │      │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────┐      │
│  │   AI     │ │Marketplace│ │Analytics │ │Notification│    │
│  │ Service  │ │ Service  │ │ Service  │ │  Service  │    │
│  └──────────┘ └──────────┘ └──────────┘ └──────────┘      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                    Data Layer                                │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │  PostgreSQL  │  │   MongoDB    │  │    Redis     │     │
│  │  (Primary)   │  │  (Analytics) │  │   (Cache)    │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└─────────────────────────────────────────────────────────────┘
```

### Microservices Architecture

The backend is divided into independent microservices, each responsible for specific business domains:

1. **User Service**: Authentication, profile management, preferences, referral system
2. **Gym Service**: Gym onboarding, partner management, availability
3. **Booking Service**: Session booking, QR code generation, check-ins, fitness classes
4. **Payment Service**: Transaction processing, refunds, settlements
5. **AI Service**: Fitness recommendations, nutrition plans, progress tracking
6. **Marketplace Service**: Product catalog, orders, inventory
7. **Analytics Service**: Reporting, metrics, business intelligence
8. **Notification Service**: Push notifications, SMS, emails
9. **Corporate Service**: Corporate account management, bulk packages, employee tracking
10. **Admin Service**: Platform administration, monitoring, dispute resolution

Each service has its own database schema and communicates via REST APIs and message queues (RabbitMQ/AWS SQS).

**Design Rationale:** The addition of Corporate Service and Admin Service as separate microservices ensures scalability and separation of concerns. Corporate wellness features require distinct business logic for bulk operations and employee management, while admin operations need isolated access controls and audit capabilities.

## Components and Interfaces

### Mobile App Components (React Native)

**1. Authentication Module**
- `LoginScreen`: Phone/email login with OTP
- `RegisterScreen`: User registration flow
- `OTPVerification`: OTP input and validation
- `ProfileSetup`: Initial profile configuration

**2. Home & Discovery Module**
- `HomeScreen`: Dashboard with quick actions
- `GymMapView`: Interactive map showing nearby gyms
- `GymListView`: List view with filters
- `GymDetailScreen`: Detailed gym information
- `FilterModal`: Amenities and price filters

**3. Booking Module**
- `BookingScreen`: Session selection and booking
- `PaymentScreen`: Payment method selection
- `QRCodeScreen`: Display active QR code
- `BookingHistory`: Past and upcoming bookings

**4. AI Coach Module**
- `FitnessProfileScreen`: Goals and preferences setup
- `WorkoutPlanScreen`: Personalized workout plans
- `NutritionScreen`: Diet recommendations
- `ProgressTracker`: Activity and progress logs

**5. Marketplace Module**
- `ProductCatalog`: Browse products by category
- `ProductDetail`: Product information and reviews
- `CartScreen`: Shopping cart management
- `OrderTracking`: Order status and delivery updates

**6. Fitness Classes Module**
- `ClassesScreen`: Browse available fitness classes
- `ClassDetailScreen`: Class information, instructor details, schedule
- `ClassBookingScreen`: Book individual class sessions
- `InstructorProfileScreen`: Instructor bio, ratings, and reviews
- `ClassHistoryScreen`: Past and upcoming class bookings

**7. Profile & Settings**
- `ProfileScreen`: User profile and stats
- `SettingsScreen`: App preferences with 2FA setup
- `ReferralScreen`: Referral code generation, sharing, and rewards tracking
- `RewardsScreen`: Reward points balance and redemption options
- `SupportScreen`: Help and customer support

### Web App Components (React)

Similar component structure as mobile but optimized for desktop layouts with responsive design. Additional components:

- `DesktopNavigation`: Horizontal navigation bar
- `SidebarMenu`: Collapsible sidebar for quick access
- `DashboardGrid`: Multi-column layout for analytics

**Corporate Dashboard (Web Only):**
- `CorporateDashboard`: Overview of corporate wellness program
- `EmployeeManagement`: Add/remove employees, track usage
- `BulkBookingScreen`: Purchase bulk gym passes
- `UsageAnalytics`: Employee engagement metrics and reports
- `BillingScreen`: Corporate invoices and payment history

**Admin Dashboard (Web Only):**
- `AdminDashboard`: System-wide metrics and monitoring
- `UserManagement`: User account management and moderation
- `GymApprovalScreen`: Review and approve gym partner applications
- `DisputeResolution`: Handle user complaints and disputes
- `SystemMonitoring`: Real-time system health and performance
- `RevenueReports`: Financial analytics and commission tracking

### Backend API Endpoints

**User Service**
```
POST   /api/v1/auth/register
POST   /api/v1/auth/login
POST   /api/v1/auth/verify-otp
GET    /api/v1/users/profile
PUT    /api/v1/users/profile
POST   /api/v1/users/preferences
```

**Gym Service**
```
POST   /api/v1/gyms/register
GET    /api/v1/gyms/nearby?lat={lat}&lng={lng}&radius={radius}
GET    /api/v1/gyms/{gymId}
PUT    /api/v1/gyms/{gymId}
GET    /api/v1/gyms/{gymId}/availability
POST   /api/v1/gyms/{gymId}/pricing
```

**Booking Service**
```
POST   /api/v1/bookings
GET    /api/v1/bookings/{bookingId}
GET    /api/v1/bookings/user/{userId}
POST   /api/v1/bookings/{bookingId}/checkin
GET    /api/v1/bookings/{bookingId}/qrcode
```

**Payment Service**
```
POST   /api/v1/payments/initiate
POST   /api/v1/payments/verify
GET    /api/v1/payments/{paymentId}
POST   /api/v1/payments/refund
GET    /api/v1/settlements/gym/{gymId}
```

**AI Service**
```
POST   /api/v1/ai/fitness-profile
GET    /api/v1/ai/workout-plan
GET    /api/v1/ai/nutrition-plan
POST   /api/v1/ai/log-activity
GET    /api/v1/ai/progress
```

**Marketplace Service**
```
GET    /api/v1/marketplace/products
GET    /api/v1/marketplace/products/{productId}
POST   /api/v1/marketplace/cart
POST   /api/v1/marketplace/orders
GET    /api/v1/marketplace/orders/{orderId}
```

**Fitness Classes Service**
```
GET    /api/v1/classes?type={type}&gymId={gymId}
GET    /api/v1/classes/{classId}
POST   /api/v1/classes/{classId}/book
GET    /api/v1/classes/user/{userId}/bookings
GET    /api/v1/instructors/{instructorId}
POST   /api/v1/classes/{classId}/review
```

**Referral Service**
```
GET    /api/v1/referrals/code
POST   /api/v1/referrals/apply
GET    /api/v1/referrals/stats
GET    /api/v1/rewards/balance
POST   /api/v1/rewards/redeem
GET    /api/v1/rewards/history
```

**Corporate Service**
```
POST   /api/v1/corporate/register
POST   /api/v1/corporate/{corpId}/employees
GET    /api/v1/corporate/{corpId}/employees
DELETE /api/v1/corporate/{corpId}/employees/{empId}
POST   /api/v1/corporate/{corpId}/bulk-purchase
GET    /api/v1/corporate/{corpId}/usage-analytics
GET    /api/v1/corporate/{corpId}/billing
```

**Admin Service**
```
GET    /api/v1/admin/dashboard/metrics
GET    /api/v1/admin/users?status={status}
PUT    /api/v1/admin/users/{userId}/status
GET    /api/v1/admin/gyms/pending-approval
PUT    /api/v1/admin/gyms/{gymId}/approve
GET    /api/v1/admin/disputes
PUT    /api/v1/admin/disputes/{disputeId}/resolve
GET    /api/v1/admin/revenue-reports
GET    /api/v1/admin/system-health
```

## Data Models

### User Model (PostgreSQL)
```typescript
interface User {
  id: string;                    // UUID
  phoneNumber: string;           // Unique
  email?: string;                // Optional
  name: string;
  age?: number;
  gender?: 'male' | 'female' | 'other';
  location: {
    latitude: number;
    longitude: number;
    city: string;
  };
  fitnessGoals?: string[];       // ['weight_loss', 'muscle_gain', etc.]
  profileImage?: string;         // S3 URL
  referralCode: string;          // Unique
  referredBy?: string;           // Referral code of referrer
  rewardPoints: number;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}
```

### Gym Model (PostgreSQL)
```typescript
interface Gym {
  id: string;                    // UUID
  name: string;
  ownerId: string;               // Reference to User
  location: {
    address: string;
    latitude: number;
    longitude: number;
    city: string;
    pincode: string;
  };
  amenities: string[];           // ['cardio', 'weights', 'shower', etc.]
  images: string[];              // S3 URLs
  operatingHours: {
    [day: string]: {
      open: string;              // '06:00'
      close: string;             // '22:00'
    };
  };
  pricing: {
    basePrice: number;           // Per session
    peakHourPrice?: number;
    offPeakPrice?: number;
  };
  capacity: number;
  currentOccupancy: number;
  rating: number;
  totalReviews: number;
  isVerified: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Booking Model (PostgreSQL)
```typescript
interface Booking {
  id: string;                    // UUID
  userId: string;
  gymId: string;
  sessionDate: Date;
  sessionType: 'gym' | 'yoga' | 'zumba' | 'dance';
  price: number;
  status: 'pending' | 'confirmed' | 'checked_in' | 'completed' | 'cancelled';
  qrCode: string;                // Unique QR code
  qrCodeExpiry: Date;
  paymentId: string;
  checkInTime?: Date;
  checkOutTime?: Date;
  createdAt: Date;
  updatedAt: Date;
}
```

### Payment Model (PostgreSQL)
```typescript
interface Payment {
  id: string;                    // UUID
  bookingId: string;
  userId: string;
  gymId: string;
  amount: number;
  platformCommission: number;    // 15% of amount
  gymEarnings: number;           // 85% of amount
  paymentMethod: 'upi' | 'card' | 'wallet';
  razorpayOrderId: string;
  razorpayPaymentId?: string;
  status: 'initiated' | 'success' | 'failed' | 'refunded';
  refundAmount?: number;
  createdAt: Date;
  updatedAt: Date;
}
```

### AI Fitness Profile Model (MongoDB)
```typescript
interface FitnessProfile {
  userId: string;
  goals: string[];               // ['weight_loss', 'muscle_gain']
  fitnessLevel: 'beginner' | 'intermediate' | 'advanced';
  preferences: {
    workoutDuration: number;     // Minutes
    workoutFrequency: number;    // Days per week
    preferredActivities: string[];
  };
  bodyMetrics: {
    height: number;              // cm
    weight: number;              // kg
    bmi: number;
    targetWeight?: number;
  };
  dietaryPreferences: string[];  // ['vegetarian', 'vegan', etc.]
  workoutPlan: {
    exercises: Array<{
      name: string;
      sets: number;
      reps: number;
      duration?: number;
      videoUrl?: string;
    }>;
    generatedAt: Date;
  };
  nutritionPlan: {
    dailyCalories: number;
    macros: {
      protein: number;
      carbs: number;
      fats: number;
    };
    meals: Array<{
      type: 'breakfast' | 'lunch' | 'dinner' | 'snack';
      items: string[];
      calories: number;
    }>;
    generatedAt: Date;
  };
  activityLog: Array<{
    date: Date;
    workoutType: string;
    duration: number;
    caloriesBurned: number;
  }>;
  createdAt: Date;
  updatedAt: Date;
}
```

### Product Model (PostgreSQL)
```typescript
interface Product {
  id: string;                    // UUID
  name: string;
  category: 'supplement' | 'gear' | 'food';
  description: string;
  price: number;
  discountPrice?: number;
  images: string[];              // S3 URLs
  brand: string;
  ingredients?: string[];
  rating: number;
  totalReviews: number;
  stockQuantity: number;
  vendorId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}
```

### Order Model (PostgreSQL)
```typescript
interface Order {
  id: string;                    // UUID
  userId: string;
  items: Array<{
    productId: string;
    quantity: number;
    price: number;
  }>;
  totalAmount: number;
  shippingAddress: {
    name: string;
    phone: string;
    addressLine1: string;
    addressLine2?: string;
    city: string;
    state: string;
    pincode: string;
  };
  paymentId: string;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  trackingId?: string;
  deliveryPartnerId?: string;
  createdAt: Date;
  updatedAt: Date;
}
```

## Error Handling

### Error Response Format

All API errors follow a consistent format:

```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;              // 'AUTH_FAILED', 'BOOKING_CONFLICT', etc.
    message: string;           // User-friendly message
    details?: any;             // Additional error context
    timestamp: string;
  };
}
```

### Error Categories

**1. Authentication Errors (401)**
- `AUTH_TOKEN_MISSING`: No authentication token provided
- `AUTH_TOKEN_INVALID`: Invalid or expired token
- `AUTH_OTP_INVALID`: Incorrect OTP
- `AUTH_USER_NOT_FOUND`: User does not exist

**2. Authorization Errors (403)**
- `ACCESS_DENIED`: User lacks permission for this resource
- `GYM_PARTNER_ONLY`: Endpoint restricted to gym partners

**3. Validation Errors (400)**
- `VALIDATION_FAILED`: Request data validation failed
- `INVALID_PHONE_NUMBER`: Phone number format invalid
- `INVALID_DATE_RANGE`: Date range is invalid

**4. Business Logic Errors (422)**
- `BOOKING_CONFLICT`: Gym slot already booked
- `INSUFFICIENT_BALANCE`: Not enough reward points
- `GYM_UNAVAILABLE`: Gym not accepting bookings
- `QR_CODE_EXPIRED`: QR code has expired

**5. Payment Errors (402)**
- `PAYMENT_FAILED`: Payment processing failed
- `PAYMENT_GATEWAY_ERROR`: External payment gateway error
- `REFUND_FAILED`: Refund processing failed

**6. Server Errors (500)**
- `INTERNAL_SERVER_ERROR`: Unexpected server error
- `DATABASE_ERROR`: Database operation failed
- `EXTERNAL_SERVICE_ERROR`: Third-party service unavailable

### Error Handling Strategy

**Frontend:**
- Display user-friendly error messages
- Implement retry logic for network failures
- Log errors to Sentry for monitoring
- Provide fallback UI for critical failures

**Backend:**
- Centralized error handling middleware
- Structured logging with Winston
- Automatic error reporting to Sentry
- Circuit breaker pattern for external services
- Graceful degradation for non-critical features

### Retry and Fallback Mechanisms

```typescript
// Payment retry logic
const retryPayment = async (paymentData, maxRetries = 3) => {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await processPayment(paymentData);
    } catch (error) {
      if (attempt === maxRetries) throw error;
      await delay(1000 * attempt); // Exponential backoff
    }
  }
};

// Fallback for AI recommendations
const getWorkoutPlan = async (userId) => {
  try {
    return await aiService.generatePlan(userId);
  } catch (error) {
    // Fallback to template-based plan
    return getTemplatePlan(userId);
  }
};
```

## Testing Strategy

### Testing Pyramid

```
                    ┌─────────────┐
                    │   E2E Tests │  (10%)
                    │  (Cypress)  │
                    └─────────────┘
                  ┌───────────────────┐
                  │ Integration Tests │  (30%)
                  │  (Jest + Supertest)│
                  └───────────────────┘
              ┌─────────────────────────────┐
              │      Unit Tests             │  (60%)
              │  (Jest + React Testing Lib) │
              └─────────────────────────────┘
```

### Unit Testing

**Frontend (React Native/React):**
- Component rendering tests
- User interaction tests (button clicks, form submissions)
- Redux action and reducer tests
- Utility function tests
- Mock API responses

**Backend (Node.js):**
- Service layer business logic tests
- Database query tests with test database
- Utility and helper function tests
- Validation schema tests

**Coverage Target:** 80% code coverage

### Integration Testing

**API Integration Tests:**
- Test complete API workflows (register → login → book → pay)
- Database integration tests
- Third-party service integration tests (mocked)
- Message queue integration tests

**Tools:**
- Supertest for API testing
- Test containers for database isolation
- Nock for HTTP mocking

### End-to-End Testing

**User Flows:**
- Complete user registration and onboarding
- Gym discovery and booking flow
- Payment and QR code generation
- Gym partner dashboard operations
- Marketplace purchase flow

**Tools:**
- Detox for React Native E2E testing
- Cypress for web E2E testing
- Appium for cross-platform mobile testing

### Performance Testing

**Load Testing:**
- Simulate 10,000 concurrent users
- Test API response times under load
- Database query performance
- Payment gateway throughput

**Tools:**
- Apache JMeter
- Artillery.io
- k6

**Performance Targets:**
- API response time: < 200ms (p95)
- Page load time: < 2 seconds
- QR code generation: < 100ms
- Payment processing: < 3 seconds

### Security Testing

**Security Measures:**
- OWASP Top 10 vulnerability scanning
- Penetration testing for authentication
- SQL injection and XSS prevention tests
- API rate limiting tests
- Data encryption verification

**Tools:**
- OWASP ZAP
- Burp Suite
- npm audit for dependency vulnerabilities

### Testing Environments

1. **Development**: Local testing with mock data
2. **Staging**: Pre-production environment with sanitized production data
3. **Production**: Live environment with monitoring and alerting

### Continuous Integration

**CI/CD Pipeline:**
```
Code Push → Lint & Format → Unit Tests → Build → Integration Tests → 
Deploy to Staging → E2E Tests → Manual Approval → Deploy to Production
```

**Tools:**
- GitHub Actions for CI/CD
- Docker for containerization
- AWS CodeDeploy for deployment
- SonarQube for code quality analysis

### Monitoring and Observability

**Application Monitoring:**
- Sentry for error tracking
- New Relic/DataDog for APM
- CloudWatch for infrastructure monitoring
- Custom dashboards for business metrics

**Key Metrics:**
- API latency and error rates
- Database query performance
- Payment success/failure rates
- User session duration
- Crash-free rate for mobile apps

**Alerting:**
- PagerDuty for critical alerts
- Slack integration for team notifications
- Automated incident response playbooks
