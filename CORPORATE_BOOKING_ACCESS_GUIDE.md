# Corporate Booking Access Guide

## Overview

The Corporate Wellness feature allows companies to purchase bulk gym session packages for their employees. Employees can then book gym sessions using unique access codes without individual payment.

## How to Access Corporate Booking

### For Companies (HR/Admin)

#### Step 1: Register Corporate Account

**API Endpoint:** `POST /api/v1/corporate/register`

**Requirements:**
- Must be authenticated (login first)
- Need company details and package selection

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/corporate/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "companyName": "Tech Innovations Inc",
    "contactEmail": "hr@techinnovations.com",
    "contactPhone": "9876543210",
    "contactPerson": "Sarah Johnson",
    "packageType": "standard",
    "totalSessions": 100,
    "durationMonths": 12
  }'
```

**Package Options:**
- **Basic**: ₹150/session (for small teams)
- **Standard**: ₹120/session - 20% discount (for medium companies)
- **Premium**: ₹100/session - 33% discount (for large enterprises)

**Response:**
```json
{
  "success": true,
  "data": {
    "id": 1,
    "companyName": "Tech Innovations Inc",
    "packageType": "standard",
    "totalSessions": 100,
    "pricePerSession": 120,
    "totalAmount": 12000,
    "expiryDate": "2025-11-30"
  }
}
```

#### Step 2: Add Employees

**API Endpoint:** `POST /api/v1/corporate/:accountId/employees`

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/corporate/1/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN" \
  -d '{
    "employees": [
      {
        "email": "john.doe@techinnovations.com",
        "name": "John Doe"
      },
      {
        "email": "jane.smith@techinnovations.com",
        "name": "Jane Smith"
      }
    ]
  }'
```

**Response:**
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "employeeEmail": "john.doe@techinnovations.com",
      "employeeName": "John Doe",
      "accessCode": "A7K9M2P5Q8R3",
      "status": "active"
    },
    {
      "id": 2,
      "employeeEmail": "jane.smith@techinnovations.com",
      "employeeName": "Jane Smith",
      "accessCode": "B3N6T8W1X4Y7",
      "status": "active"
    }
  ]
}
```

**Important:** Save and distribute these access codes to your employees!

#### Step 3: View Corporate Account Details

**API Endpoint:** `GET /api/v1/corporate/:accountId`

```bash
curl -X GET http://localhost:3000/api/v1/corporate/1 \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

**Response:**
```json
{
  "success": true,
  "data": {
    "account": {
      "id": 1,
      "companyName": "Tech Innovations Inc",
      "totalSessions": 100,
      "usedSessions": 15,
      "remainingSessions": 85,
      "status": "active",
      "expiryDate": "2025-11-30"
    },
    "stats": {
      "utilizationRate": 15,
      "activeEmployees": 25,
      "totalEmployees": 30
    }
  }
}
```

#### Step 4: Manage Employees

**List All Employees:**
```bash
curl -X GET http://localhost:3000/api/v1/corporate/1/employees \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

**Revoke Employee Access:**
```bash
curl -X PUT http://localhost:3000/api/v1/corporate/employees/5/revoke \
  -H "Authorization: Bearer YOUR_AUTH_TOKEN"
