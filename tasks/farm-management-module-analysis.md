# Farm Management Module Analysis Report

**Date**: 2025-10-18
**Analysis Scope**: Complete Farm Management System (Server & Client)

---

## Executive Summary

The Farm Management module analysis reveals a well-structured multi-tenant farm system with proper authentication, authorization, and CRUD operations. The implementation shows good separation of concerns between server and client, with a few minor API endpoint mismatches that need to be addressed.

### Overall Status: **GOOD** ✓

**Key Findings**:
- Core CRUD operations fully implemented
- Farm context and switching functionality working properly
- Minor API endpoint mismatches for user/invitation management
- No hardcoded farm IDs or mock data in production code
- Proper multi-tenant architecture with role-based access control

---

## 1. Server Implementation Analysis

### 1.1 API Endpoints (Routes)

**File**: `/Users/mahmudaj/Desktop/Projects/Personal/farm-management/server/src/routes/farm.routes.ts`

**Status**: ✓ Complete

#### Available Endpoints:
```typescript
✓ GET    /api/farms/user          - Get farms for authenticated user
✓ GET    /api/farms/:id           - Get farm by ID
✓ POST   /api/farms               - Create new farm
✓ PUT    /api/farms/:id           - Update farm
✓ DELETE /api/farms/:id           - Delete farm
```

**Authentication**: All routes require authentication via `authenticate` middleware

**Issues**: None - all basic CRUD operations are implemented

---

### 1.2 Controller Implementation

**File**: `/Users/mahmudaj/Desktop/Projects/Personal/farm-management/server/src/controllers/FarmController.ts`

**Status**: ✓ Complete

#### Implemented Methods:
1. **getUserFarms()** (Lines 14-41)
   - Fetches farms for authenticated user
   - Returns FarmUser[] with farm relations
   - Proper error handling and validation

2. **getFarmById()** (Lines 46-84)
   - Includes access control check via `checkFarmAccess()`
   - Returns 403 if user lacks access
   - Proper authorization pattern

3. **createFarm()** (Lines 89-117)
   - Creates farm with authenticated user as owner
   - Automatically creates FarmUser entry with OWNER role
   - Returns 201 on success

4. **updateFarm()** (Lines 122-161)
   - Includes access control check
   - Proper validation before update
   - Returns updated farm entity

5. **deleteFarm()** (Lines 166-204)
   - Enhanced security: checks for OWNER role specifically
   - Only farm owners can delete farms
   - Proper cascade deletion

**Issues**: None - all methods properly implemented with security checks

---

### 1.3 Service Layer

**File**: `/Users/mahmudaj/Desktop/Projects/Personal/farm-management/server/src/services/FarmService.ts`

**Status**: ✓ Complete

#### Implemented Services:
1. **getUserFarms()** (Lines 25-47)
   - Returns FarmUser[] with farm relations
   - Filters by isActive = true
   - Proper error handling

2. **getFarmById()** (Lines 52-82)
   - Includes farm users and user relations
   - Returns proper API response structure

3. **createFarm()** (Lines 87-120)
   - Creates farm with ownerId
   - Automatically creates FarmUser entry
   - Sets role to FarmRole.OWNER
   - **Good Practice**: Transactional creation of Farm + FarmUser

4. **updateFarm()** (Lines 125-155)
   - Object.assign pattern for updates
   - Validates farm existence

5. **deleteFarm()** (Lines 160-188)
   - Hard delete using repository.remove()
   - Validates farm existence

6. **Helper Methods**:
   - `checkFarmAccess()` (Lines 193-203)
   - `getUserFarmRole()` (Lines 208-218)

**Issues**: None - well-structured service layer

---

### 1.4 Data Models

**File**: `/Users/mahmudaj/Desktop/Projects/Personal/farm-management/server/src/entities/Farm.ts`

**Status**: ✓ Complete

#### Farm Entity Fields:
```typescript
- id: string (BaseEntity)
- name: string (required)
- description?: string
- address?: string
- city?: string
- state?: string
- country?: string
- postalCode?: string
- phone?: string
- email?: string
- isActive: boolean (default: true)
- ownerId: string (required)
- createdAt: Date
- updatedAt: Date
```

