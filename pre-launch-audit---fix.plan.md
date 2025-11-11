<!-- 2eb37b92-e722-4296-b12e-e82031fa8ab1 c375f5a2-c495-4db7-bb4d-86ae4c406d4c -->
# Pre-Launch Comprehensive Audit & Remediation Plan

## Executive Summary

This plan addresses critical inconsistencies between client and server implementations discovered during the pre-launch audit. The focus is on **forms with simulated API calls** (highest user impact), followed by systematic fixes across all modules.

---

## CRITICAL ISSUES DISCOVERED

### 1. Forms with Simulated API Calls (BLOCKING LAUNCH)

- CreateExpenseForm.tsx - Simulated submission
- CreateSaleForm.tsx - Simulated submission  
- CreatePondForm.tsx - Simulated submission
- CreateEmployeeForm.tsx - Simulated submission
- CreateAssetForm.tsx - Simulated submission

### 2. Missing Forms in Tab Pages (BLOCKING USER WORKFLOWS)

- Livestock: Breeding, Production, Health tabs have no forms
- Poultry: Egg Production, Feeding, Health tabs have no forms
- Fishery: Water Quality, Feeding, Harvest tabs have no forms
- HR: Attendance, Leave Request tabs have no forms
- Inventory: Transaction tab has placeholder button

### 3. Missing Server Endpoints

- Poultry: DELETE endpoints for feeding, health, egg production logs
- Poultry: Dashboard summary endpoint
- Poultry: Production summary endpoint
- User: Employee creation uses generic user endpoint (needs mapping)

### 4. Endpoint Mismatches

- CreateBirdBatchForm calls /api/bird-batches but server expects /api/poultry/batches
- Client services have TODOs for unimplemented server endpoints
- Finance module has test route that should be removed

### 5. Mock Data in Components

- PredictiveAnalyticsDashboard.tsx - Entirely hardcoded mock data
- Dashboard components using fallback mock data
- Analytics components with placeholder data

### 6. Type Disparities

- Client form fields don't match server validation schemas
- Missing required fields in some forms
- Inconsistent field naming (camelCase vs snake_case)

---

## IMPLEMENTATION PLAN

### PHASE 1: Critical Forms - API Integration (Days 1-2)

**Priority: CRITICAL** - These block core user workflows

#### Task 1.1: Fix CreateExpenseForm

- Map form fields to Finance API /api/finance/transactions
- Update field names to match server expectations
- Add proper error handling
- Implement React Query mutation
- Test with real API

#### Task 1.2: Fix CreateSaleForm  

- Determine correct endpoint (Finance or module-specific)
- Map to appropriate API structure
- Handle product type routing (livestock/poultry/fishery)
- Implement proper validation

#### Task 1.3: Fix CreatePondForm

- Connect to /api/fishery/ponds endpoint
- Map form fields to CreatePondRequest type
- Add proper validation from server schema
- Test pond creation flow

#### Task 1.4: Fix CreateEmployeeForm

- Connect to /api/users/users endpoint
- Map employee fields to user creation payload
- Handle department and role assignment
- Add proper authentication

#### Task 1.5: Fix CreateAssetForm

- Determine if assets belong to Finance or separate module
- Create/connect to appropriate endpoint
- Implement asset categorization
- Add validation

### PHASE 1B: Missing Forms for Tab Pages (Days 2-3)

**Priority: CRITICAL** - These are placeholders blocking user workflows

#### Livestock Module Missing Forms

- CreateBreedingRecordForm - Connect to POST /api/livestock/breeding
  - Fields: sire, dam, breeding date, expected delivery, method
- CreateProductionRecordForm - Connect to POST /api/livestock/production
  - Fields: animal ID, production type (milk/wool/etc), quantity, date
- CreateLivestockHealthRecordForm - Connect to POST /api/livestock/health
  - Fields: animal ID, event type, treatment, vet name, notes, date

#### Poultry Module Missing Forms

- CreateEggProductionForm - Connect to POST /api/poultry/egg-production
  - Fields: batch ID, date, total eggs, damaged eggs, quality grade
