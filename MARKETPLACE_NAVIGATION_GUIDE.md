# How to Navigate to Marketplace

## 🌐 Web App

### Option 1: From Home Page Buttons
1. Open the web app: `http://localhost:5173`
2. Login to your account
3. Click the **"🛒 Marketplace"** button in the main action buttons

### Option 2: From Feature Cards
1. Scroll down to the features section
2. Click on the **"Marketplace"** feature card (with 🛒 icon)

### Option 3: Direct URL
Simply navigate to: `http://localhost:5173/marketplace`

---

## 📱 Mobile App

### Option 1: From Home Screen Buttons
1. Open the mobile app
2. Login to your account
3. Tap the **"🛒 Marketplace"** button

### Option 2: From Feature Cards
1. Scroll down to the features section
2. Tap on the **"Marketplace"** feature card (with 🛒 icon)

### Option 3: Add to Navigation (Recommended)
To add Marketplace to the bottom tab navigation, update your navigation configuration:

```typescript
// In your navigation setup file
<Tab.Screen 
  name="Marketplace" 
  component={MarketplaceScreen}
  options={{
    tabBarIcon: ({ color, size }) => (
      <Text style={{ fontSize: size }}>🛒</Text>
    ),
  }}
/>
```

---

## 🧪 Quick Test

### Web
```bash
# 1. Start backend
cd backend
npm run dev

# 2. Seed products (if not done)
npm run db:create-products
npm run db:seed-products

# 3. Start web app
cd ../web
npm run dev

# 4. Open browser
# http://localhost:5173
# Login and click "🛒 Marketplace" button
```

### Mobile
```bash
# 1. Start backend (same as above)

# 2. Start mobile app
cd mobile
npm start

# 3. Run on device
npm run android  # or npm run ios

# 4. Login and tap "🛒 Marketplace" button
```

---

## 📍 Navigation Paths

### Web Routes
- Home: `/`
- Marketplace: `/marketplace`
- Product Detail: `/marketplace/products/:productId`

### Mobile Screens
- Home: `HomeScreen`
- Marketplace: `MarketplaceScreen`
- Product Detail: `ProductDetailScreen`

---

## ✨ What You'll See

### Marketplace Page/Screen
- Category filter tabs (All, Supplements, Gear, Food)
- Product grid with images and prices
- Stock indicators
- "Load More" button (web) or infinite scroll (mobile)

### Product Detail Page/Screen
- Full product images
- Product name and description
- Price and stock status
- "Add to Cart" button (placeholder)
- Product metadata

---

## 🎯 Features Available

✅ Browse all products  
✅ Filter by category  
✅ View product details  
✅ See stock availability  
✅ Responsive design  
✅ Loading states  
✅ Error handling  

🚧 Coming Soon:
- Add to cart functionality
- Shopping cart page
- Checkout process
- Order history

---

## 🐛 Troubleshooting

### "No products found"
**Solution**: Run the seed script
```bash
cd backend
npm run db:seed-products
```

### "Failed to fetch products"
**Solution**: Ensure backend is running
```bash
cd backend
npm run dev
```

### Mobile: "Cannot navigate to Marketplace"
**Solution**: Ensure the screen is registered in your navigation:
```typescript
// Add to your stack navigator
<Stack.Screen name="Marketplace" component={MarketplaceScreen} />
<Stack.Screen name="ProductDetail" component={ProductDetailScreen} />
```

---

## 📝 Updated Files

### Web
- `web/src/pages/HomePage.tsx` - Added marketplace button and clickable feature card
- `web/src/App.tsx` - Routes already configured

### Mobile
- `mobile/src/screens/HomeScreen.tsx` - Added marketplace button and touchable feature card
- Navigation needs to be configured (see below)

---

## 🔧 Mobile Navigation Setup

If you haven't set up the navigation yet, add these screens to your navigator:

```typescript
// In your navigation file (e.g., App.tsx or navigation/index.tsx)
import MarketplaceScreen from './src/screens/MarketplaceScreen';
import ProductDetailScreen from './src/screens/ProductDetailScreen';

// In your Stack Navigator
<Stack.Navigator>
  {/* ... existing screens ... */}
  <Stack.Screen 
    name="Marketplace" 
    component={MarketplaceScreen}
    options={{ title: 'Marketplace' }}
  />
  <Stack.Screen 
    name="ProductDetail" 
    component={ProductDetailScreen}
    options={{ title: 'Product Details' }}
  />
</Stack.Navigator>
```

---

## 🎉 You're All Set!

The marketplace is now accessible from:
- ✅ Home page button
- ✅ Feature card
- ✅ Direct URL (web)

Happy shopping! 🛒
