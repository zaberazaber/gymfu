# AI Chat Import Fix ✅

## Issue
The web application was throwing an error:
```
SyntaxError: The requested module '/src/store/index.ts' does not provide an export named 'RootState'
```

## Root Cause
The `AIChatPage.tsx` was importing `RootState` directly from the store and using the plain `useSelector` hook instead of using the typed hooks provided by the application.

## Solution
Updated `web/src/pages/AIChatPage.tsx` to use the proper typed hooks:

### Before
```typescript
import { useSelector } from 'react-redux';
import { RootState } from '../store';

const { token } = useSelector((state: RootState) => state.auth);
```

### After
```typescript
import { useAppSelector } from '../store/hooks';

const { token } = useAppSelector((state) => state.auth);
```

## Why This Works
The web application has a `hooks.ts` file that exports typed versions of Redux hooks:
- `useAppSelector` - Typed version of `useSelector` with `RootState`
- `useAppDispatch` - Typed version of `useDispatch` with `AppDispatch`

These hooks are the recommended way to use Redux in TypeScript applications as they provide proper type inference without needing to manually specify types.

## Status
✅ Fixed - No TypeScript errors
✅ Proper type inference maintained
✅ Follows application conventions

## Testing
The AI Chat page should now load without errors in the web application.