- CreatePoultryFeedingForm - Connect to POST /api/poultry/feeding
  - Fields: batch ID, feed type, quantity, cost, date
- CreatePoultryHealthRecordForm - Connect to POST /api/poultry/health
  - Fields: batch ID, event type, treatment, mortality count, notes

#### Fishery Module Missing Forms

- CreateWaterQualityForm - Connect to POST /api/fishery/water-quality
  - Fields: pond ID, pH, temperature, dissolved oxygen, ammonia, date
- CreateFishFeedingForm - Connect to POST /api/fishery/feeding
  - Fields: pond ID, feed type, quantity, cost, date
- CreateHarvestRecordForm - Connect to POST /api/fishery/harvests
  - Fields: pond ID, quantity, average weight, total weight, buyer, price

#### HR Module Missing Forms

- CreateAttendanceForm - Connect to POST /api/users/attendance
  - Fields: user ID, date, status (present/absent/late), check-in/out time
- CreateLeaveRequestForm - Connect to POST /api/users/leave
  - Fields: user ID, leave type, start date, end date, reason
- ApproveLeaveForm - Connect to PUT /api/users/leave/:id/approve
  - Fields: approval status, approver notes

#### Inventory Module Missing Forms

- CreateInventoryTransactionForm - Connect to POST /api/inventory/transactions
  - Fields: item ID, transaction type, quantity, unit cost, notes
- CreateStockAdjustmentForm - For manual stock adjustments
  - Fields: item ID, adjustment type, quantity, reason

### PHASE 2: Endpoint Corrections (Day 3)

**Priority: HIGH** - Prevents runtime errors

#### Task 2.1: Fix Bird Batch Endpoint Mismatch

- Update CreateBirdBatchForm to use /api/poultry/batches
- Update query keys in React Query
- Test batch creation and listing

#### Task 2.2: Add Missing Poultry DELETE Endpoints

- Implement DELETE /api/poultry/feeding/:id
- Implement DELETE /api/poultry/health/:id
- Implement DELETE /api/poultry/egg-production/:id
- Add proper authorization checks

#### Task 2.3: Implement Poultry Dashboard Endpoints

- Implement GET /api/poultry/dashboard-summary
- Implement GET /api/poultry/production-summary
- Add caching for performance
- Connect client hooks

#### Task 2.4: Clean Up Finance Test Routes

- Remove test route from production code
- Add to development-only middleware if needed
- Update route documentation

### PHASE 3: Type & Validation Alignment (Day 4)

**Priority: HIGH** - Prevents validation errors

#### Task 3.1: Audit All Form Schemas

- Compare client form fields with server validation schemas
- Document all mismatches
- Create alignment matrix

#### Task 3.2: Update Client Types

- Sync shared types between client and server
- Fix camelCase/snake_case inconsistencies
- Add missing required fields

#### Task 3.3: Update Server Validations

- Ensure all validations match business requirements
- Add missing field validations
- Document validation rules

#### Task 3.4: Update Form Components

- Apply corrected types to all forms
- Add client-side validation matching server
- Implement proper error display

### PHASE 4: Mock Data Removal (Day 5)

**Priority: MEDIUM** - Improves data accuracy

#### Task 4.1: Replace Dashboard Mock Data

- Connect all dashboard widgets to real APIs
- Remove fallback mock data
- Add proper loading states
- Handle empty states gracefully

#### Task 4.2: Fix Predictive Analytics

- Either connect to real ML/analytics service
- Or remove feature if not ready for launch
- Add "Coming Soon" placeholder if removed

#### Task 4.3: Update Analytics Components

- Connect to real reporting endpoints
- Remove hardcoded chart data
- Implement proper date range filtering

### PHASE 5: Field Mapping & Consistency (Day 6)

**Priority: MEDIUM** - Ensures data integrity

#### Task 5.1: Livestock Module Audit

- Compare CreateAnimalForm with server expectations
- Fix field mismatches
- Test full CRUD operations

#### Task 5.2: Fishery Module Audit

- Audit all fishery forms
- Fix water quality, stocking, harvest forms
- Test complete workflows

#### Task 5.3: Inventory Module Audit

- Verify inventory item creation
- Check transaction recording
- Test stock adjustments

