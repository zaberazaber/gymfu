# Classes UI Troubleshooting Guide

## Issue: Blank Page on /classes Route

### Resolution
The ClassesPage and ClassDetailPage files were not initially created. They have now been created successfully.

## Files Created

### Web Files
1. `web/src/pages/ClassesPage.tsx` - Main classes listing page
2. `web/src/pages/ClassesPage.css` - Styling for classes page
3. `web/src/pages/ClassDetailPage.tsx` - Individual class detail page
4. `web/src/pages/ClassDetailPage.css` - Styling for class detail page

### Routes Added
The routes were already added to `web/src/App.tsx`:
- `/classes` → ClassesPage
- `/classes/:id` → ClassDetailPage

## Testing the Classes UI

### 1. Start the Backend
```bash
cd backend
npm run dev
```

### 2. Start the Web App
```bash
cd web
npm run dev
```

### 3. Navigate to Classes
- Open http://localhost:5173
- Click on "🧘 Fitness Classes" button on the home page
- Or navigate directly to http://localhost:5173/classes

### 4. Expected Behavior
- You should see a list of fitness classes
- Filter buttons at the top to filter by class type
- Each class card shows:
  - Class type badge
  - Price
  - Class name
  - Gym location
  - Instructor name and rating
  - Schedule
  - Capacity
  - Book button

### 5. Click on a Class
- Click any class card to view details
- You should see:
  - Full class information
  - Instructor details
  - Complete schedule
  - Booking section with price
  - "Book This Class" button

## Common Issues

### Issue: "No classes found"
**Solution**: Make sure you've seeded the classes data:
```bash
cd backend
npx ts-node src/scripts/seedClasses.ts
```

### Issue: API errors in console
**Solution**: 
1. Check that backend is running on port 3000
2. Verify the proxy is configured in `web/vite.config.ts`:
```typescript
server: {
  proxy: {
    '/api': 'http://localhost:3000'
  }
}
```

### Issue: 404 on class detail page
**Solution**: Make sure the class ID exists in the database. Check the classes table:
```sql
SELECT * FROM classes;
```

### Issue: Booking doesn't work
**Solution**:
1. Make sure you're logged in
2. Check that the bookings table has the new fields:
   - `session_type` (should be 'class')
   - `class_id`
3. Run the migration if needed:
```bash
cd backend
npx ts-node src/migrations/extend_bookings_for_classes.ts
```

## API Endpoints Used

The Classes UI uses these endpoints:
- `GET /api/v1/classes` - Get all classes
- `GET /api/v1/classes/:id` - Get class details
- `POST /api/v1/bookings` - Create class booking (with sessionType='class')

## Browser Console Checks

Open browser DevTools (F12) and check:
1. **Console tab**: Look for any JavaScript errors
2. **Network tab**: Check if API calls are successful (200 status)
3. **React DevTools**: Verify components are rendering

## Quick Verification

Run this in browser console on /classes page:
```javascript
// Should show the classes data
fetch('/api/v1/classes')
  .then(r => r.json())
  .then(d => console.log(d));
```

Expected output:
```json
{
  "success": true,
  "data": [
    {
      "id": 1,
      "name": "Morning Hatha Yoga",
      "type": "yoga",
      "gymName": "FitZone Gym",
      "instructorName": "Priya Sharma",
      ...
    }
  ]
}
```

## Next Steps

If everything works:
1. Test filtering by different class types
2. Test clicking on different classes
3. Test the booking flow (requires login)
4. Check that bookings appear in booking history

## Support

If issues persist:
1. Check backend logs for errors
2. Check browser console for errors
3. Verify all migrations have run
4. Verify seed data exists
5. Clear browser cache and reload
