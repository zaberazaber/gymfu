# Fix: Classes Type Errors (Price and Rating)

## Issue
Both web and mobile apps were crashing with errors:
- `cls.instructorRating.toFixed is not a function`
- Price display errors

## Root Cause
PostgreSQL returns DECIMAL and NUMERIC column types as strings in JavaScript to preserve precision. The `price` and `instructorRating` fields were being returned as strings from the database, but the TypeScript interfaces expected numbers.

## Solution Applied

### Updated Type Definitions
Changed the interface definitions to accept both string and number types:

```typescript
interface Class {
  // ... other fields
  price: number | string;  // Was: number
  instructorRating: number | string;  // Was: number
}
```

### Updated Display Logic
Added type checking and conversion before calling number methods:

**For Price:**
```typescript
// Before
₹{cls.price}

// After
₹{typeof cls.price === 'string' ? parseFloat(cls.price) : cls.price}
```

**For Rating:**
```typescript
// Before
⭐ {cls.instructorRating.toFixed(1)}

// After
⭐ {typeof cls.instructorRating === 'string' ? parseFloat(cls.instructorRating).toFixed(1) : cls.instructorRating.toFixed(1)}
```

## Files Modified

### Web
1. `web/src/pages/ClassesPage.tsx`
   - Updated Class interface
   - Fixed price display
   - Fixed rating display

2. `web/src/pages/ClassDetailPage.tsx`
   - Updated Class interface
   - Fixed price display (2 locations)
   - Fixed rating display

### Mobile
1. `mobile/src/screens/ClassesScreen.tsx`
   - Updated Class interface
   - Fixed price display
   - Fixed rating display

2. `mobile/src/screens/ClassDetailScreen.tsx`
   - Updated Class interface
   - Fixed price display (2 locations)
   - Fixed rating display

## Testing

### Web
1. Navigate to http://localhost:5173/classes
2. Verify classes list displays without errors
3. Click on a class to view details
4. Verify price and rating display correctly

### Mobile
1. Navigate to Classes screen
2. Verify classes list displays without errors
3. Tap on a class to view details
4. Verify price and rating display correctly

## Status
✅ Web classes page working
✅ Web class detail page working
✅ Mobile classes screen working
✅ Mobile class detail screen working
✅ All type errors resolved

## Note
This is a common issue when working with PostgreSQL DECIMAL/NUMERIC types. Always handle these fields as potentially being strings when received from the API.