#### Task 5.4: IoT Module Audit

- Verify sensor registration
- Check reading submission
- Test alert generation

### PHASE 6: Integration Testing (Day 7)

**Priority: CRITICAL** - Validates all fixes

#### Task 6.1: End-to-End Form Testing

- Test each form with real API
- Verify data persistence
- Check error handling

#### Task 6.2: Module Workflow Testing

- Test complete workflows (e.g., create batch → record feeding → harvest)
- Verify data flows between modules
- Check dashboard updates

#### Task 6.3: Performance Testing

- Test with realistic data volumes
- Check API response times
- Verify caching works

#### Task 6.4: User Acceptance Testing

- Run through common user scenarios
- Document any remaining issues
- Create hotfix list if needed

### To-dos

#### Phase 1: Critical Forms - API Integration
- [ ] Connect CreateExpenseForm to Finance API - map fields, add validation, implement React Query mutation
- [ ] Connect CreateSaleForm to appropriate API - determine endpoint, map fields, handle product routing
- [ ] Connect CreatePondForm to Fishery API - map to CreatePondRequest, add validation
- [ ] Connect CreateEmployeeForm to User API - map employee fields, handle roles/departments
- [ ] Connect CreateAssetForm to appropriate API - determine module, implement categorization

#### Phase 1B: Missing Forms for Tab Pages
- [ ] Create CreateBreedingRecordForm for Livestock breeding tab - POST /api/livestock/breeding
- [ ] Create CreateProductionRecordForm for Livestock production tab - POST /api/livestock/production
- [ ] Create CreateLivestockHealthRecordForm for Livestock health tab - POST /api/livestock/health
- [ ] Create CreateEggProductionForm for Poultry production tab - POST /api/poultry/egg-production
- [ ] Create CreatePoultryFeedingForm for Poultry feeding tab - POST /api/poultry/feeding
- [ ] Create CreatePoultryHealthRecordForm for Poultry health tab - POST /api/poultry/health
- [ ] Create CreateWaterQualityForm for Fishery water quality tab - POST /api/fishery/water-quality
- [ ] Create CreateFishFeedingForm for Fishery feeding tab - POST /api/fishery/feeding
- [ ] Create CreateHarvestRecordForm for Fishery harvest tab - POST /api/fishery/harvests
- [ ] Create CreateAttendanceForm for HR attendance tab - POST /api/users/attendance
- [ ] Create CreateLeaveRequestForm for HR leave tab - POST /api/users/leave
- [ ] Create ApproveLeaveForm for HR leave approval - PUT /api/users/leave/:id/approve
- [ ] Create CreateInventoryTransactionForm for Inventory transactions tab - POST /api/inventory/transactions
- [ ] Create CreateStockAdjustmentForm for manual inventory adjustments

#### Phase 2: Endpoint Corrections
- [ ] Fix CreateBirdBatchForm endpoint from /api/bird-batches to /api/poultry/batches
- [ ] Implement missing DELETE endpoints for poultry feeding, health, and egg production logs
- [ ] Implement poultry dashboard-summary and production-summary endpoints
- [ ] Remove finance test route from production code

#### Phase 3: Type & Validation Alignment
- [ ] Audit all form schemas and create alignment matrix with server validations
- [ ] Update client types - sync shared types, fix naming inconsistencies
- [ ] Update server validations to match business requirements
- [ ] Apply corrected types to all forms with proper validation

#### Phase 4: Mock Data Removal
- [ ] Replace dashboard mock data with real API connections
- [ ] Fix or remove PredictiveAnalyticsDashboard mock data
- [ ] Update analytics components to use real reporting endpoints

#### Phase 5: Field Mapping & Consistency
- [ ] Audit livestock module forms and fix field mismatches
- [ ] Audit fishery module forms beyond CreatePondForm
- [ ] Verify inventory module field mappings
- [ ] Verify IoT module integration and field mappings

#### Phase 6: Integration Testing
- [ ] End-to-end testing of all forms with real API
- [ ] Test complete module workflows and data flows
- [ ] Performance testing with realistic data volumes
- [ ] User acceptance testing of common scenarios


