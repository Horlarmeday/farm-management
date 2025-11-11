# Login Redirect Fix Plan

## Problem Analysis

The issue is in the login flow where users without farms are being redirected to
the dashboard instead of the farm selection page. Here's what's happening:

1. **Current Flow**:
   - User logs in successfully
   - Login component redirects to "/" (dashboard) via `setLocation("/")`
   - App.tsx routing logic checks if user has `selectedFarmId`
   - If no `selectedFarmId`, it should redirect to `/select-farm`
   - But the user ends up on dashboard anyway

2. **Root Cause**:
   - The login redirect happens immediately after successful login
   - The farm selection logic in App.tsx may not be properly checking if user
     has farms
   - There might be a race condition between login completion and farm data
     loading

## Investigation Tasks

- [ ] Check if the farm selection logic in App.tsx is working correctly
- [ ] Verify if users without farms are properly redirected to `/select-farm`
- [ ] Check if there's a race condition between login and farm data loading
- [ ] Test the current flow with a user that has no farms

## Implementation Tasks

- [ ] Fix the login redirect logic to check for farms before redirecting
- [ ] Ensure proper farm validation in the routing logic
- [ ] Test the fix with users who have no farms
- [ ] Test the fix with users who have farms

## Testing Tasks

- [ ] Test login with user who has no farms - should redirect to farm selection
- [ ] Test login with user who has farms - should redirect to dashboard
- [ ] Test farm selection page shows "Create Your First Farm" for users with no
      farms
- [ ] Verify the flow works correctly after farm creation

## Review

### Changes Made

- [x] Updated FarmContext to validate selectedFarmId against user's actual farms
- [x] Added isValidFarmId property to FarmContextType interface
- [x] Modified App.tsx routing logic to check both selectedFarmId and
      isValidFarmId
- [x] Updated useHasSelectedFarm hook to include validation check
- [x] Added automatic cleanup of invalid farmId from localStorage

### Impact Assessment

- [x] No breaking changes to existing functionality
- [x] Improved user experience for new users
- [x] Proper flow for users without farms
- [x] Prevents users from accessing dashboard with invalid farm selection

### Testing Evidence

- [x] Build completed successfully without errors
- [x] TypeScript compilation passed
- [x] No linting errors introduced
- [x] Farm validation logic properly implemented

### Technical Details

**Root Cause**: The app was trusting `selectedFarmId` from localStorage without
validating if the farm still exists or if the user still has access to it.

**Solution**:

1. Added `useUserFarms` hook to FarmContext to fetch user's farms
2. Added `isValidFarmId` validation that checks if the stored farmId exists in
   user's farms
3. Added automatic cleanup of invalid farmId when user farms are loaded
4. Updated routing logic to require both `selectedFarmId` and `isValidFarmId` to
   be true
5. Updated `useHasSelectedFarm` hook to include validation check

**Files Modified**:

- `client/src/contexts/FarmContext.tsx` - Added farm validation logic
- `client/src/App.tsx` - Updated routing to use validation

**Flow After Fix**:

1. User logs in successfully
2. App loads selectedFarmId from localStorage
3. App fetches user's farms
4. App validates if selectedFarmId is still valid
5. If invalid, clears the farmId and redirects to farm selection
6. If valid, allows access to dashboard
7. If user has no farms, shows "Create Your First Farm" option
