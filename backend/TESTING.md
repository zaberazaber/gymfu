# GYMFU Backend Testing Guide

## Overview

The backend uses Jest as the testing framework with ts-jest for TypeScript support and Supertest for API testing.

## Running Tests

### Run all tests
```bash
npm test
```

### Run tests in watch mode
```bash
npm run test:watch
```

### Run tests with coverage
```bash
npm run test:coverage
```

## Test Structure

```
backend/src/
├── __tests__/
│   ├── health.test.ts          # Health endpoint tests
│   ├── validation.test.ts      # Validation utility tests
│   ├── formatting.test.ts      # Formatting utility tests
│   └── errorHandler.test.ts    # Error handling tests
```

## Writing Tests

### Unit Tests

Unit tests test individual functions or classes in isolation.

```typescript
import { validateEmail } from '../../../shared/utils/validation';

describe('validateEmail', () => {
  it('should validate correct email addresses', () => {
    expect(validateEmail('test@example.com')).toBe(true);
  });

  it('should reject invalid email addresses', () => {
    expect(validateEmail('invalid')).toBe(false);
  });
});
```

### API Tests

API tests use Supertest to test HTTP endpoints.

```typescript
import request from 'supertest';
import app from '../index';

describe('GET /health', () => {
  it('should return 200 OK', async () => {
    const response = await request(app).get('/health');
    expect(response.status).toBe(200);
  });
});
```

### Integration Tests

Integration tests test multiple components working together.

```typescript
describe('User Registration Flow', () => {
  it('should register user and send OTP', async () => {
    // Test registration
    const registerResponse = await request(app)
      .post('/api/v1/auth/register')
      .send({ phone: '9876543210', name: 'Test User' });
    
    expect(registerResponse.status).toBe(200);
    
    // Test OTP verification
    const verifyResponse = await request(app)
      .post('/api/v1/auth/verify-otp')
      .send({ phone: '9876543210', otp: '123456' });
    
    expect(verifyResponse.status).toBe(200);
  });
});
```

## Test Coverage

Current test coverage:
- **46 tests** passing
- **4 test suites**
- Coverage reports available in `coverage/` directory

### Coverage Goals

- **Statements:** > 80%
- **Branches:** > 75%
- **Functions:** > 80%
- **Lines:** > 80%

## Best Practices

### 1. Test Naming

Use descriptive test names that explain what is being tested:

```typescript
// Good
it('should return 400 when email is invalid', () => {});

// Bad
it('test email', () => {});
```

### 2. Arrange-Act-Assert Pattern

```typescript
it('should validate correct email', () => {
  // Arrange
  const email = 'test@example.com';
  
  // Act
  const result = validateEmail(email);
  
  // Assert
  expect(result).toBe(true);
});
```

### 3. Test One Thing

Each test should test one specific behavior:

```typescript
// Good
it('should return 200 OK', () => {});
it('should return correct message', () => {});

// Bad
it('should return 200 OK and correct message', () => {});
```

### 4. Use beforeEach/afterEach

Clean up between tests:

```typescript
describe('Database Tests', () => {
  beforeEach(async () => {
    await setupTestDatabase();
  });

  afterEach(async () => {
    await cleanupTestDatabase();
  });

  it('should create user', async () => {
    // Test code
  });
});
```

### 5. Mock External Dependencies

```typescript
jest.mock('../config/database');

describe('User Service', () => {
  it('should create user', async () => {
    // Mock database call
    (pgPool.query as jest.Mock).mockResolvedValue({ rows: [{ id: 1 }] });
    
    // Test code
  });
});
```

## Testing Utilities

### Shared Utilities

Tests for shared utilities are located in `src/__tests__/`:
- `validation.test.ts` - Email, phone, password validation
- `formatting.test.ts` - Currency, date, distance formatting

### Error Handling

Tests for error handling middleware:
- `errorHandler.test.ts` - AppError class and error middleware

### API Endpoints

Tests for API endpoints:
- `health.test.ts` - Health check endpoints

## Continuous Integration

Tests run automatically on:
- Every commit (pre-commit hook)
- Pull requests
- Before deployment

## Debugging Tests

### Run specific test file
```bash
npm test health.test.ts
```

### Run specific test
```bash
npm test -t "should return 200 OK"
```

### Debug in VS Code

Add to `.vscode/launch.json`:

```json
{
  "type": "node",
  "request": "launch",
  "name": "Jest Debug",
  "program": "${workspaceFolder}/node_modules/.bin/jest",
  "args": ["--runInBand"],
  "console": "integratedTerminal",
  "internalConsoleOptions": "neverOpen"
}
```

## Next Steps

As you implement features, add tests for:
- [ ] User authentication endpoints
- [ ] Gym CRUD operations
- [ ] Booking system
- [ ] Payment processing
- [ ] AI coach features
- [ ] Marketplace operations

## Resources

- [Jest Documentation](https://jestjs.io/)
- [Supertest Documentation](https://github.com/visionmedia/supertest)
- [Testing Best Practices](https://testingjavascript.com/)
