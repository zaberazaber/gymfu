# Implementation Plan

## 1. Project Setup and Infrastructure

- [ ] 1.1 Initialize backend with basic Express server
  - Create /backend directory with package.json
  - Install Express, TypeScript, and essential dependencies
  - Set up TypeScript configuration (tsconfig.json)
  - Create basic Express server with health check endpoint (GET /health)
  - Add start scripts (npm run dev, npm run build)
  - **Test**: Run `npm run dev` and verify server starts on http://localhost:3000, test /health endpoint returns 200 OK
  - _Requirements: 13.3, 15.1_

- [ ] 1.2 Set up database connections and initial schema
  - Install pg, mongoose, and redis client libraries
  - Configure PostgreSQL connection with connection pooling
  - Configure MongoDB connection for analytics
  - Set up Redis client for caching
  - Create initial User table schema in PostgreSQL
  - Add database health check endpoints (GET /health/db)
  - **Test**: Run server and verify all database connections succeed, test /health/db endpoint
  - _Requirements: 15.1, 15.2_

- [ ] 1.3 Set up React web app with basic routing
  - Create /web directory and initialize React with Vite and TypeScript
  - Install React Router and configure basic routing
  - Create HomePage component with "GYMFU" header
  - Add proxy configuration to connect to backend
  - Add start scripts
  - **Test**: Run `npm run dev` and verify app loads at http://localhost:5173, shows homepage
  - _Requirements: 14.1, 14.3_

- [ ] 1.4 Set up React Native mobile app with basic navigation
  - Create /mobile directory and initialize React Native with TypeScript
  - Install and configure React Navigation
  - Create basic HomeScreen component
  - Configure Metro bundler
  - Add start scripts for iOS and Android
  - **Test**: Run `npm run android` or `npm run ios` and verify app launches with home screen
  - _Requirements: 1.4, 14.1_

- [ ] 1.5 Configure environment variables and shared utilities
  - Create .env files for backend, web, and mobile
  - Set up dotenv for environment variable management
  - Create /shared directory for common types and utilities
  - Configure API base URLs for each environment
  - Add environment validation on startup
  - **Test**: Verify all apps start with correct environment variables loaded
  - _Requirements: 13.3, 15.1_

- [ ] 1.6 Set up error handling and logging middleware
  - Create centralized error handling middleware for backend
  - Install and configure Winston for logging
  - Add request logging middleware
  - Create consistent error response format
  - Add error boundaries for React apps
  - **Test**: Trigger an error and verify proper error response and logging
  - _Requirements: 13.3_

- [ ]* 1.7 Set up basic testing infrastructure
  - Install Jest and React Testing Library
  - Configure test scripts for backend and frontend
  - Create sample unit tests for health check endpoint
  - Add test coverage reporting
  - **Test**: Run `npm test` in each workspace and verify tests pass
  - _Requirements: 13.3_

## 2. Authentication and User Management (User Service)

- [ ] 2.1 Create User model and registration endpoint
  - Create User table in PostgreSQL with schema: id, phoneNumber, email, name, password, createdAt, updatedAt
  - Create User model/repository with basic CRUD operations
  - Implement POST /api/v1/auth/register endpoint accepting phone/email and password
  - Add input validation using express-validator
  - Hash passwords using bcrypt before storage
  - Return success response with user ID
  - **Test**: Use Postman to register a new user, verify user is created in database
  - _Requirements: 1.1, 1.3_

- [ ] 2.2 Implement OTP generation and storage
  - Install Redis client and configure connection
  - Create OTP generation utility (6-digit random number)
  - Store OTP in Redis with phone/email as key and 10-minute expiry
  - Update registration endpoint to generate and store OTP
  - Add mock SMS/email service (console.log for now) to "send" OTP
  - **Test**: Register user and verify OTP is generated and stored in Redis, check console for OTP
  - _Requirements: 1.1, 1.3_

- [ ] 2.3 Implement OTP verification and JWT authentication
  - Install jsonwebtoken library
  - Create POST /api/v1/auth/verify-otp endpoint accepting phone/email and OTP
  - Verify OTP from Redis storage
  - Generate JWT access token on successful verification
  - Return token and user data in response
  - **Test**: Verify OTP using Postman, confirm JWT token is returned
  - _Requirements: 1.1, 15.4_

- [ ] 2.4 Create JWT authentication middleware
  - Create JWT verification middleware
  - Add middleware to protect routes requiring authentication
  - Create GET /api/v1/users/me endpoint (protected) returning current user
  - Handle token expiry and invalid token errors
  - **Test**: Call /api/v1/users/me with and without token, verify authentication works
  - _Requirements: 1.1, 15.4_

