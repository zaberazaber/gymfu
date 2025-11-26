# Mobile Marketplace API Fix

## Issue
Mobile app was showing "Failed to fetch products" error when accessing the marketplace.

## Root Cause
The mobile screens were incorrectly constructing API URLs:
- They were removing `/api/v1` from the base URL
- Then trying to fetch from `/marketplace/products`
- This resulted in requests to the wrong endpoint

## Solution
Updated both `MarketplaceScreen.tsx` and `ProductDetailScreen.tsx` to:
1. Import the configured `api` instance instead of `API_BASE_URL`
2. Use `api.get()` with relative paths (e.g., `/marketplace/products`)
3. The api instance automatically handles the correct base URL including `/api/v1`
4. Added product deduplication during pagination to prevent duplicate keys
5. Improved key extractor to use both product ID and index for uniqueness

## Files Changed
- `mobile/src/screens/MarketplaceScreen.tsx`
- `mobile/src/screens/ProductDetailScreen.tsx`

## Testing
1. Restart the mobile app
2. Navigate to the Marketplace tab
3. Products should now load successfully
4. Tap on a product to view details
5. Product details should load correctly

## Technical Details
The `api` instance from `mobile/src/utils/api.ts` is pre-configured with:
- Correct base URL detection (local dev vs production)
- Proper `/api/v1` prefix
- Request/response interceptors
- Error handling
- Timeout configuration

Using this instance ensures consistent API communication across the mobile app.
