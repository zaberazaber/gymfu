# GYMFU Shared Package

Shared TypeScript types, constants, and utilities used across all GYMFU applications (backend, web, mobile).

## Structure

```
shared/
├── types/
│   └── index.ts          # Shared TypeScript interfaces and types
├── constants/
│   └── index.ts          # Shared constants (API endpoints, error codes, etc.)
├── utils/
│   ├── validation.ts     # Validation utilities
│   └── formatting.ts     # Formatting utilities
├── index.ts              # Main export file
├── package.json
├── tsconfig.json
└── README.md
```

## Usage

### In Backend

```typescript
import { User, API_ENDPOINTS, validateEmail } from '../shared';

// Use shared types
const user: User = {
  id: '123',
  name: 'John Doe',
  // ...
};

// Use shared constants
app.get(API_ENDPOINTS.USER_PROFILE, handler);

// Use shared utilities
if (validateEmail(email)) {
  // ...
}
```

### In Web App

```typescript
import { HealthResponse, COLORS, formatCurrency } from '../../shared';

// Use shared types
const [health, setHealth] = useState<HealthResponse | null>(null);

// Use shared constants
const primaryColor = COLORS.PRIMARY;

// Use shared utilities
const price = formatCurrency(500);
```

### In Mobile App

```typescript
import { User, validatePhoneNumber, formatDate } from '../../shared';

// Use shared types
interface Props {
  user: User;
}

// Use shared utilities
if (validatePhoneNumber(phone)) {
  // ...
}
```

## Available Exports

### Types

- `User` - User interface
- `HealthResponse` - Health check response
- `ApiResponse<T>` - Generic API response
- `PaginatedResponse<T>` - Paginated API response
- `LoginRequest`, `RegisterRequest`, `OTPVerifyRequest` - Auth request types
- `AuthResponse` - Auth response type

### Constants

- `API_ENDPOINTS` - All API endpoint paths
- `ERROR_CODES` - Error code constants
- `STORAGE_KEYS` - Local storage key constants
- `PAGINATION` - Pagination defaults
- `VALIDATION` - Validation constants
- `COLORS` - App color palette

### Validation Utilities

- `validateEmail(email: string): boolean`
- `validatePhoneNumber(phone: string): boolean`
- `validatePassword(password: string): { isValid: boolean; errors: string[] }`
- `validateOTP(otp: string): boolean`
- `sanitizePhoneNumber(phone: string): string`
- `formatPhoneNumber(phone: string): string`

### Formatting Utilities

- `formatCurrency(amount: number): string` - Format as INR currency
- `formatDate(date: string | Date): string` - Format date
- `formatDateTime(date: string | Date): string` - Format date and time
- `formatTime(date: string | Date): string` - Format time only
- `formatDistance(meters: number): string` - Format distance (m/km)
- `formatDuration(minutes: number): string` - Format duration (min/h)
- `truncateText(text: string, maxLength: number): string`
- `capitalizeFirst(text: string): string`
- `formatPercentage(value: number, decimals?: number): string`

## Benefits

1. **Type Safety**: Shared types ensure consistency across all applications
2. **DRY Principle**: No code duplication for common utilities
3. **Single Source of Truth**: Constants defined once, used everywhere
4. **Easy Maintenance**: Update once, applies to all apps
5. **Better Collaboration**: Team members know where to find common code

## Adding New Shared Code

1. Add your type/constant/utility to the appropriate file
2. Export it from the main `index.ts`
3. Use it in your application by importing from `shared`

Example:

```typescript
// In shared/types/index.ts
export interface Gym {
  id: string;
  name: string;
  // ...
}

// In shared/index.ts
export * from './types';

// In your app
import { Gym } from '../../shared';
```