- [ ] 2.5 Implement user login endpoint
  - Create POST /api/v1/auth/login endpoint accepting phone/email
  - Generate and store OTP in Redis
  - Return success response indicating OTP sent
  - Reuse OTP verification endpoint for login completion
  - **Test**: Login with existing user, verify OTP, confirm token received
  - _Requirements: 1.1_

- [ ] 2.6 Build registration UI for web
  - Install Redux Toolkit and configure store
  - Create RegisterPage with phone/email input form
  - Create OTPVerificationPage with 6-digit input
  - Implement API calls to registration and verify-otp endpoints
  - Add form validation and error handling
  - Store JWT token in localStorage on success
  - Navigate to home page after successful registration
  - **Test**: Complete registration flow in browser, verify user can register and login
  - _Requirements: 1.1, 1.4_

- [ ] 2.7 Build registration UI for mobile
  - Configure Redux Toolkit store (shared structure with web)
  - Create RegisterScreen with phone/email input
  - Create OTPVerificationScreen with 6-digit input
  - Implement API calls using Axios
  - Store JWT token in AsyncStorage
  - Navigate to HomeScreen after successful registration
  - **Test**: Complete registration flow on mobile device/emulator
  - _Requirements: 1.1, 1.4_

- [ ] 2.8 Implement profile management endpoints
  - Add fields to User table: age, gender, location (jsonb), fitnessGoals (array), profileImage
  - Create PUT /api/v1/users/profile endpoint for profile updates
  - Create GET /api/v1/users/profile endpoint for profile retrieval
  - Add validation for profile fields
  - **Test**: Update and retrieve user profile using Postman
  - _Requirements: 1.2, 14.2_

- [ ] 2.9 Build profile screens (web and mobile)
  - Create ProfilePage/ProfileScreen showing user information
  - Create EditProfilePage/EditProfileScreen with form for updates
  - Add profile image upload (store as base64 or local file for now)
  - Implement location picker (manual input for now, Google Maps later)
  - Add fitness goals multi-select
  - **Test**: View and edit profile in both web and mobile apps
  - _Requirements: 1.2, 14.2_

## 3. Gym Discovery and Management (Gym Service)

- [ ] 3.1 Create Gym model and registration endpoint
  - Create Gym table in PostgreSQL with schema: id, name, ownerId, address, latitude, longitude, city, pincode, amenities (array), basePrice, capacity, rating, isVerified, createdAt
  - Create Gym model/repository with CRUD operations
  - Implement POST /api/v1/gyms/register endpoint (protected, requires auth)
  - Accept gym details and store in database
  - Set isVerified to false by default
  - **Test**: Register a gym using Postman with auth token, verify gym created in database
  - _Requirements: 7.1, 7.2_

- [ ] 3.2 Implement gym listing endpoint
  - Create GET /api/v1/gyms endpoint returning all gyms
  - Add pagination (limit, offset)
  - Return gym list with basic details
  - **Test**: Call endpoint and verify gym list is returned
  - _Requirements: 2.1_

- [ ] 3.3 Implement nearby gyms search with geospatial queries
  - Install PostGIS extension for PostgreSQL
  - Add geography column to Gym table for location
  - Create GET /api/v1/gyms/nearby endpoint accepting lat, lng, radius parameters
  - Implement geospatial query to find gyms within radius (default 5km)
  - Return gyms sorted by distance
  - **Test**: Search for nearby gyms with test coordinates, verify results are within radius
  - _Requirements: 2.1, 2.2_

- [ ] 3.4 Add gym filtering and search
  - Add query parameters to /api/v1/gyms/nearby for amenities and price range
  - Implement filtering logic for amenities (cardio, weights, shower, parking)
  - Add price range filtering (minPrice, maxPrice)
  - **Test**: Search with various filters and verify results match criteria
  - _Requirements: 2.2, 2.3_

- [ ] 3.5 Implement gym details endpoint
  - Create GET /api/v1/gyms/{gymId} endpoint
  - Return full gym details including all fields
  - Add operating hours field to Gym table (jsonb)
  - **Test**: Get gym details by ID and verify all information is returned
  - _Requirements: 2.5_

