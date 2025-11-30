# GymFu Branding Guide

## Logo Assets

### Primary Logos
Located in: `shared/asssets/`

1. **GYMFU_V_Logo.png** - Vertical Logo
   - Use for: Headers, hero sections, large displays
   - Aspect ratio: Vertical/portrait orientation
   - Best for: Desktop headers, landing pages

2. **GYMFU_S_LOGO.png** - Square Logo  
   - Use for: App icons, favicons, compact spaces
   - Aspect ratio: Square (1:1)
   - Best for: Mobile apps, social media, small spaces

3. **GYMFU_Fevicon_App.png** - Favicon
   - Use for: Browser tabs, bookmarks
   - Size: Optimized for 16x16, 32x32, 64x64
   - Best for: Web favicons

4. **GymFu-BG.png** - Background Image
   - Use for: Hero sections, splash screens
   - Best for: Large background areas

## Brand Colors

### Primary Palette
```css
--brand-purple: #667eea;
--brand-violet: #764ba2;
--brand-gradient: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
```

### Neutral Colors
```css
--bg-primary: #f5f7fa;
--bg-secondary: #e9ecef;
--text-primary: #333333;
--text-secondary: #666666;
```

### Accent Colors
```css
--success: #28a745;
--error: #dc3545;
--warning: #ff9800;
--info: #17a2b8;
```

## Typography

### Font Hierarchy
- **Headings**: System font stack (San Francisco, Segoe UI, Roboto)
- **Body**: System font stack
- **Monospace**: Courier New, monospace (for codes, QR strings)

### Font Sizes
- **Large Title**: 2.2rem (35px)
- **Title**: 1.8rem (29px)
- **Heading**: 1.3rem (21px)
- **Body**: 1rem (16px)
- **Small**: 0.9rem (14px)
- **Tiny**: 0.8rem (13px)

## Logo Usage

### Web Implementation
```tsx
import Logo from '../components/Logo';

// Large logo (hero sections)
<Logo size="large" />

// Medium logo (headers)
<Logo size="medium" />

// Small logo (navigation)
<Logo size="small" />
```

### Mobile Implementation
```tsx
import { Image } from 'react-native';

<Image 
  source={require('../assets/logo.png')} 
  style={{ width: 200, height: 80 }}
  resizeMode="contain"
/>
```

## Spacing & Layout

### Spacing Scale
```css
--space-xs: 4px;
--space-sm: 8px;
--space-md: 16px;
--space-lg: 24px;
--space-xl: 32px;
--space-2xl: 48px;
```

### Border Radius
```css
--radius-sm: 6px;
--radius-md: 12px;
--radius-lg: 20px;
--radius-full: 9999px;
```

## Component Patterns

### Buttons
```css
Primary Button:
- Background: linear-gradient(135deg, #667eea 0%, #764ba2 100%)
- Color: #ffffff
- Padding: 12px 24px
- Border Radius: 12px
- Shadow: 0 4px 12px rgba(102, 126, 234, 0.3)

Secondary Button:
- Background: #f8f9fa
- Color: #333333
- Border: 1px solid #e9ecef
```

### Cards
```css
Card:
- Background: #ffffff
- Border Radius: 12px
- Shadow: 0 4px 12px rgba(0, 0, 0, 0.1)
- Padding: 20px
```

### Badges
```css
Badge:
- Background: #f0f8ff
- Color: #4a90e2
- Padding: 4px 12px
- Border Radius: 12px
- Font Size: 0.8rem
```

## Icon Usage

### Emoji Icons (Current)
- 🏋️ Gym/Fitness
- 🧘 Yoga/Classes
- 💪 Strength/Workout
- 📅 Booking/Schedule
- 🛒 Shopping/Marketplace
- 💬 Chat/AI Coach
- 📍 Location
- ⭐ Rating
- 🔥 Popular/Trending

### When to Use Logo vs Icons
- **Logo**: Brand identity, headers, splash screens
- **Icons**: Feature indicators, navigation, actions

## Responsive Breakpoints

```css
/* Mobile */
@media (max-width: 480px) { }

/* Tablet */
@media (max-width: 768px) { }

/* Desktop */
@media (min-width: 769px) { }

/* Large Desktop */
@media (min-width: 1200px) { }
```

## Accessibility

### Contrast Ratios
- Text on white: Minimum 4.5:1
- Large text on white: Minimum 3:1
- Interactive elements: Minimum 3:1

### Logo Alt Text
```html
<!-- Web -->
<img src="/logo.png" alt="GymFu Logo" />

<!-- Mobile -->
<Image 
  source={require('./logo.png')} 
  accessible={true}
  accessibilityLabel="GymFu Logo"
/>
```

## Do's and Don'ts

### ✅ Do
- Use official logo files
- Maintain aspect ratio
- Provide adequate spacing around logo
- Use brand colors consistently
- Ensure logo is legible at all sizes

### ❌ Don't
- Stretch or distort logo
- Change logo colors
- Add effects to logo (shadows, gradients on logo itself)
- Use low-resolution versions
- Place logo on busy backgrounds

## File Naming Convention

```
Logo files:
- logo.png (main logo)
- logo-square.png (square variant)
- logo-white.png (white version for dark backgrounds)
- favicon.ico (browser favicon)

Icons:
- icon-[name].png
- icon-[name]@2x.png (retina)
- icon-[name]@3x.png (high-res)
```

## Export Guidelines

### Web
- Format: PNG with transparency
- Size: 2x resolution for retina displays
- Optimization: Use ImageOptim or similar

### Mobile
- iOS: Multiple sizes (1x, 2x, 3x)
- Android: Multiple densities (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
- Format: PNG with transparency

## Brand Voice

### Tone
- **Motivational**: Encouraging and supportive
- **Professional**: Trustworthy and reliable
- **Friendly**: Approachable and warm
- **Energetic**: Active and dynamic

### Messaging
- "Your Ultimate Fitness Companion"
- "Your Fitness, Your Way"
- "Discover. Book. Achieve."
- "Fitness Made Simple"

## Contact

For branding questions or new asset requests, refer to the design team or project documentation.

---

**Last Updated**: December 2024
**Version**: 1.0
