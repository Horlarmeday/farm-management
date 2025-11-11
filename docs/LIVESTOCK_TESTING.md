# Livestock Routes Testing Documentation

## Test Environment Setup

- **Server**: http://localhost:5058
- **Client**: http://localhost:5173
- **Database**: MySQL (kuyash_fms)
- **Authentication**: JWT Bearer tokens required

## Phase 1: Validation Error Testing

### Test Case 1.1: Invalid Field Values (Should return 400)

**Endpoint**: `POST /api/livestock`

**Test Payload**:
```json
{
  "tagNumber": "",
  "species": "invalid_species",
  "breed": "",
  "gender": "invalid_gender",
  "dateOfBirth": "invalid_date",
  "acquisitionDate": "invalid_date",
  "source": "",
  "location": "",
  "weight": -1,
  "acquisitionCost": -1,
  "notes": ""
}
```

**Expected Response**:
- Status Code: 400
- Error Type: Validation Error
- Field-level errors for each invalid field

### Test Case 1.2: Missing Required Fields (Should return 400)

**Test Payload**:
```json
{
  "tagNumber": "TEST001"
}
```

**Expected Response**:
- Status Code: 400
- Missing field errors for: species, breed, gender, dateOfBirth, acquisitionDate, source

## Phase 2: Field Naming Consistency Testing

### Test Case 2.1: Correct Field Names (Should work)

**Test Payload**:
```json
{
  "tagNumber": "TEST001",
  "species": "cow",
  "breed": "Holstein",
  "gender": "male",
  "dateOfBirth": "2020-01-01",
  "acquisitionDate": "2023-01-01",
  "source": "Test Farm",
  "location": "Pen A",
  "weight": 500,
  "acquisitionCost": 1000,
  "notes": "Test animal"
}
```

**Expected Response**:
- Status Code: 201 (if authenticated) or 401 (if not authenticated)
- Success message with created animal data

### Test Case 2.2: Enum Value Testing

**Valid Species**: cow, goat, sheep, pig, chicken
**Valid Gender**: male, female
**Valid Status**: active, sold, deceased, transferred

## Phase 3: Client-Side Form Testing

### Test Case 3.1: Form Validation Display

1. Open Livestock page
2. Click "Add Animal" button
3. Try submitting empty form
4. **Expected**: Field-level validation errors appear under each field
5. **Expected**: No generic toast for validation errors

### Test Case 3.2: Server Validation Error Display

1. Fill form with invalid data (e.g., empty required fields)
2. Submit form
3. **Expected**: Server validation errors appear as field-level errors
4. **Expected**: Form shows specific error messages under each field

### Test Case 3.3: Success Flow

1. Fill form with valid data
2. Submit form
3. **Expected**: Success toast appears
4. **Expected**: Form closes and resets
5. **Expected**: Animal appears in the list

## Phase 4: Route Testing Checklist

### Animal Management Routes

| Route | Method | Test Case | Expected Status | Notes |
|-------|--------|------------|------------------|-------|
| `/api/livestock` | POST | Valid data | 201 | Create animal |
| `/api/livestock` | POST | Invalid data | 400 | Validation errors |
| `/api/livestock` | GET | With auth | 200 | List animals |
| `/api/livestock/:id` | GET | Valid ID | 200 | Get single animal |
| `/api/livestock/:id` | PUT | Valid data | 200 | Update animal |
| `/api/livestock/:id` | DELETE | Valid ID | 200 | Delete animal |
| `/api/livestock/stats` | GET | With auth | 200 | Get statistics |
| `/api/livestock/dashboard` | GET | With auth | 200 | Get dashboard data |

### Health Management Routes

| Route | Method | Test Case | Expected Status | Notes |
|-------|--------|------------|------------------|-------|
| `/api/livestock/health` | POST | Valid data | 201 | Record health event |
| `/api/livestock/health` | GET | With auth | 200 | Get health records |
| `/api/livestock/:id/health` | GET | Valid ID | 200 | Get animal health |

### Feeding Management Routes

| Route | Method | Test Case | Expected Status | Notes |
|-------|--------|------------|------------------|-------|
| `/api/livestock/feeding` | POST | Valid data | 201 | Record feeding |
| `/api/livestock/feeding` | GET | With auth | 200 | Get feeding logs |

### Breeding Management Routes

| Route | Method | Test Case | Expected Status | Notes |
|-------|--------|------------|------------------|-------|
| `/api/livestock/breeding` | POST | Valid data | 201 | Record breeding |
| `/api/livestock/breeding` | GET | With auth | 200 | Get breeding records |
| `/api/livestock/breeding/birth` | POST | Valid data | 201 | Record birth |

### Production Management Routes

| Route | Method | Test Case | Expected Status | Notes |
|-------|--------|------------|------------------|-------|
| `/api/livestock/production` | POST | Valid data | 201 | Record production |
| `/api/livestock/production` | GET | With auth | 200 | Get production logs |

### Sales Management Routes

| Route | Method | Test Case | Expected Status | Notes |
|-------|--------|------------|------------------|-------|
| `/api/livestock/sales` | POST | Valid data | 201 | Record sale |
| `/api/livestock/sales` | GET | With auth | 200 | Get sales |

## Phase 5: Client-Server Disparity Testing

### Test Case 5.1: Field Name Consistency

**Check**: All forms use `species` (not `animalType`)
**Check**: All forms use lowercase enum values
**Check**: Server validation matches client schema

### Test Case 5.2: Error Response Format

**Check**: Server returns 400 for validation errors (not 500)
**Check**: Client displays field-level errors
**Check**: Toast messages only for non-validation errors

### Test Case 5.3: Data Flow

**Check**: Client form data matches server expectations
**Check**: Server response matches client expectations
**Check**: No missing fields in either direction

## Test Results Log

### Completed Tests

- [ ] Validation error status codes (400 vs 500)
- [ ] Field naming consistency (species vs animalType)
- [ ] Enum value consistency (lowercase vs uppercase)
- [ ] Client form field-level error display
- [ ] Server route functionality
- [ ] Client-server data flow

### Issues Found

1. **Authentication Required**: All routes require valid JWT tokens
2. **Field Naming**: Need to verify all forms use `species` consistently
3. **Error Display**: Need to test field-level error parsing

### Fixes Applied

1. ✅ Updated Joi validation to use `species` with lowercase values
2. ✅ Updated client schema to use `species` with lowercase values
3. ✅ Updated CreateAnimalForm to use `species` field
4. ✅ Created errorUtils.ts for field-level error parsing
5. ✅ Updated CreateAnimalForm to use field-level error display

## Next Steps

1. Test client-side functionality in browser
2. Verify field-level error display works
3. Test all livestock routes with proper authentication
4. Document any remaining disparities
5. Apply fixes to other forms (Inventory, Assets, etc.)