- [ ] 3.6 Build gym discovery UI for web
  - Create GymListPage showing nearby gyms
  - Add filter controls for amenities and price range
  - Display gym cards with name, address, price, rating
  - Add search by location input
  - Implement Redux actions for gym data
  - **Test**: Browse gyms, apply filters, verify UI updates correctly
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3.7 Build gym discovery UI for mobile
  - Create GymListScreen with gym cards
  - Add filter modal for amenities and price
  - Implement pull-to-refresh
  - Add location permission request for nearby search
  - **Test**: Browse gyms on mobile, apply filters, verify functionality
  - _Requirements: 2.1, 2.2, 2.3_

- [ ] 3.8 Build gym detail screen (web and mobile)
  - Create GymDetailPage/GymDetailScreen
  - Display gym images (placeholder for now), name, address, amenities
  - Show operating hours and pricing
  - Add "Book Now" button (non-functional for now)
  - **Test**: Navigate to gym details and verify all information displays correctly
  - _Requirements: 2.5_

- [ ] 3.9 Implement gym partner dashboard basics (web)
  - Create PartnerDashboardPage (protected route)
  - Display gym owner's gym information
  - Create GymEditPage for updating gym details
  - Add form for editing gym name, address, amenities, pricing
  - **Test**: Login as gym owner, view and edit gym details
  - _Requirements: 7.2, 7.3_

- [ ] 3.10 Add gym images upload
  - Add images field to Gym table (array of URLs)
  - Create POST /api/v1/gyms/{gymId}/images endpoint
  - Implement image upload to local storage or S3 (if configured)
  - Update gym edit form to support image upload
  - **Test**: Upload gym images and verify they are stored and displayed
  - _Requirements: 7.2_

## 4. Booking and QR Code System (Booking Service)

- [ ] 4.1 Create Booking model and basic booking endpoint
  - Create Booking table in PostgreSQL: id, userId, gymId, sessionDate, price, status, qrCode, createdAt
  - Create Booking model/repository with CRUD operations
  - Implement POST /api/v1/bookings endpoint (protected)
  - Accept gymId, sessionDate, and create booking with status 'pending'
  - Calculate price from gym's basePrice
  - Return booking details
  - **Test**: Create a booking using Postman, verify booking is created in database
  - _Requirements: 3.1, 3.3_

- [ ] 4.2 Generate QR code for bookings
  - Install qrcode library
  - Generate unique QR code string (booking ID + timestamp)
  - Store QR code string in booking record
  - Create GET /api/v1/bookings/{bookingId}/qrcode endpoint
  - Return QR code as base64 image
  - **Test**: Create booking and retrieve QR code, verify QR code image is returned
  - _Requirements: 4.1, 4.2_

- [ ] 4.3 Implement booking confirmation (skip payment for now)
  - Update POST /api/v1/bookings to set status to 'confirmed' immediately
  - Add qrCodeExpiry field (24 hours from booking)
  - Return booking with QR code in response
  - **Test**: Create booking and verify status is 'confirmed' with QR code
  - _Requirements: 3.1, 4.1_

- [ ] 4.4 Implement check-in endpoint
  - Create POST /api/v1/bookings/{bookingId}/checkin endpoint
  - Verify booking exists and status is 'confirmed'
  - Check QR code is not expired
  - Update status to 'checked_in' and record checkInTime
  - **Test**: Check-in with valid booking ID, verify status updates to 'checked_in'
  - _Requirements: 4.2, 4.3, 4.4_

- [ ] 4.5 Implement booking history endpoint
  - Create GET /api/v1/bookings/user endpoint (protected, uses JWT user ID)
  - Return user's bookings sorted by date (newest first)
  - Include gym details in response (join with Gym table)
  - Add pagination support
  - **Test**: Get booking history and verify user's bookings are returned
  - _Requirements: 3.3_

- [x] 4.6 Build booking UI for web
  - Create BookingPage with gym details and date picker
  - Add "Book Now" button that calls booking endpoint
  - Show booking confirmation with QR code display
  - Create BookingHistoryPage showing user's bookings
  - **Test**: Book a gym session from web app, view booking history
  - _Requirements: 3.1, 3.5_

- [x] 4.7 Build booking UI for mobile
  - Create BookingScreen with gym details and date picker
  - Implement booking creation flow
  - Create QRCodeScreen displaying booking QR code
  - Create BookingHistoryScreen with booking list
  - Store QR code locally for offline access
  - **Test**: Book a gym session from mobile app, view QR code and booking history
  - _Requirements: 3.1, 3.5, 4.1, 14.4_

- [ ] 4.8 Add booking cancellation
  - Create PUT /api/v1/bookings/{bookingId}/cancel endpoint
  - Update booking status to 'cancelled'
  - Add cancellation button to booking history UI
  - Show confirmation dialog before cancellation
  - **Test**: Cancel a booking and verify status updates
  - _Requirements: 3.3_

