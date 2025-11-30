# Task 8: Fitness Classes Implementation Progress

## Completed Tasks

### ✅ 8.1 Create Class and Instructor models
- Created `Instructor` model with fields: id, name, bio, specialization, rating, profileImage
- Created `Class` model with fields: id, gymId, instructorId, name, type, schedule (JSONB), capacity, price, description
- Created database migration `create_classes_tables.ts`
- Created seed script `seedClasses.ts` with 6 instructors and 8 sample classes
- Successfully ran migration and seeded data

### ✅ 8.2 Implement class listing endpoint
- Created `classController.ts` with endpoints:
  - `GET /api/v1/classes` - List all classes with optional filters (type, gymId)
  - `GET /api/v1/classes/:id` - Get class details with instructor and gym info
  - `GET /api/v1/instructors` - List all instructors
  - `GET /api/v1/instructors/:id` - Get instructor details
- Created `routes/classes.ts` and registered in main `index.ts`
- All endpoints include instructor details in response

## Remaining Tasks

### 🔄 8.3 Extend booking for classes
**Status:** Ready to implement
**Steps:**
1. Create migration to add fields to bookings table:
   - `session_type` VARCHAR(10) CHECK (session_type IN ('gym', 'class'))
   - `class_id` INTEGER REFERENCES classes(id) ON DELETE CASCADE (nullable)
2. Update Booking model interface to include:
   - `sessionType?: 'gym' | 'class'`
   - `classId?: number`
3. Update `BookingModel.create()` to accept optional classId and sessionType
4. Update `BookingController.createBooking()` to handle class bookings
5. Update `findByUserIdWithGymDetails()` to include class details when sessionType is 'class'

### 📱 8.4 Build classes UI (web and mobile)
**Status:** Pending backend completion
**Web Components Needed:**
- `ClassesPage.tsx` - List all classes with filters
- `ClassDetailPage.tsx` - Show class details with instructor info
- `ClassesPage.css` - Styling

**Mobile Components Needed:**
- `ClassesScreen.tsx` - List all classes with filters
- `ClassDetailScreen.tsx` - Show class details with instructor info

**Features:**
- Display class cards with type, instructor, schedule, price
- Filter by class type (yoga, zumba, dance, pilates, spinning, crossfit, boxing)
- Show instructor rating and specialization
- "Book Class" button that creates class booking
- Schedule display showing days and times

### 📋 8.5 Add class bookings to history
**Status:** Pending 8.3 and 8.4
**Steps:**
1. Update `BookingHistoryPage/Screen` to show both gym and class bookings
2. Display class name and instructor for class bookings
3. Show different icons/badges for gym vs class bookings

## Files Created

### Backend
- `backend/src/models/Instructor.ts`
- `backend/src/models/Class.ts`
- `backend/src/migrations/create_classes_tables.ts`
- `backend/src/scripts/seedClasses.ts`
- `backend/src/controllers/classController.ts`
- `backend/src/routes/classes.ts`

### Database Schema
```sql
-- Instructors table
CREATE TABLE instructors (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  bio TEXT NOT NULL,
  specialization VARCHAR(255) NOT NULL,
  rating DECIMAL(3, 2) DEFAULT 0,
  profile_image TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Classes table
CREATE TABLE classes (
  id SERIAL PRIMARY KEY,
  gym_id INTEGER NOT NULL REFERENCES gyms(id),
  instructor_id INTEGER NOT NULL REFERENCES instructors(id),
  name VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('yoga', 'zumba', 'dance', 'pilates', 'spinning', 'crossfit', 'boxing')),
  schedule JSONB NOT NULL,
  capacity INTEGER NOT NULL,
  price DECIMAL(10, 2) NOT NULL,
  description TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

## API Endpoints Available

- `GET /api/v1/classes` - List classes (supports ?type=yoga&gymId=1)
- `GET /api/v1/classes/:id` - Get class details
- `GET /api/v1/instructors` - List instructors
- `GET /api/v1/instructors/:id` - Get instructor details

## Next Steps

1. Complete task 8.3 by creating the booking extension migration
2. Update booking controller to handle class bookings
3. Build web UI for classes (ClassesPage, ClassDetailPage)
4. Build mobile UI for classes (ClassesScreen, ClassDetailScreen)
5. Update booking history to show class bookings

## Testing

To test the completed endpoints:
```bash
# List all classes
curl http://localhost:3000/api/v1/classes

# Filter by type
curl http://localhost:3000/api/v1/classes?type=yoga

# Get class details
curl http://localhost:3000/api/v1/classes/1

# List instructors
curl http://localhost:3000/api/v1/instructors
```