#### Relations:
```typescript
- owner: User (ManyToOne)
- farmUsers: FarmUser[] (OneToMany)
- animals: Animal[] (OneToMany)
- assets: Asset[] (OneToMany)
- birdBatches: BirdBatch[] (OneToMany)
- financialTransactions: FinancialTransaction[] (OneToMany)
- inventoryItems: InventoryItem[] (OneToMany)
- locations: Location[] (OneToMany)
- ponds: Pond[] (OneToMany)
- tasks: Task[] (OneToMany)
- budgets: Budget[] (OneToMany)
- iotSensors: IoTSensor[] (OneToMany)
- predictions: Prediction[] (OneToMany)
```

**Status**: ✓ Complete multi-tenant schema with proper relationships

---

**File**: `/Users/mahmudaj/Desktop/Projects/Personal/farm-management/server/src/entities/FarmUser.ts`

**Status**: ✓ Complete

#### FarmUser Entity Fields:
```typescript
- id: string (BaseEntity)
- farmId: string (required)
- userId: string (required)
- role: FarmRole (enum: OWNER, MANAGER, WORKER)
- isActive: boolean (default: true)
- joinedAt?: Date
- invitedBy?: string
- notes?: string
- createdAt: Date
- updatedAt: Date
```

#### Relations:
```typescript
- farm: Farm (ManyToOne, CASCADE delete)
- user: User (ManyToOne, CASCADE delete)
```

**Indexes**: Unique composite index on [farmId, userId]

**Status**: ✓ Complete with proper cascade deletions

---

### 1.5 Farm Authorization Middleware

**File**: `/Users/mahmudaj/Desktop/Projects/Personal/farm-management/server/src/middleware/farm-auth.middleware.ts`

**Status**: ✓ Complete and Well-Designed

#### Available Middleware:

1. **requireFarmAccess** (Lines 30-75)
   - Extracts farmId from: X-Farm-Id header > params.farmId > body.farmId > query.farmId
   - Validates user has active FarmUser entry
   - Attaches farm context to req.farmUser, req.farm, req.farmRole
   - **Good Practice**: Multiple farm ID sources for flexibility

2. **requireFarmRole(requiredRoles)** (Lines 81-95)
   - Checks if user has specific farm role(s)
   - Supports single role or array of roles
   - Returns 403 if insufficient permissions

3. **requireFarmOwner** (Lines 101-111)
   - Shorthand for requiring OWNER role
   - Used for critical operations like delete

4. **requireFarmManagerOrOwner** (Lines 117-127)
   - Allows OWNER or MANAGER roles
   - Used for management operations

5. **optionalFarmAccess** (Lines 133-175)
   - Non-blocking farm context attachment
   - Useful for endpoints that work with/without farm context

6. **requireActiveFarm** (Lines 180-190)
   - Ensures farm.isActive = true
   - Prevents operations on deactivated farms

7. **requireFarmAccessWithRole(roles)** (Lines 196-198)
   - Combined middleware array
   - Convenience wrapper for common pattern

8. **requireFarmUserManagement** (Lines 204-214)
   - Specifically for user management operations
   - Requires OWNER or MANAGER

9. **requireFarmSettingsAccess** (Lines 220-234)
   - Farm settings modification
   - Requires OWNER only

**Issues**: None - comprehensive authorization middleware

---

### 1.6 Invitation System

**File**: `/Users/mahmudaj/Desktop/Projects/Personal/farm-management/server/src/routes/invitation.routes.ts`

**Status**: ✓ Complete (Separate Module)

#### Available Endpoints:
```typescript
✓ GET    /api/invitations/invitation/:token              - Get invitation details
✓ POST   /api/invitations/invitation/:token/accept       - Accept invitation
✓ POST   /api/invitations/invitation/:token/decline      - Decline invitation
✓ GET    /api/invitations/user/invitations               - Get user's pending invitations
✓ POST   /api/invitations/farm/invitations               - Create farm invitation (OWNER/MANAGER)
✓ GET    /api/invitations/farm/invitations               - Get farm invitations (OWNER/MANAGER)
✓ DELETE /api/invitations/farm/invitations/:invitationId - Cancel invitation (OWNER/MANAGER)
```

**Note**: Invitation routes are under `/api/invitations`, NOT `/api/farms/:farmId/...`

---

## 2. Client Implementation Analysis

### 2.1 Farm Service

**File**: `/Users/mahmudaj/Desktop/Projects/Personal/farm-management/client/src/services/farm.service.ts`

**Status**: ⚠️ API Endpoint Mismatch

#### Implemented Methods:

✓ **Basic CRUD Operations** (Matching Server):
```typescript
getUserFarms()              -> GET  /api/farms/user         ✓ MATCH
getFarm(id)                 -> GET  /api/farms/:id          ✓ MATCH
createFarm(data)            -> POST /api/farms              ✓ MATCH
updateFarm(id, data)        -> PUT  /api/farms/:id          ✓ MATCH
deleteFarm(id)              -> DELETE /api/farms/:id        ✓ MATCH
```

⚠️ **Farm User Management** (No Server Implementation):
```typescript
getFarmUsers(farmId)        -> GET    /api/farms/:farmId/users           ✗ NOT IMPLEMENTED
updateFarmUserRole(...)     -> PUT    /api/farms/:farmId/users/:userId   ✗ NOT IMPLEMENTED
removeUserFromFarm(...)     -> DELETE /api/farms/:farmId/users/:userId   ✗ NOT IMPLEMENTED
```

⚠️ **Farm Invitation Management** (Endpoint Mismatch):
```typescript
inviteUserToFarm(farmId, data) -> POST /api/farms/:farmId/invite        ✗ WRONG ENDPOINT
acceptInvitation(token)        -> POST /api/farms/accept-invitation     ✗ WRONG ENDPOINT
getPendingInvitations()        -> GET  /api/farms/invitations/pending   ✗ WRONG ENDPOINT
```

**Correct Endpoints** (based on server implementation):
```typescript
Should be: POST /api/invitations/farm/invitations       (with X-Farm-Id header)
Should be: POST /api/invitations/invitation/:token/accept
Should be: GET  /api/invitations/user/invitations
```

---

### 2.2 Farm Hooks

**File**: `/Users/mahmudaj/Desktop/Projects/Personal/farm-management/client/src/hooks/useFarm.ts`

**Status**: ✓ Complete (React Query Integration)

#### Implemented Hooks:

**Query Hooks**:
```typescript
✓ useUserFarms()            - Fetches user's farms
✓ useFarm(id)               - Fetches specific farm
✓ useFarmUsers(farmId)      - Fetches farm users (endpoint missing)
✓ usePendingInvitations()   - Fetches pending invitations (endpoint mismatch)
```

**Mutation Hooks**:
```typescript
✓ useCreateFarm()                - Creates farm
✓ useUpdateFarm()                - Updates farm
✓ useDeleteFarm()                - Deletes farm
✓ useInviteUserToFarm()          - Invites user (endpoint mismatch)
✓ useUpdateFarmUserRole()        - Updates role (endpoint missing)
✓ useRemoveUserFromFarm()        - Removes user (endpoint missing)
✓ useAcceptInvitation()          - Accepts invitation (endpoint mismatch)
```

**Cache Invalidation**: ✓ Properly configured with queryClient.invalidateQueries

---

### 2.3 Farm Context

**File**: `/Users/mahmudaj/Desktop/Projects/Personal/farm-management/client/src/contexts/FarmContext.tsx`

**Status**: ✓ Complete and Well-Designed

#### Context Implementation:

**State Management**:
```typescript
✓ selectedFarmId: string | null       - Currently selected farm
✓ isLoading: boolean                  - Loading state
✓ isValidFarmId: boolean              - Validates against user's farms
✓ setSelectedFarmId(farmId)           - Farm selection handler
✓ clearFarm()                         - Clear selected farm
```

**Persistence**:
- Uses localStorage with key `selectedFarmId`
- Automatically validates stored farmId against user's farms
- Clears invalid farmIds (e.g., after user loses access)

**Helper Hooks**:
```typescript
✓ useCurrentFarmId()      - Returns current farm ID
✓ useHasSelectedFarm()    - Boolean check for valid selection
```

**Auto-Validation** (Lines 46-52):
- Automatically clears invalid farmId when farms are loaded
- Prevents stale farm references

**Issues**: None - excellent implementation

---

### 2.4 Farm Components

#### FarmSelection Component

**File**: `/Users/mahmudaj/Desktop/Projects/Personal/farm-management/client/src/components/farm/FarmSelection.tsx`

**Status**: ✓ Complete

**Features**:
- Grid display of user's farms with role badges
- Empty state with "Create First Farm" CTA
- Farm selection with visual feedback
- Role-based badge colors (Owner/Manager/Worker)
- Member since display
- Create new farm button
- Integration with CreateFarmDialog

**Line 169**: Shows farm name or fallback to farmId
```typescript
Farm {farmUser.farm?.name || farmUser.farmId}
```