- [ ] 4.9 Implement capacity checking
  - Add currentOccupancy field to Gym table
  - Check gym capacity before creating booking
  - Return error if gym is at capacity for selected time
  - Update occupancy on check-in and check-out
  - **Test**: Try booking when gym is at capacity, verify error is returned
  - _Requirements: 3.1, 4.3_

## 5. Payment Processing (Payment Service)

- [ ] 5.1 Create Payment model and basic structure
  - Create Payment table in PostgreSQL: id, bookingId, userId, gymId, amount, platformCommission, gymEarnings, status, createdAt
  - Create Payment model/repository
  - Calculate commission: platformCommission = amount * 0.15, gymEarnings = amount * 0.85
  - **Test**: Verify table is created and commission calculation logic works
  - _Requirements: 3.2, 3.3_

- [ ] 5.2 Integrate Razorpay payment initiation
  - Install Razorpay SDK
  - Configure Razorpay with test API keys
  - Create POST /api/v1/payments/initiate endpoint
  - Create Razorpay order and store razorpayOrderId
  - Return order details to frontend
  - **Test**: Initiate payment using Postman, verify Razorpay order is created
  - _Requirements: 3.2_

- [ ] 5.3 Implement payment verification
  - Create POST /api/v1/payments/verify endpoint
  - Verify Razorpay payment signature using crypto
  - Update payment status to 'success' on verification
  - Update associated booking status to 'confirmed'
  - **Test**: Complete payment flow with Razorpay test cards, verify payment and booking status
  - _Requirements: 3.4, 3.5_

- [ ] 5.4 Update booking flow to require payment
  - Modify POST /api/v1/bookings to create booking with status 'pending'
  - Automatically initiate payment after booking creation
  - Only confirm booking after successful payment verification
  - **Test**: Create booking and complete payment, verify booking is confirmed only after payment
  - _Requirements: 3.1, 3.2_

- [ ] 5.5 Build payment UI for web
  - Install Razorpay checkout library
  - Update BookingPage to show payment modal after booking creation
  - Integrate Razorpay checkout with payment initiation
  - Handle payment success and failure callbacks
  - Show payment confirmation screen
  - **Test**: Complete end-to-end booking with payment on web
  - _Requirements: 3.2, 3.4_

- [ ] 5.6 Build payment UI for mobile
  - Install Razorpay React Native SDK
  - Update BookingScreen to trigger payment after booking
  - Integrate Razorpay checkout
  - Handle payment callbacks
  - Show payment success/failure screens
  - **Test**: Complete end-to-end booking with payment on mobile
  - _Requirements: 3.2, 3.4_

- [ ] 5.7 Implement refund for cancellations
  - Create POST /api/v1/payments/refund endpoint
  - Integrate Razorpay refund API
  - Update booking cancellation to trigger refund
  - Update payment status to 'refunded'
  - **Test**: Cancel a paid booking and verify refund is processed
  - _Requirements: 3.4_

- [ ] 5.8 Create gym partner earnings dashboard
  - Create GET /api/v1/payments/gym/{gymId}/earnings endpoint
  - Calculate total earnings, pending settlements
  - Add earnings display to partner dashboard
  - Show transaction history for gym
  - **Test**: View earnings on partner dashboard, verify calculations
  - _Requirements: 8.2, 9.1_

## 6. AI Fitness Coach (AI Service)

- [ ] 6.1 Create fitness profile model and endpoint
  - Create FitnessProfile collection in MongoDB with schema: userId, goals, fitnessLevel, height, weight, age, dietaryPreferences
  - Create POST /api/v1/ai/fitness-profile endpoint (protected)
  - Store user fitness profile data
  - Calculate and store BMI
  - **Test**: Create fitness profile using Postman, verify data is stored in MongoDB
  - _Requirements: 5.1_

- [ ] 6.2 Implement template-based workout plan generation
  - Create workout templates for beginner, intermediate, advanced levels
  - Create GET /api/v1/ai/workout-plan endpoint (protected)
  - Generate workout plan based on user's fitness level and goals
  - Return exercise list with sets, reps, duration
  - **Test**: Get workout plan for different fitness levels, verify appropriate exercises returned
  - _Requirements: 5.1, 5.4_

- [ ] 6.3 Implement nutrition plan generation
  - Create GET /api/v1/ai/nutrition-plan endpoint (protected)
  - Calculate daily calorie target based on age, weight, height, goals
  - Generate macro distribution (40% carbs, 30% protein, 30% fats)
  - Provide sample meal suggestions
  - **Test**: Get nutrition plan and verify calorie calculations are correct
  - _Requirements: 5.2_

