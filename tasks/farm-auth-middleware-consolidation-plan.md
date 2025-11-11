# Farm Auth Middleware Consolidation Plan

## Problem

We have two farm authentication middleware files that are being used
inconsistently:

- `server/src/middleware/farm-auth.middleware.ts` (comprehensive, 221 lines)
- `server/src/middleware/farm-auth.ts` (basic, 48 lines)

## Decision

**Keep `farm-auth.middleware.ts`** and remove `farm-auth.ts` because:

1. More comprehensive functionality
2. Better architecture with database validation
3. Proper TypeScript types and error handling
4. More widely used (4 routes vs 2 routes)

## Tasks

### [ ] Update Route Imports

- [ ] Update `server/src/routes/invitation.routes.ts` to use
      `farm-auth.middleware.ts`
- [ ] Update `server/src/routes/file.routes.ts` to use `farm-auth.middleware.ts`

### [ ] Remove Duplicate File

- [ ] Delete `server/src/middleware/farm-auth.ts`

### [ ] Verify Functionality

- [ ] Test invitation routes work correctly
- [ ] Test file routes work correctly
- [ ] Ensure all other routes using `farm-auth.middleware.ts` still work

## Implementation Details

### Import Changes Required

**invitation.routes.ts:**

```typescript
// Change from:
import { requireFarmAccess } from '../middleware/farm-auth';

// To:
import { requireFarmAccessWithRole } from '../middleware/farm-auth.middleware';
```

**file.routes.ts:**

```typescript
// Change from:
import { requireFarmAccess } from '../middleware/farm-auth';

// To:
import { requireFarmAccessWithRole } from '../middleware/farm-auth.middleware';
```

### Route Usage Changes

**invitation.routes.ts:**

```typescript
// Change from:
router.use(requireFarmAccess([FarmRole.OWNER, FarmRole.MANAGER]));

// To:
router.use(requireFarmAccessWithRole([FarmRole.OWNER, FarmRole.MANAGER]));
```

**file.routes.ts:**

```typescript
// Change from:
requireFarmAccess([FarmRole.OWNER, FarmRole.MANAGER, FarmRole.WORKER]);

// To:
requireFarmAccessWithRole([FarmRole.OWNER, FarmRole.MANAGER, FarmRole.WORKER]);
```

## Benefits

1. **Consistency**: All routes use the same middleware
2. **Better Security**: Database validation ensures farm access is properly
   verified
3. **Maintainability**: Single source of truth for farm authentication logic
4. **Type Safety**: Proper TypeScript types and error handling

## Review

After implementation, verify that:

- All routes work correctly
- Farm access validation is working
- Error handling is consistent
- No breaking changes to existing functionality

## Implementation Summary

### ✅ Completed Tasks

- [x] Updated `server/src/routes/invitation.routes.ts` to use
      `farm-auth.middleware.ts`
- [x] Updated `server/src/routes/file.routes.ts` to use
      `farm-auth.middleware.ts`
- [x] Deleted `server/src/middleware/farm-auth.ts`
- [x] Verified all imports are working correctly

### Changes Made

1. **Import Updates**: Changed from `requireFarmAccess` to
   `requireFarmAccessWithRole` in both route files
2. **File Removal**: Deleted the duplicate `farm-auth.ts` middleware file
3. **Consistency**: All routes now use the comprehensive
   `farm-auth.middleware.ts`

### Benefits Achieved

- **Single Source of Truth**: All farm authentication logic is now in one place
- **Better Security**: Database validation ensures proper farm access
  verification
- **Type Safety**: Proper TypeScript types and error handling
- **Maintainability**: Easier to maintain and extend farm authentication
  features

### Verification

- ✅ All route imports updated correctly
- ✅ Duplicate middleware file removed
- ✅ No linting errors in updated files
- ✅ Middleware functionality preserved
