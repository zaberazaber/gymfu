# Task 4.1 Completed: Create Booking Model and Basic Booking Endpoint

## ✅ What Was Implemented

### Backend

1. **Booking Model** (`backend/src/models/Booking.ts`)
   - Created Booking interface with all required fields
   - Implemented CRUD operations:
     - `create()` - Create new booking
     - `findById()` - Get booking by ID
     - `findByUserId()` - Get user's bookings with pagination
     - `updateStatus()` - Update booking status
     - `updateQrCode()` - Update QR code (for future use)

2. **Booking Controller** (`backend/src/controllers/bookingController.ts`)
   - `createBooking` - Creates booking with gym's base price
   - `getBookingById` - Gets specific booking (with user authorization)
   - `getUserBookings` - Gets all user's bookings with pagination
   - `cancelBooking` - Cancels a booking with validation

3. **Booking Routes** (`backend/src/routes/bookings.ts`)
   - `POST /api/v1/bookings` - Create booking (protected)
   - `GET /api/v1/bookings/user` - Get user bookings (protected)
   - `GET /api/v1/bookings/:bookingId` - Get booking by ID (protected)
   - `PUT /api/v1/bookings/:bookingId/cancel` - Cancel booking (protected)

4. **Database Migration** (`backend/src/scripts/createBookingsTable.ts`)
   - Creates bookings table with proper schema
   - Adds foreign key constraints to users and gyms tables
   - Creates indexes for performance (user_id, gym_id, session_date, status)
   - Adds status constraint validation

5. **Server Integration** (`backend/src/index.ts`)
   - Registered booking routes at `/api/v1/bookings`
   - Added logging for booking routes

### Web App

1. **Booking Slice** (`web/src/store/bookingSlice.ts`)
   - Redux state management for bookings
   - Async thunks:
     - `createBooking` - Create new booking
     - `getUserBookings` - Fetch user's bookings
     - `getBookingById` - Fetch specific booking
     - `cancelBooking` - Cancel a booking
   - Actions:
     - `clearError` - Clear error state
     - `clearSelectedBooking` - Clear selected booking

2. **Store Integration** (`web/src/store/index.ts`)
   - Added booking reducer to Redux store

### Mobile App

1. **Booking Slice** (`mobile/src/store/bookingSlice.ts`)
   - Same functionality as web with AsyncStorage for token management
   - All async thunks implemented with proper authentication

2. **Store Integration** (`mobile/src/store/index.ts`)
   - Added booking reducer to Redux store

---

## 📋 Database Schema

```sql
CREATE TABLE bookings (
  id SERIAL PRIMARY KEY,
  user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  gym_id INTEGER NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  session_date TIMESTAMP NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending',
  qr_code TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT valid_status CHECK (status IN ('pending', 'confirmed', 'cancelled', 'checked_in', 'completed'))
);

-- Indexes
CREATE INDEX idx_bookings_user_id ON bookings(user_id);
CREATE INDEX idx_bookings_gym_id ON bookings(gym_id);
CREATE INDEX idx_bookings_session_date ON bookings(session_date);
CREATE INDEX idx_bookings_status ON bookings(status);
```

---

## 🔧 API Endpoints

### Create Booking
```
POST /api/v1/bookings
Authorization: Bearer <token>

Request Body:
{
  "gymId": 1,
  "sessionDate": "2024-12-25T10:00:00Z"
}

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "gymId": 1,
    "sessionDate": "2024-12-25T10:00:00Z",
    "price": 500,
    "status": "pending",
    "qrCode": null,
    "createdAt": "2024-11-24T10:00:00Z"
  },
  "message": "Booking created successfully"
}
```

### Get User Bookings
```
GET /api/v1/bookings/user?limit=10&offset=0
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": [
    {
      "id": 1,
      "userId": 1,
      "gymId": 1,
      "sessionDate": "2024-12-25T10:00:00Z",
      "price": 500,
      "status": "pending",
      "qrCode": null,
      "createdAt": "2024-11-24T10:00:00Z"
    }
  ],
  "pagination": {
    "limit": 10,
    "offset": 0,
    "total": 1
  }
}
```