- [ ] 6.4 Build fitness profile UI (web and mobile)
  - Create FitnessProfilePage/Screen with form for goals, fitness level, body metrics
  - Add goal selection (weight loss, muscle gain, general fitness)
  - Add fitness level selection (beginner, intermediate, advanced)
  - Add dietary preferences (vegetarian, vegan, non-veg)
  - **Test**: Complete fitness profile setup and verify data is saved
  - _Requirements: 5.1_

- [ ] 6.5 Build workout plan UI (web and mobile)
  - Create WorkoutPlanPage/Screen displaying exercise list
  - Show exercise name, sets, reps, duration
  - Add exercise completion checkboxes
  - Display workout plan based on user's fitness profile
  - **Test**: View workout plan and verify exercises match fitness level
  - _Requirements: 5.1, 5.4_

- [ ] 6.6 Build nutrition plan UI (web and mobile)
  - Create NutritionPlanPage/Screen showing daily calorie target
  - Display macro breakdown with visual charts
  - Show sample meal suggestions
  - Add water intake tracker
  - **Test**: View nutrition plan and verify calculations display correctly
  - _Requirements: 5.2_

- [ ] 6.7 Implement activity logging
  - Create POST /api/v1/ai/log-activity endpoint
  - Store workout completion data (date, exercises completed, duration)
  - Create GET /api/v1/ai/progress endpoint returning activity history
  - **Test**: Log workout activity and retrieve progress history
  - _Requirements: 5.3_

- [ ] 6.8 Build progress tracking UI (web and mobile)
  - Create ProgressPage/Screen with activity history
  - Display workout completion calendar
  - Show weekly/monthly statistics
  - Add simple charts for progress visualization
  - **Test**: Log activities and view progress tracking
  - _Requirements: 5.3_

## 7. Marketplace (Marketplace Service)

- [ ] 7.1 Create Product model and catalog endpoint
  - Create Product table in PostgreSQL: id, name, category, description, price, images (array), stockQuantity, rating, createdAt
  - Create Product model/repository
  - Implement GET /api/v1/marketplace/products endpoint
  - Add category filtering (supplement, gear, food)
  - Add pagination support
  - **Test**: Get product catalog with filters, verify products are returned
  - _Requirements: 6.1_

- [ ] 7.2 Seed sample products
  - Create seed script to add sample products (protein powder, dumbbells, yoga mat, etc.)
  - Add product images (use placeholder URLs)
  - Populate different categories
  - **Test**: Run seed script and verify products appear in catalog
  - _Requirements: 6.1_

- [ ] 7.3 Implement product details endpoint
  - Create GET /api/v1/marketplace/products/{productId} endpoint
  - Return full product details including images and description
  - **Test**: Get product details by ID and verify all information is returned
  - _Requirements: 6.2_

- [ ] 7.4 Build marketplace UI (web and mobile)
  - Create MarketplacePage/Screen with product grid
  - Add category filter tabs
  - Display product cards with image, name, price
  - Create ProductDetailPage/Screen with full product info
  - Add "Add to Cart" button (non-functional for now)
  - **Test**: Browse marketplace and view product details
  - _Requirements: 6.1, 6.2_

- [ ] 7.5 Implement shopping cart backend
  - Create Cart table in PostgreSQL: id, userId, productId, quantity, createdAt
  - Create POST /api/v1/marketplace/cart endpoint to add items
  - Create GET /api/v1/marketplace/cart endpoint to get user's cart
  - Create DELETE /api/v1/marketplace/cart/{itemId} endpoint to remove items
  - Calculate cart total
  - **Test**: Add items to cart, get cart, remove items using Postman
  - _Requirements: 6.3_

- [ ] 7.6 Build cart UI (web and mobile)
  - Create CartPage/Screen showing cart items
  - Display product name, quantity, price
  - Add quantity update controls
  - Add remove item button
  - Show cart total
  - Add "Checkout" button
  - **Test**: Add products to cart, update quantities, remove items
  - _Requirements: 6.3_

- [ ] 7.7 Implement order creation
  - Create Order table: id, userId, totalAmount, status, shippingAddress (jsonb), createdAt
  - Create OrderItem table: id, orderId, productId, quantity, price
  - Create POST /api/v1/marketplace/orders endpoint
  - Create order from cart items
  - Clear cart after order creation
  - **Test**: Create order from cart, verify order and order items are created
  - _Requirements: 6.3_