**Issues**: None - properly implemented

---

#### CreateFarmDialog Component

**File**: `/Users/mahmudaj/Desktop/Projects/Personal/farm-management/client/src/components/farm/CreateFarmDialog.tsx`

**Status**: ✓ Complete

**Features**:
- Full farm creation form with all fields
- Client-side validation
- Required field: name (min 3 characters)
- Optional fields: description, address, city, state, country, postalCode, phone, email
- Email and phone validation
- Loading states with spinner
- Error handling with alerts
- Auto-select newly created farm

**Issues**: None - comprehensive form implementation

---

### 2.5 API Client

**File**: `/Users/mahmudaj/Desktop/Projects/Personal/farm-management/client/src/services/api.ts`

**Status**: ✓ Complete with Farm Context Support

**Farm Context Injection** (Lines 148-152):
```typescript
const selectedFarmId = localStorage.getItem('selectedFarmId');
if (selectedFarmId) {
  headers['X-Farm-Id'] = selectedFarmId;
}
```

**Features**:
- Automatically adds X-Farm-Id header to all requests
- Token management with refresh
- Automatic retry on 401 with token refresh
- Proper error handling
- ApiResponse<T> type safety

**Issues**: None - proper farm context propagation

---

### 2.6 Query Keys

**File**: `/Users/mahmudaj/Desktop/Projects/Personal/farm-management/client/src/lib/queryKeys.ts`

**Status**: ✓ Complete

**Farm Query Keys**:
```typescript
farms.all                       - ['farms']
farms.userFarms()               - ['farms', 'user-farms']
farms.detail(id)                - ['farms', 'detail', id]
farms.users(farmId)             - ['farms', 'users', farmId]
farms.invitations(farmId)       - ['farms', 'invitations', farmId]
farms.pendingInvitations()      - ['farms', 'pending-invitations']
```

**Issues**: None - well-structured query key factory

---

## 3. Critical Issues Found

### 3.1 Missing Server Endpoints (High Priority)

**Issue**: Client expects farm user management endpoints that don't exist on server

**Affected Client Methods**:
```typescript
FarmService.getFarmUsers(farmId)              // GET /api/farms/:farmId/users
FarmService.updateFarmUserRole(...)           // PUT /api/farms/:farmId/users/:userId
FarmService.removeUserFromFarm(...)           // DELETE /api/farms/:farmId/users/:userId
```

**Impact**:
- Farm user management features will fail with 404
- Cannot view/manage farm team members
- Cannot update user roles or remove users

**Solution Required**:
Add these endpoints to `/Users/mahmudaj/Desktop/Projects/Personal/farm-management/server/src/routes/farm.routes.ts`:
```typescript
router.get('/:farmId/users', requireFarmAccess, farmController.getFarmUsers);
router.put('/:farmId/users/:userId', requireFarmAccessWithRole([FarmRole.OWNER, FarmRole.MANAGER]), farmController.updateFarmUserRole);
router.delete('/:farmId/users/:userId', requireFarmAccessWithRole([FarmRole.OWNER, FarmRole.MANAGER]), farmController.removeFarmUser);
```

---

### 3.2 API Endpoint Mismatch (Medium Priority)

**Issue**: Client farm invitation endpoints don't match server implementation

**Client Expects**:
```typescript
POST /api/farms/:farmId/invite              // Create invitation
POST /api/farms/accept-invitation           // Accept invitation
GET  /api/farms/invitations/pending         // Get pending invitations
```

**Server Implements**:
```typescript
POST /api/invitations/farm/invitations       // Create invitation (with X-Farm-Id header)
POST /api/invitations/invitation/:token/accept  // Accept invitation
GET  /api/invitations/user/invitations       // Get pending invitations
```

**Impact**:
- Farm invitations will fail with 404
- Users cannot invite others to farms
- Users cannot accept farm invitations
- Cannot view pending invitations

**Solution Required**:
Update client FarmService to use correct endpoints:
```typescript
// In farm.service.ts
inviteUserToFarm(farmId: string, data: InviteUserToFarmRequest) {
  // Set X-Farm-Id header instead of using URL param
  return apiClient.post('/api/invitations/farm/invitations', data);
}

acceptInvitation(token: string) {
  return apiClient.post(`/api/invitations/invitation/${token}/accept`);
}

getPendingInvitations() {
  return apiClient.get('/api/invitations/user/invitations');
}
```