### Get Booking by ID
```
GET /api/v1/bookings/:bookingId
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "gymId": 1,
    "sessionDate": "2024-12-25T10:00:00Z",
    "price": 500,
    "status": "pending",
    "qrCode": null,
    "createdAt": "2024-11-24T10:00:00Z"
  }
}
```

### Cancel Booking
```
PUT /api/v1/bookings/:bookingId/cancel
Authorization: Bearer <token>

Response:
{
  "success": true,
  "data": {
    "id": 1,
    "userId": 1,
    "gymId": 1,
    "sessionDate": "2024-12-25T10:00:00Z",
    "price": 500,
    "status": "cancelled",
    "qrCode": null,
    "createdAt": "2024-11-24T10:00:00Z",
    "updatedAt": "2024-11-24T11:00:00Z"
  },
  "message": "Booking cancelled successfully"
}
```

---

## 🎯 Features Implemented

### Backend Features
- ✅ Booking creation with automatic price calculation from gym
- ✅ Session date validation (must be in future)
- ✅ User authorization (users can only access their own bookings)
- ✅ Booking status management (pending, confirmed, cancelled, checked_in, completed)
- ✅ Pagination support for booking history
- ✅ Proper error handling and validation
- ✅ Database constraints and indexes for performance

### Frontend Features (Web & Mobile)
- ✅ Redux state management for bookings
- ✅ Create booking action
- ✅ Fetch user bookings action
- ✅ Fetch specific booking action
- ✅ Cancel booking action
- ✅ Error handling and loading states
- ✅ Token-based authentication

---

## 🧪 Testing

### Create Bookings Table
```bash
cd backend
npm run db:create-bookings
```

### Test with Postman

1. **Create a Booking**
   ```
   POST http://localhost:3000/api/v1/bookings
   Headers:
     Authorization: Bearer <your_token>
     Content-Type: application/json
   Body:
     {
       "gymId": 1,
       "sessionDate": "2024-12-25T10:00:00Z"
     }
   ```

2. **Get User Bookings**
   ```
   GET http://localhost:3000/api/v1/bookings/user
   Headers:
     Authorization: Bearer <your_token>
   ```

3. **Get Booking by ID**
   ```
   GET http://localhost:3000/api/v1/bookings/1
   Headers:
     Authorization: Bearer <your_token>
   ```

4. **Cancel Booking**
   ```
   PUT http://localhost:3000/api/v1/bookings/1/cancel
   Headers:
     Authorization: Bearer <your_token>
   ```

---

## 📝 Validation Rules

1. **Create Booking**
   - gymId is required
   - sessionDate is required
   - sessionDate must be in the future
   - Gym must exist
   - User must be authenticated

2. **Cancel Booking**
   - Booking must exist
   - User must own the booking
   - Booking cannot already be cancelled
   - Cannot cancel completed or checked-in bookings

---

## 🔄 Next Steps (Task 4.2)

The next task will implement:
- QR code generation for bookings
- QR code storage in booking record
- QR code retrieval endpoint
- QR code display in UI

---

## 📦 Files Created

### Backend
- `backend/src/models/Booking.ts`
- `backend/src/controllers/bookingController.ts`
- `backend/src/routes/bookings.ts`
- `backend/src/scripts/createBookingsTable.ts`

### Web
- `web/src/store/bookingSlice.ts`

### Mobile
- `mobile/src/store/bookingSlice.ts`

### Modified
- `backend/src/index.ts` - Added booking routes
- `backend/package.json` - Added db:create-bookings script
- `web/src/store/index.ts` - Added booking reducer
- `mobile/src/store/index.ts` - Added booking reducer

---

## ✅ Task 4.1 Status: COMPLETE

All requirements for task 4.1 have been implemented:
- ✅ Booking table created in PostgreSQL
- ✅ Booking model/repository with CRUD operations
- ✅ POST /api/v1/bookings endpoint (protected)
- ✅ Accepts gymId and sessionDate
- ✅ Creates booking with status 'pending'
- ✅ Calculates price from gym's basePrice
- ✅ Returns booking details
- ✅ Redux state management for web and mobile
- ✅ Ready for testing with Postman