- [ ] 7.8 Integrate marketplace payment
  - Update order creation to initiate payment
  - Set order status to 'pending' initially
  - Update to 'confirmed' after payment verification
  - **Test**: Complete order with payment, verify order status updates
  - _Requirements: 6.3_

- [ ] 7.9 Build order history UI (web and mobile)
  - Create OrderHistoryPage/Screen with order list
  - Display order details (items, total, status, date)
  - Add order status badges
  - **Test**: View order history and verify orders are displayed
  - _Requirements: 6.4_

## 8. Fitness Classes

- [ ] 8.1 Create Class and Instructor models
  - Create Instructor table: id, name, bio, specialization, rating, profileImage
  - Create Class table: id, gymId, instructorId, name, type (yoga, zumba, dance), schedule (jsonb), capacity, price
  - Seed sample instructors and classes
  - **Test**: Verify tables are created and sample data is inserted
  - _Requirements: 10.1, 10.2_

- [ ] 8.2 Implement class listing endpoint
  - Create GET /api/v1/classes endpoint
  - Support filtering by type and gymId
  - Include instructor details in response
  - **Test**: Get class list with filters, verify classes and instructor info returned
  - _Requirements: 10.1_

- [ ] 8.3 Extend booking for classes
  - Add sessionType field to Booking table ('gym' or 'class')
  - Add classId field to Booking table
  - Update POST /api/v1/bookings to support class bookings
  - **Test**: Create class booking and verify it's stored correctly
  - _Requirements: 10.2_

- [ ] 8.4 Build classes UI (web and mobile)
  - Create ClassesPage/Screen with class list
  - Display class cards with type, instructor, schedule, price
  - Add filter by class type
  - Create ClassDetailPage/Screen with full class and instructor info
  - Add "Book Class" button
  - **Test**: Browse classes and book a class
  - _Requirements: 10.1, 10.2_

- [ ] 8.5 Add class bookings to history
  - Update booking history to show both gym and class bookings
  - Display class name and instructor for class bookings
  - **Test**: View booking history and verify class bookings appear
  - _Requirements: 10.2_

## 9. Referral and Rewards System

- [ ] 9.1 Add referral fields to User model
  - Add referralCode field to User table (unique, auto-generated)
  - Add referredBy field to User table
  - Add rewardPoints field to User table (default 0)
  - Generate unique referral code on user registration
  - **Test**: Register new user and verify referral code is generated
  - _Requirements: 11.1_

- [ ] 9.2 Implement referral tracking
  - Update registration to accept referral code
  - Store referredBy when user registers with referral code
  - Create Referral table: id, referrerId, referredUserId, status, rewardsCredited, createdAt
  - Credit 100 reward points to referrer when referred user completes first booking
  - **Test**: Register with referral code, complete booking, verify points credited
  - _Requirements: 11.1, 11.2_

- [ ] 9.3 Implement referral endpoints
  - Create GET /api/v1/referrals/stats endpoint showing referral count and earned points
  - Create GET /api/v1/users/rewards endpoint showing reward balance
  - **Test**: Get referral stats and reward balance using Postman
  - _Requirements: 11.4_

- [ ] 9.4 Build referral UI (web and mobile)
  - Create ReferralPage/Screen displaying user's referral code
  - Add copy-to-clipboard button for referral code
  - Show referral statistics (total referrals, points earned)
  - Add social share button (share referral link)
  - **Test**: View referral screen and copy referral code
  - _Requirements: 11.1, 11.4_

- [ ] 9.5 Implement reward redemption for bookings
  - Add option to use reward points during booking
  - Deduct points from user balance (100 points = ₹100 discount)
  - Update booking price calculation
  - **Test**: Book with reward points and verify discount applied
  - _Requirements: 11.3_

## 10. Corporate Wellness

- [ ] 10.1 Create corporate account models
  - Create CorporateAccount table: id, companyName, contactEmail, contactPhone, packageType, totalSessions, usedSessions, expiryDate, createdAt
  - Create EmployeeAccess table: id, corporateAccountId, employeeEmail, accessCode, sessionsUsed, createdAt
  - **Test**: Verify tables are created
  - _Requirements: 12.1, 12.2_

- [ ] 10.2 Implement corporate registration
  - Create POST /api/v1/corporate/register endpoint
  - Accept company details and package selection
  - Generate corporate account
  - **Test**: Register corporate account using Postman
  - _Requirements: 12.1_

- [ ] 10.3 Implement employee access code generation
  - Create POST /api/v1/corporate/{corpId}/employees endpoint
  - Generate unique access codes for employees
  - Send access codes via email
  - **Test**: Generate employee access codes and verify they're created
  - _Requirements: 12.2_