---

## 4. No Issues Found (Good Practices)

### 4.1 No Hardcoded Farm IDs ✓

**Searched For**: Hardcoded farm IDs, default farms, farm_id = "1"

**Result**: No hardcoded farm IDs found in production code

**Evidence**:
- All farm IDs come from user selection via FarmContext
- FarmContext validates farmId against user's actual farms
- API client uses selectedFarmId from localStorage
- Components receive farmId as props from context

---

### 4.2 No Mock Farm Data ✓

**Searched For**: Mock farms, hardcoded farm names, TODO farm references

**Result**: No mock farm data in production code

**Evidence**:
- FarmSelection component uses real API data via useUserFarms()
- Dashboard uses real farm context from useFarmContext()
- All farm data comes from database via API

**Note**: Test files contain mock data but that's expected and appropriate

---

### 4.3 Proper Farm Context Switching ✓

**Implementation**:
- FarmProvider wraps entire app (App.tsx)
- selectedFarmId persisted to localStorage
- Automatic validation of stored farmId
- X-Farm-Id header added to all API requests
- Farm-specific components check for valid farm selection

**Flow**:
1. User logs in
2. FarmSelection page loads user's farms
3. User selects a farm
4. farmId stored in localStorage
5. X-Farm-Id header added to all subsequent requests
6. Server middleware validates farm access
7. User can switch farms by returning to FarmSelection

---

### 4.4 Proper Type Safety ✓

**Shared Types**: `/Users/mahmudaj/Desktop/Projects/Personal/farm-management/shared/src/types/farm.types.ts`

**Types Defined**:
```typescript
✓ FarmRole enum (OWNER, MANAGER, WORKER)
✓ Farm interface
✓ FarmUser interface
✓ CreateFarmRequest interface
✓ UpdateFarmRequest interface
✓ InviteUserToFarmRequest interface
✓ FarmInvitation interface
```

**Usage**: Both client and server use shared types - prevents type drift

---

## 5. Security Analysis

### 5.1 Authentication ✓ Proper

- All farm routes require authentication
- authenticate middleware runs on all routes
- User context attached to req.user

---

### 5.2 Authorization ✓ Proper

**Farm Access Control**:
- requireFarmAccess middleware validates user has FarmUser entry
- Checks isActive = true on both Farm and FarmUser
- Returns 403 for unauthorized access

**Role-Based Access**:
- DELETE farm requires OWNER role
- User management requires OWNER or MANAGER
- Farm settings require OWNER only
- Read operations require any farm access

---

### 5.3 Multi-Tenant Isolation ✓ Proper

**Database Level**:
- All farm-related entities have farmId foreign key
- Cascade deletion on FarmUser (prevents orphaned access)
- Unique constraint on [farmId, userId]

**API Level**:
- X-Farm-Id header propagated from client
- requireFarmAccess validates user access to specified farm
- Cannot access data from unauthorized farms

---

## 6. Performance Considerations

### 6.1 Database Queries ✓ Efficient

**getUserFarms** (FarmService.ts:25):
```typescript
await this.farmUserRepository.find({
  where: { userId, isActive: true },
  relations: ['farm']  // Eager loading farm data
});
```
- Single query with join
- Filters by isActive to reduce data

**getFarmById** (FarmService.ts:52):
```typescript
await this.farmRepository.findOne({
  where: { id: farmId },
  relations: ['farmUsers', 'farmUsers.user']  // Nested relations
});
```
- Loads farm with all users in single query
- May need pagination for farms with many users

---

### 6.2 Client-Side Caching ✓ Implemented

**React Query**:
- All farm queries cached with queryKeys
- Automatic cache invalidation on mutations
- Stale-while-revalidate pattern
- Prevents unnecessary API calls

**Example** (useFarm.ts:38-40):
```typescript
onSuccess: () => {
  queryClient.invalidateQueries({ queryKey: queryKeys.farms.userFarms() });
}
```

---

## 7. Testing Considerations

### 7.1 Unit Tests Needed

**Server**:
- [ ] FarmController unit tests
- [ ] FarmService unit tests
- [ ] Farm authorization middleware tests

**Client**:
- [ ] FarmService API calls
- [ ] Farm hooks (useFarm, useUserFarms, etc.)
- [ ] FarmContext state management
- [ ] FarmSelection component
- [ ] CreateFarmDialog form validation

---