```

---

### For Employees

#### How to Book Using Corporate Access Code

**Step 1: Get Your Access Code**
- Your HR department will provide you with a unique 12-character access code
- Example: `A7K9M2P5Q8R3`

**Step 2: Validate Your Access Code**

**API Endpoint:** `POST /api/v1/corporate/validate-code`

**Example Request:**
```bash
curl -X POST http://localhost:3000/api/v1/corporate/validate-code \
  -H "Content-Type: application/json" \
  -d '{
    "accessCode": "A7K9M2P5Q8R3"
  }'
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "employee": {
      "id": 1,
      "employeeEmail": "john.doe@techinnovations.com",
      "employeeName": "John Doe",
      "accessCode": "A7K9M2P5Q8R3",
      "sessionsUsed": 3
    },
    "corporateAccount": {
      "id": 1,
      "companyName": "Tech Innovations Inc",
      "remainingSessions": 85,
      "expiryDate": "2025-11-30"
    }
  }
}
```

**Step 3: Book a Gym Session**

Once your access code is validated, you can book gym sessions. The booking will:
- Deduct from your company's session pool
- Not require payment from you
- Track your individual usage

**Note:** The booking integration with access codes needs to be implemented in the booking controller.

---

## Current Implementation Status

### ✅ Backend Complete
- Corporate account registration
- Employee management
- Access code generation and validation
- Session tracking
- All API endpoints functional

### ⏳ Frontend Pending
- **Web Dashboard** (for companies):
  - Corporate registration page
  - Employee management interface
  - Usage analytics dashboard
  
- **Mobile App** (for employees):
  - Access code input on booking screen
  - Corporate booking flow
  - Session usage display

---

## API Endpoints Reference

| Method | Endpoint | Description | Auth | User Type |
|--------|----------|-------------|------|-----------|
| POST | `/api/v1/corporate/register` | Register corporate account | ✅ | Company Admin |
| GET | `/api/v1/corporate/:id` | Get account details | ✅ | Company Admin |
| POST | `/api/v1/corporate/:id/employees` | Add employees | ✅ | Company Admin |
| GET | `/api/v1/corporate/:id/employees` | List employees | ✅ | Company Admin |
| PUT | `/api/v1/corporate/employees/:id/revoke` | Revoke employee | ✅ | Company Admin |
| POST | `/api/v1/corporate/validate-code` | Validate access code | ❌ | Employee |
| GET | `/api/v1/corporate` | List all accounts | ✅ | System Admin |

---

## Testing the Flow

### Quick Test Scenario

1. **Register a company:**
```bash
# Login first to get auth token
curl -X POST http://localhost:3000/api/v1/auth/login-password \
  -H "Content-Type: application/json" \
  -d '{"email": "admin@example.com", "password": "password123"}'

# Use the token from response
export TOKEN="your_jwt_token_here"

# Register corporate account
curl -X POST http://localhost:3000/api/v1/corporate/register \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "companyName": "Test Company",
    "contactEmail": "hr@testcompany.com",
    "contactPhone": "1234567890",
    "contactPerson": "Test Admin",
    "packageType": "standard",
    "totalSessions": 50,
    "durationMonths": 12
  }'
```

2. **Add employees:**
```bash
curl -X POST http://localhost:3000/api/v1/corporate/1/employees \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "employees": [
      {"email": "employee1@testcompany.com", "name": "Employee One"},
      {"email": "employee2@testcompany.com", "name": "Employee Two"}
    ]
  }'
```

3. **Validate access code (no auth needed):**
```bash
# Use one of the access codes from step 2 response
curl -X POST http://localhost:3000/api/v1/corporate/validate-code \
  -H "Content-Type: application/json" \
  -d '{"accessCode": "YOUR_ACCESS_CODE_HERE"}'
```

---

## Next Steps for Full Integration

### 1. Update Booking Controller
Add corporate booking support to the booking creation endpoint:
- Accept optional `corporateAccessCode` parameter
- Validate code before creating booking
- Deduct from corporate sessions
- Link booking to corporate account

### 2. Create Web Dashboard
Build corporate admin interface:
- Registration form with package selection
- Employee management table
- Bulk employee upload (CSV)
- Usage analytics and charts
- Access code distribution

### 3. Update Mobile App
Enhance booking screen:
- Add "Use Corporate Code" toggle
- Access code input field
- Show remaining corporate sessions
- Corporate booking confirmation

---

## Support

For issues or questions:
- Check API endpoint responses for error messages
- Verify authentication tokens are valid
- Ensure corporate account is active and not expired
- Confirm access codes are correct and not revoked

**Backend Status:** ✅ Fully operational on port 3000
**API Base URL:** `http://localhost:3000/api/v1`