- [ ] 10.4 Implement corporate booking
  - Update booking endpoint to accept corporate access code
  - Validate access code and check session availability
  - Deduct from corporate account sessions
  - Track usage in EmployeeAccess table
  - **Test**: Book using corporate access code, verify session is deducted
  - _Requirements: 12.3_

- [ ] 10.5 Build corporate dashboard (web only)
  - Create CorporateDashboardPage showing account overview
  - Display total sessions, used sessions, remaining sessions
  - Show employee list with usage statistics
  - Add employee management (add/remove employees)
  - **Test**: View corporate dashboard and manage employees
  - _Requirements: 12.4_

## 11. Analytics and Reporting

- [ ] 11.1 Implement basic gym analytics endpoint
  - Create GET /api/v1/analytics/gym/{gymId} endpoint
  - Calculate total bookings and revenue for gym
  - Calculate daily, weekly, monthly statistics
  - **Test**: Get analytics for a gym and verify calculations
  - _Requirements: 8.1, 8.2_

- [ ] 11.2 Add analytics to partner dashboard
  - Update partner dashboard to show analytics
  - Display total bookings, revenue, average rating
  - Show recent bookings list
  - Add date range filter
  - **Test**: View analytics on partner dashboard
  - _Requirements: 8.1, 8.2, 8.3_

- [ ] 11.3 Implement peak hours analysis
  - Analyze booking times to identify peak hours
  - Display peak hours chart on partner dashboard
  - **Test**: View peak hours analysis
  - _Requirements: 8.3_

## 12. Admin Platform

- [ ] 12.1 Create admin user and authentication
  - Add isAdmin field to User table
  - Create admin seed script (admin user with credentials)
  - Update JWT middleware to check admin role
  - Create admin-only route protection
  - **Test**: Login as admin and verify admin access
  - _Requirements: 13.1_

- [ ] 12.2 Implement admin dashboard endpoint
  - Create GET /api/v1/admin/dashboard endpoint (admin only)
  - Calculate total users, gyms, bookings, revenue
  - Return platform-wide metrics
  - **Test**: Get admin dashboard metrics using Postman
  - _Requirements: 13.1_

- [ ] 12.3 Build admin dashboard UI (web only)
  - Create AdminDashboardPage with metrics cards
  - Display total users, gyms, bookings, revenue
  - Show recent activity (new users, bookings)
  - **Test**: View admin dashboard in browser
  - _Requirements: 13.1, 13.3_

- [ ] 12.4 Implement gym approval workflow
  - Add isVerified field to Gym table (default false)
  - Create GET /api/v1/admin/gyms/pending endpoint
  - Create PUT /api/v1/admin/gyms/{gymId}/approve endpoint
  - Update gym discovery to only show verified gyms
  - **Test**: Approve gym from admin panel, verify it appears in search
  - _Requirements: 13.5_

- [ ] 12.5 Build gym approval UI
  - Create GymApprovalPage showing pending gyms
  - Add approve/reject buttons
  - Display gym details for review
  - **Test**: Review and approve gyms from admin panel
  - _Requirements: 13.5_

## 13. Notifications

- [ ] 13.1 Set up basic email notifications
  - Install nodemailer library
  - Configure email service (Gmail SMTP for testing)
  - Create email utility function
  - Send welcome email on user registration
  - **Test**: Register user and verify welcome email is sent
  - _Requirements: 1.5_

- [ ] 13.2 Add booking confirmation emails
  - Send email on successful booking with booking details
  - Include QR code in email
  - **Test**: Complete booking and verify confirmation email
  - _Requirements: 3.5_

- [ ] 13.3 Add payment confirmation emails
  - Send email on successful payment with receipt
  - Include transaction details
  - **Test**: Complete payment and verify confirmation email
  - _Requirements: 3.5_

- [ ] 13.4 Implement push notifications for mobile (optional)
  - Configure Firebase Cloud Messaging
  - Add FCM token storage to User table
  - Send push notification on booking confirmation
  - **Test**: Complete booking on mobile and verify push notification
  - _Requirements: 1.5_

## 14. Security and Compliance

- [ ] 14.1 Implement rate limiting
  - Install express-rate-limit
  - Add rate limiting to auth endpoints (5 requests per 15 minutes)
  - Add rate limiting to API endpoints (100 requests per 15 minutes)
  - **Test**: Make multiple rapid requests and verify rate limiting works
  - _Requirements: 15.1_