### 7.2 Integration Tests Needed

- [ ] Farm creation flow (API + DB)
- [ ] Farm user management flow
- [ ] Farm invitation flow
- [ ] Multi-tenant isolation verification
- [ ] Role-based access control scenarios

---

## 8. Recommendations

### 8.1 High Priority (Blocking Issues)

1. **Add Missing Farm User Management Endpoints** (Server)
   - GET /api/farms/:farmId/users
   - PUT /api/farms/:farmId/users/:userId
   - DELETE /api/farms/:farmId/users/:userId
   - Implement in FarmController and FarmService

2. **Fix Farm Invitation Endpoint Mismatch** (Client)
   - Update FarmService to use /api/invitations/* endpoints
   - Update useFarm hooks accordingly
   - Test invitation flow end-to-end

---

### 8.2 Medium Priority (Enhancements)

3. **Add Farm Switching UI Component**
   - Dropdown in header/sidebar to switch farms
   - Currently requires navigation to FarmSelection page
   - Better UX for users with multiple farms

4. **Add Farm User List Page**
   - Display all farm users with roles
   - Allow role updates (OWNER/MANAGER only)
   - Allow user removal (OWNER/MANAGER only)
   - Show invitation status

5. **Add Farm Settings Page**
   - Edit farm details (name, address, etc.)
   - Deactivate/reactivate farm (OWNER only)
   - View farm statistics

---

### 8.3 Low Priority (Nice to Have)

6. **Add Farm Search/Filter**
   - For users with many farms
   - Search by name, location
   - Filter by role

7. **Add Farm Audit Log**
   - Track farm setting changes
   - Track user additions/removals
   - Track role changes

8. **Add Farm Transfer Ownership**
   - Allow OWNER to transfer ownership
   - Requires confirmation workflow

---

## 9. File Reference Index

### Server Files
```
/server/src/routes/farm.routes.ts              - Farm API routes
/server/src/controllers/FarmController.ts      - Farm request handlers
/server/src/services/FarmService.ts            - Farm business logic
/server/src/entities/Farm.ts                   - Farm entity model
/server/src/entities/FarmUser.ts               - FarmUser entity model
/server/src/middleware/farm-auth.middleware.ts - Farm authorization
/server/src/routes/invitation.routes.ts        - Invitation API routes
```

### Client Files
```
/client/src/services/farm.service.ts           - Farm API client
/client/src/hooks/useFarm.ts                   - Farm React Query hooks
/client/src/contexts/FarmContext.tsx           - Farm state management
/client/src/components/farm/FarmSelection.tsx  - Farm selection UI
/client/src/components/farm/CreateFarmDialog.tsx - Farm creation UI
/client/src/services/api.ts                    - Base API client
/client/src/lib/queryKeys.ts                   - Query key definitions
```

### Shared Files
```
/shared/src/types/farm.types.ts                - Shared type definitions
```

---

## 10. Summary

### What's Working Well ✓

1. **Core CRUD Operations**: All basic farm operations implemented
2. **Multi-Tenant Architecture**: Proper isolation and authorization
3. **Farm Context Management**: Well-designed with validation and persistence
4. **Type Safety**: Shared types prevent client-server drift
5. **Security**: Proper authentication and role-based authorization
6. **No Hardcoded Data**: No mock or hardcoded farm IDs in production
7. **React Query Integration**: Proper caching and invalidation

### What Needs Work ⚠️

1. **Missing Farm User Management Endpoints**: Server needs 3 endpoints
2. **Invitation Endpoint Mismatch**: Client uses wrong endpoints
3. **Missing Farm Switching UI**: UX improvement needed
4. **Missing Farm Settings Page**: Cannot edit farm details after creation
5. **No Tests**: Unit and integration tests needed

### Priority Action Items

**Immediate** (Blocking):
1. Add farm user management endpoints on server
2. Fix invitation endpoint mismatch on client
3. Test end-to-end farm user and invitation flows

**Short-term** (1-2 weeks):
1. Add farm switching dropdown component
2. Add farm settings page
3. Add farm user management page
4. Write unit tests for critical paths

**Long-term** (Future):
1. Add farm audit logging
2. Add farm ownership transfer
3. Add farm analytics dashboard
4. Add farm templates/presets

---

**Analysis Completed**: 2025-10-18
**Analyzer**: Claude Code
**Total Files Analyzed**: 15
**Total Lines Reviewed**: ~2,500