- [ ] 14.2 Add security headers with Helmet
  - Install helmet.js
  - Configure helmet middleware
  - Add CORS configuration
  - **Test**: Check response headers include security headers
  - _Requirements: 15.1_

- [ ] 14.3 Implement input validation and sanitization
  - Add express-validator to all endpoints
  - Sanitize user inputs to prevent XSS
  - Add SQL injection prevention (using parameterized queries)
  - **Test**: Try malicious inputs and verify they're rejected
  - _Requirements: 15.1_

- [ ] 14.4 Add HTTPS support
  - Generate SSL certificate (self-signed for development)
  - Configure Express to use HTTPS
  - Update frontend to use HTTPS URLs
  - **Test**: Access application via HTTPS
  - _Requirements: 15.1, 15.3_

## 15. Cross-Platform Synchronization

- [ ] 15.1 Implement offline QR code storage
  - Store QR code data in AsyncStorage (mobile) and localStorage (web)
  - Load QR code from local storage when offline
  - Display offline indicator when no internet
  - **Test**: Turn off internet and verify QR code still displays
  - _Requirements: 14.4_

- [ ] 15.2 Add data caching for better performance
  - Cache gym list in Redux store
  - Cache user profile in local storage
  - Implement cache invalidation strategy
  - **Test**: Load app and verify data loads from cache
  - _Requirements: 14.2_

## 16. Performance Optimization

- [ ] 16.1 Add database indexes
  - Add index on User.phoneNumber and User.email
  - Add index on Gym.latitude and Gym.longitude
  - Add index on Booking.userId and Booking.gymId
  - Add index on Payment.bookingId
  - **Test**: Run EXPLAIN on queries and verify indexes are used
  - _Requirements: 2.1_

- [ ] 16.2 Implement Redis caching for gym search
  - Cache gym search results in Redis with 5-minute TTL
  - Use location and filters as cache key
  - Invalidate cache when gym data changes
  - **Test**: Search gyms twice and verify second request is faster
  - _Requirements: 2.1, 14.5_

- [ ] 16.3 Optimize image loading
  - Add lazy loading for images in web app
  - Implement image compression for uploads
  - Use placeholder images while loading
  - **Test**: Load pages with images and verify lazy loading works
  - _Requirements: 14.3_

## 17. Error Handling and Monitoring

- [ ] 17.1 Enhance error logging
  - Install Winston logger
  - Configure file and console logging
  - Log all errors with stack traces
  - Add request ID tracking for debugging
  - **Test**: Trigger errors and verify they're logged properly
  - _Requirements: 13.3_

- [ ] 17.2 Add error tracking with Sentry (optional)
  - Install Sentry SDK for backend and frontend
  - Configure Sentry with project DSN
  - Test error reporting to Sentry dashboard
  - **Test**: Trigger error and verify it appears in Sentry
  - _Requirements: 13.3_

## 18. Final Integration and Polish

- [ ] 18.1 Implement bottom navigation for mobile
  - Add bottom tab navigator with Home, Bookings, Marketplace, Profile tabs
  - Configure tab icons and labels
  - **Test**: Navigate between tabs on mobile app
  - _Requirements: 14.1_

- [ ] 18.2 Implement web navigation
  - Add header with logo and navigation links
  - Add user menu with profile and logout
  - Implement responsive sidebar for mobile web
  - **Test**: Navigate through web app using header links
  - _Requirements: 14.1_

- [ ] 18.3 Add loading states and error handling
  - Add loading spinners for all API calls
  - Add skeleton screens for data loading
  - Implement error boundaries for React components
  - Show user-friendly error messages
  - **Test**: Verify loading states and error handling work correctly
  - _Requirements: 14.3_

- [ ] 18.4 Polish UI/UX
  - Add consistent styling and theming
  - Implement smooth transitions and animations
  - Ensure responsive design for all screen sizes
  - Add empty states for lists
  - **Test**: Review all screens for visual consistency
  - _Requirements: 14.3_

- [ ] 18.5 Add settings screen
  - Create SettingsPage/Screen with user preferences
  - Add notification preferences toggle
  - Add logout functionality
  - Add app version display
  - **Test**: Update settings and verify changes are saved
  - _Requirements: 1.2_

- [ ] 18.6 Final end-to-end testing
  - Test complete user journey: register → browse gyms → book → pay → check-in
  - Test gym partner journey: register → add gym → view bookings → view analytics
  - Test marketplace journey: browse → add to cart → checkout → view orders
  - Test on multiple devices and browsers
  - **Test**: Verify all major flows work correctly
  - _Requirements: 1.1, 3.1, 6.3_
