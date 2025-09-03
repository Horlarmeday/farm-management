# 🌾 Kuyash Farm Management System - API Documentation

## Overview

The Kuyash Farm Management System provides a comprehensive RESTful API for
managing integrated farm operations including poultry, livestock, fishery,
inventory, finance, and more.

**Base URL:** `http://localhost:5000/api`  
**API Version:** v1  
**Authentication:** JWT Bearer Token

## Table of Contents

- [Authentication](#authentication)
- [Common Response Format](#common-response-format)
- [Error Handling](#error-handling)
- [Pagination](#pagination)
- [Filtering & Sorting](#filtering--sorting)
- [API Endpoints](#api-endpoints)
  - [Authentication](#auth-endpoints)
  - [Inventory Management](#inventory-endpoints)
  - [Finance Management](#finance-endpoints)
  - [Poultry Management](#poultry-endpoints)
  - [Livestock Management](#livestock-endpoints)
  - [Fishery Management](#fishery-endpoints)
  - [Asset Management](#asset-endpoints)
  - [User Management](#user-endpoints)
  - [Notification System](#notification-endpoints)
  - [Reporting & Analytics](#reporting-endpoints)

## Authentication

All API endpoints require authentication except for login and registration.

### Login

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response:**

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "id": "uuid",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": {
        "name": "admin",
        "permissions": ["create_users", "manage_inventory"]
      }
    },
    "accessToken": "jwt_token_here",
    "refreshToken": "refresh_token_here"
  }
}
```

### Using Authentication

Include the JWT token in the Authorization header:

```http
Authorization: Bearer <your_jwt_token>
```

## Common Response Format

All API responses follow a consistent format:

**Success Response:**

```json
{
  "success": true,
  "message": "Operation completed successfully",
  "data": {
    // Response data here
  }
}
```

**Error Response:**

```json
{
  "success": false,
  "message": "Error description",
  "errors": [
    {
      "field": "email",
      "msg": "Valid email is required"
    }
  ]
}
```

## Error Handling

| Status Code | Description                             |
| ----------- | --------------------------------------- |
| 200         | Success                                 |
| 201         | Created                                 |
| 400         | Bad Request - Validation errors         |
| 401         | Unauthorized - Invalid or missing token |
| 403         | Forbidden - Insufficient permissions    |
| 404         | Not Found                               |
| 409         | Conflict - Duplicate resource           |
| 429         | Too Many Requests - Rate limited        |
| 500         | Internal Server Error                   |

## Pagination

List endpoints support pagination with query parameters:

```http
GET /api/inventory?page=1&limit=20
```

**Response includes pagination metadata:**

```json
{
  "success": true,
  "data": {
    "items": [...],
    "pagination": {
      "currentPage": 1,
      "totalPages": 5,
      "totalItems": 100,
      "hasNext": true,
      "hasPrevious": false
    }
  }
}
```

## Filtering & Sorting

Most list endpoints support filtering and sorting:

```http
GET /api/inventory?type=feed&lowStock=true&sortBy=name&sortOrder=asc&search=chicken
```

Common query parameters:

- `search` - Text search
- `sortBy` - Field to sort by
- `sortOrder` - `asc` or `desc`
- `startDate` - Filter from date
- `endDate` - Filter to date

---

# API Endpoints

## Auth Endpoints

### Register User

```http
POST /api/auth/register
```

**Body:**

```json
{
  "email": "user@example.com",
  "password": "password123",
  "firstName": "John",
  "lastName": "Doe",
  "phone": "+1234567890"
}
```

### Refresh Token

```http
POST /api/auth/refresh
```

**Body:**

```json
{
  "refreshToken": "refresh_token_here"
}
```

### Change Password

```http
POST /api/auth/change-password
Authorization: Bearer <token>
```

**Body:**

```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password",
  "confirmPassword": "new_password"
}
```

### Forgot Password

```http
POST /api/auth/forgot-password
```

**Body:**

```json
{
  "email": "user@example.com"
}
```

### Get Profile

```http
GET /api/auth/profile
Authorization: Bearer <token>
```

### Logout

```http
POST /api/auth/logout
Authorization: Bearer <token>
```

---

## Inventory Endpoints

### Create Inventory Item

```http
POST /api/inventory
Authorization: Bearer <token>
```

**Body:**

```json
{
  "name": "Layer Feed Premium",
  "description": "High quality layer feed",
  "type": "feed",
  "unit": "kg",
  "currentStock": 1000,
  "minimumStock": 100,
  "maximumStock": 2000,
  "unitCost": 0.75,
  "supplier": "Feed Co.",
  "category": "feed",
  "brand": "FeedMaster",
  "expiryDate": "2024-12-31",
  "storageLocation": "Warehouse A"
}
```

### Get All Inventory Items

```http
GET /api/inventory?page=1&limit=20&type=feed&lowStock=true
Authorization: Bearer <token>
```

### Get Inventory Item by ID

```http
GET /api/inventory/{id}
Authorization: Bearer <token>
```

### Update Inventory Item

```http
PUT /api/inventory/{id}
Authorization: Bearer <token>
```

### Delete Inventory Item

```http
DELETE /api/inventory/{id}
Authorization: Bearer <token>
```

### Adjust Stock

```http
POST /api/inventory/{id}/adjust
Authorization: Bearer <token>
```

**Body:**

```json
{
  "quantity": 50,
  "type": "increase",
  "reason": "New stock received",
  "cost": 37.5
}
```

### Get Transaction History

```http
GET /api/inventory/{id}/transactions
Authorization: Bearer <token>
```

### Get Low Stock Items

```http
GET /api/inventory/low-stock?threshold=100
Authorization: Bearer <token>
```

### Get Expiring Items

```http
GET /api/inventory/expiring?days=30
Authorization: Bearer <token>
```

### Bulk Import

```http
POST /api/inventory/bulk-import
Authorization: Bearer <token>
Content-Type: multipart/form-data

form-data: file=inventory.csv
```

### Export Data

```http
GET /api/inventory/export?format=csv&type=feed
Authorization: Bearer <token>
```

---

## Finance Endpoints

### Create Transaction

```http
POST /api/finance/transactions
Authorization: Bearer <token>
```

**Body:**

```json
{
  "type": "income",
  "category": "egg_sales",
  "description": "Egg sales for January",
  "amount": 1500.0,
  "date": "2024-01-20",
  "paymentMethod": "cash",
  "referenceNumber": "TXN001",
  "notes": "Cash payment received"
}
```

### Get All Transactions

```http
GET /api/finance/transactions?page=1&limit=20&type=income&category=sales
Authorization: Bearer <token>
```

### Get Transaction by ID

```http
GET /api/finance/transactions/{id}
Authorization: Bearer <token>
```

### Update Transaction

```http
PUT /api/finance/transactions/{id}
Authorization: Bearer <token>
```

### Delete Transaction

```http
DELETE /api/finance/transactions/{id}
Authorization: Bearer <token>
```

### Create Invoice

```http
POST /api/finance/invoices
Authorization: Bearer <token>
```

**Body:**

```json
{
  "invoiceNumber": "INV001",
  "customerName": "ABC Restaurant",
  "customerEmail": "abc@restaurant.com",
  "customerPhone": "+1234567890",
  "issueDate": "2024-01-20",
  "dueDate": "2024-02-20",
  "items": [
    {
      "description": "Grade A Eggs",
      "quantity": 100,
      "unitPrice": 2.5,
      "total": 250.0
    }
  ],
  "subtotal": 250.0,
  "taxRate": 10,
  "taxAmount": 25.0,
  "totalAmount": 275.0
}
```

### Get All Invoices

```http
GET /api/finance/invoices?status=pending&search=Restaurant
Authorization: Bearer <token>
```

### Update Invoice Status

```http
PUT /api/finance/invoices/{id}/status
Authorization: Bearer <token>
```

**Body:**

```json
{
  "status": "paid"
}
```

### Record Payment

```http
POST /api/finance/payments
Authorization: Bearer <token>
```

**Body:**

```json
{
  "invoiceId": "invoice_uuid",
  "amount": 275.0,
  "paymentMethod": "bank_transfer",
  "paymentDate": "2024-01-25",
  "referenceNumber": "PAY001"
}
```

### Financial Analytics

```http
GET /api/finance/analytics?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

### Profit & Loss Report

```http
GET /api/finance/profit-loss?period=monthly&year=2024&month=1
Authorization: Bearer <token>
```

### Cash Flow Report

```http
GET /api/finance/cash-flow
Authorization: Bearer <token>
```

---

## Poultry Endpoints

### Create Bird Batch

```http
POST /api/poultry/batches
Authorization: Bearer <token>
```

**Body:**

```json
{
  "batchCode": "BB001",
  "birdType": "layer",
  "breed": "Rhode Island Red",
  "quantity": 500,
  "arrivalDate": "2024-01-15",
  "source": "Premium Hatchery",
  "ageInDays": 1,
  "unitCost": 3.5,
  "locationId": "location_uuid",
  "notes": "High quality chicks"
}
```

### Get All Batches

```http
GET /api/poultry/batches?birdType=layer&status=active&page=1&limit=20
Authorization: Bearer <token>
```

### Get Batch by ID

```http
GET /api/poultry/batches/{id}
Authorization: Bearer <token>
```

### Update Batch

```http
PUT /api/poultry/batches/{id}
Authorization: Bearer <token>
```

### Delete Batch

```http
DELETE /api/poultry/batches/{id}
Authorization: Bearer <token>
```

### Record Feeding

```http
POST /api/poultry/batches/{id}/feeding
Authorization: Bearer <token>
```

**Body:**

```json
{
  "date": "2024-01-20",
  "feedType": "Starter Feed",
  "quantityKg": 50,
  "costPerKg": 0.75,
  "remarks": "Daily feeding",
  "recordedById": "user_uuid"
}
```

### Get Feeding History

```http
GET /api/poultry/batches/{id}/feeding?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

### Record Health Event

```http
POST /api/poultry/batches/{id}/health
Authorization: Bearer <token>
```

**Body:**

```json
{
  "date": "2024-01-20",
  "type": "vaccination",
  "description": "Newcastle disease vaccine",
  "treatment": "ND vaccine via drinking water",
  "cost": 150.0,
  "veterinarian": "Dr. Smith",
  "recordedById": "user_uuid"
}
```

### Record Egg Production

```http
POST /api/poultry/batches/{id}/eggs
Authorization: Bearer <token>
```

**Body:**

```json
{
  "date": "2024-01-20",
  "totalEggs": 450,
  "gradeA": 380,
  "gradeB": 60,
  "gradeC": 10,
  "cracked": 0,
  "notes": "Good production day",
  "recordedById": "user_uuid"
}
```

### Record Bird Sale

```http
POST /api/poultry/batches/{id}/sales
Authorization: Bearer <token>
```

**Body:**

```json
{
  "date": "2024-01-20",
  "quantity": 50,
  "unitPrice": 15.5,
  "buyerName": "Local Market",
  "buyerContact": "+1234567890",
  "notes": "Sold mature birds",
  "recordedById": "user_uuid"
}
```

### Get Batch Performance

```http
GET /api/poultry/batches/{id}/performance
Authorization: Bearer <token>
```

### Poultry Analytics

```http
GET /api/poultry/analytics?startDate=2024-01-01&endDate=2024-01-31
Authorization: Bearer <token>
```

---

## Livestock Endpoints

### Create Animal

```http
POST /api/livestock/animals
Authorization: Bearer <token>
```

**Body:**

```json
{
  "tagNumber": "COW001",
  "type": "cattle",
  "breed": "Holstein",
  "gender": "female",
  "dateOfBirth": "2020-01-01",
  "acquisitionDate": "2020-02-01",
  "source": "Local Farm",
  "weight": 500,
  "color": "Black and White",
  "locationId": "location_uuid",
  "notes": "High-yielding dairy cow"
}
```

### Get All Animals

```http
GET /api/livestock/animals?type=cattle&status=alive&breed=Holstein
Authorization: Bearer <token>
```

### Get Animal by ID

```http
GET /api/livestock/animals/{id}
Authorization: Bearer <token>
```

### Update Animal

```http
PUT /api/livestock/animals/{id}
Authorization: Bearer <token>
```

### Delete Animal

```http
DELETE /api/livestock/animals/{id}
Authorization: Bearer <token>
```

### Record Health Event

```http
POST /api/livestock/animals/{id}/health
Authorization: Bearer <token>
```

**Body:**

```json
{
  "date": "2024-01-20",
  "type": "vaccination",
  "description": "FMD vaccination",
  "treatment": "Foot and Mouth Disease vaccine",
  "cost": 25.0,
  "veterinarian": "Dr. Johnson",
  "nextDueDate": "2024-07-20",
  "recordedById": "user_uuid"
}
```

### Record Breeding

```http
POST /api/livestock/animals/{id}/breeding
Authorization: Bearer <token>
```

**Body:**

```json
{
  "date": "2024-01-20",
  "method": "artificial_insemination",
  "sireId": "male_animal_uuid",
  "notes": "First AI attempt",
  "expectedCalvingDate": "2024-10-20",
  "recordedById": "user_uuid"
}
```

### Record Production

```http
POST /api/livestock/animals/{id}/production
Authorization: Bearer <token>
```

**Body:**

```json
{
  "date": "2024-01-20",
  "type": "milk",
  "quantity": 25.5,
  "unit": "liters",
  "quality": "Grade A",
  "notes": "Morning milking",
  "recordedById": "user_uuid"
}
```

### Record Animal Sale

```http
POST /api/livestock/animals/{id}/sales
Authorization: Bearer <token>
```

**Body:**

```json
{
  "date": "2024-01-20",
  "price": 1500.0,
  "buyerName": "Local Butcher",
  "buyerContact": "+1234567890",
  "weight": 450,
  "reason": "Culling",
  "recordedById": "user_uuid"
}
```

### Livestock Analytics

```http
GET /api/livestock/analytics
Authorization: Bearer <token>
```

### Breeding Schedule

```http
GET /api/livestock/breeding-schedule
Authorization: Bearer <token>
```

### Health Schedule

```http
GET /api/livestock/health-schedule
Authorization: Bearer <token>
```

---

## Fishery Endpoints

### Create Pond

```http
POST /api/fishery/ponds
Authorization: Bearer <token>
```

**Body:**

```json
{
  "name": "Pond 1",
  "type": "earthen",
  "size": 1000,
  "depth": 2.5,
  "waterSource": "borehole",
  "locationId": "location_uuid",
  "notes": "Main production pond"
}
```

### Get All Ponds

```http
GET /api/fishery/ponds?type=earthen&isActive=true
Authorization: Bearer <token>
```

### Get Pond by ID

```http
GET /api/fishery/ponds/{id}
Authorization: Bearer <token>
```

### Update Pond

```http
PUT /api/fishery/ponds/{id}
Authorization: Bearer <token>
```

### Record Fish Stocking

```http
POST /api/fishery/ponds/{id}/stocking
Authorization: Bearer <token>
```

**Body:**

```json
{
  "date": "2024-01-20",
  "species": "Catfish",
  "quantity": 1000,
  "averageWeight": 0.05,
  "totalWeight": 50,
  "source": "Local Hatchery",
  "cost": 500.0,
  "notes": "First stocking",
  "recordedById": "user_uuid"
}
```

### Record Fish Feeding

```http
POST /api/fishery/ponds/{id}/feeding
Authorization: Bearer <token>
```

**Body:**

```json
{
  "date": "2024-01-20",
  "feedType": "Catfish Feed",
  "quantity": 25,
  "cost": 37.5,
  "notes": "Morning feeding",
  "recordedById": "user_uuid"
}
```

### Record Water Quality

```http
POST /api/fishery/ponds/{id}/water-quality
Authorization: Bearer <token>
```

**Body:**

```json
{
  "date": "2024-01-20",
  "temperature": 25.5,
  "ph": 7.2,
  "oxygenLevel": 8.5,
  "ammonia": 0.1,
  "nitrite": 0.05,
  "nitrate": 2.0,
  "turbidity": 15,
  "notes": "Good water quality",
  "recordedById": "user_uuid"
}
```

### Record Fish Sampling

```http
POST /api/fishery/ponds/{id}/sampling
Authorization: Bearer <token>
```

**Body:**

```json
{
  "date": "2024-01-20",
  "sampleSize": 50,
  "averageWeight": 0.25,
  "totalWeight": 12.5,
  "survivalRate": 95,
  "notes": "Good growth observed",
  "recordedById": "user_uuid"
}
```

### Record Fish Harvest

```http
POST /api/fishery/ponds/{id}/harvest
Authorization: Bearer <token>
```

**Body:**

```json
{
  "date": "2024-01-20",
  "totalWeight": 500,
  "quantityHarvested": 1500,
  "averageWeight": 0.33,
  "pricePerKg": 5.5,
  "totalRevenue": 2750.0,
  "buyerName": "Fish Market",
  "notes": "Partial harvest",
  "recordedById": "user_uuid"
}
```

### Get Pond Performance

```http
GET /api/fishery/ponds/{id}/performance
Authorization: Bearer <token>
```

### Fishery Analytics

```http
GET /api/fishery/analytics
Authorization: Bearer <token>
```

### Water Quality Alerts

```http
GET /api/fishery/water-quality-alerts
Authorization: Bearer <token>
```

---

## Asset Endpoints

### Create Asset

```http
POST /api/assets
Authorization: Bearer <token>
```

**Body:**

```json
{
  "name": "Tractor John Deere",
  "assetType": "machinery",
  "serialNumber": "JD2024001",
  "purchaseDate": "2024-01-15",
  "purchasePrice": 75000.0,
  "condition": "excellent",
  "locationId": "location_uuid",
  "manufacturer": "John Deere",
  "model": "5075E",
  "specifications": {
    "engine": "75HP",
    "transmission": "Manual"
  }
}
```

### Get All Assets

```http
GET /api/assets?assetType=machinery&status=active&condition=good
Authorization: Bearer <token>
```

### Get Asset by ID

```http
GET /api/assets/{id}
Authorization: Bearer <token>
```

### Update Asset

```http
PUT /api/assets/{id}
Authorization: Bearer <token>
```

### Delete Asset

```http
DELETE /api/assets/{id}
Authorization: Bearer <token>
```

### Schedule Maintenance

```http
POST /api/assets/{id}/maintenance
Authorization: Bearer <token>
```

**Body:**

```json
{
  "type": "preventive",
  "description": "Oil change and filter replacement",
  "scheduledDate": "2024-02-01",
  "estimatedCost": 150.0,
  "assignedTo": "user_uuid",
  "notes": "Regular maintenance"
}
```

### Record Auxiliary Production

```http
POST /api/assets/auxiliary-production
Authorization: Bearer <token>
```

**Body:**

```json
{
  "type": "ice_block",
  "date": "2024-01-20",
  "quantityProduced": 100,
  "unit": "blocks",
  "costOfProduction": 200.0,
  "quantityDispatched": 80,
  "unitPrice": 3.5,
  "totalRevenue": 280.0,
  "notes": "Daily ice production"
}
```

### Asset Analytics

```http
GET /api/assets/analytics
Authorization: Bearer <token>
```

### Maintenance Schedule

```http
GET /api/assets/maintenance-schedule
Authorization: Bearer <token>
```

---

## User Management Endpoints

### Create User

```http
POST /api/users
Authorization: Bearer <token>
```

**Body:**

```json
{
  "email": "employee@farm.com",
  "firstName": "Jane",
  "lastName": "Smith",
  "phone": "+1234567890",
  "employeeId": "EMP001",
  "roleId": "role_uuid",
  "departmentId": "dept_uuid",
  "isActive": true
}
```

### Get All Users

```http
GET /api/users?role=worker&department=farm_operations&isActive=true
Authorization: Bearer <token>
```

### Get User by ID

```http
GET /api/users/{id}
Authorization: Bearer <token>
```

### Update User

```http
PUT /api/users/{id}
Authorization: Bearer <token>
```

### Deactivate User

```http
PUT /api/users/{id}/deactivate
Authorization: Bearer <token>
```

### Record Attendance

```http
POST /api/users/{id}/attendance
Authorization: Bearer <token>
```

**Body:**

```json
{
  "date": "2024-01-20",
  "clockIn": "08:00",
  "clockOut": "17:00",
  "workHours": 8,
  "overtimeHours": 0,
  "notes": "Regular work day"
}
```

### Process Payroll

```http
POST /api/users/{id}/payroll
Authorization: Bearer <token>
```

**Body:**

```json
{
  "period": "2024-01",
  "basicSalary": 3000.0,
  "overtime": 200.0,
  "bonuses": 150.0,
  "deductions": 100.0,
  "netSalary": 3250.0,
  "paymentDate": "2024-01-31"
}
```

### Request Leave

```http
POST /api/users/{id}/leave
Authorization: Bearer <token>
```

**Body:**

```json
{
  "type": "annual",
  "startDate": "2024-02-01",
  "endDate": "2024-02-05",
  "days": 5,
  "reason": "Family vacation",
  "coveringEmployeeId": "user_uuid"
}
```

### User Analytics

```http
GET /api/users/analytics
Authorization: Bearer <token>
```

---

## Notification Endpoints

### Get Notifications

```http
GET /api/notifications?type=reminder&priority=high&isRead=false
Authorization: Bearer <token>
```

### Mark as Read

```http
PUT /api/notifications/{id}/read
Authorization: Bearer <token>
```

### Create Notification

```http
POST /api/notifications
Authorization: Bearer <token>
```

**Body:**

```json
{
  "type": "alert",
  "title": "Low Stock Alert",
  "message": "Layer feed stock is below minimum level",
  "priority": "high",
  "recipientId": "user_uuid",
  "referenceType": "inventory",
  "referenceId": "item_uuid"
}
```

### Create Task

```http
POST /api/notifications/tasks
Authorization: Bearer <token>
```

**Body:**

```json
{
  "title": "Vaccination Due",
  "description": "Vaccinate Batch BB001 for Newcastle Disease",
  "assignedTo": "user_uuid",
  "dueDate": "2024-01-25",
  "priority": "high",
  "category": "health",
  "relatedModule": "poultry",
  "relatedId": "batch_uuid"
}
```

### Get Tasks

```http
GET /api/notifications/tasks?assignedTo=user_uuid&status=pending&priority=high
Authorization: Bearer <token>
```

### Update Task Status

```http
PUT /api/notifications/tasks/{id}/status
Authorization: Bearer <token>
```

**Body:**

```json
{
  "status": "completed",
  "completionNotes": "Vaccination completed successfully"
}
```

---

## Reporting Endpoints

### Generate Report

```http
POST /api/reports/generate
Authorization: Bearer <token>
```

**Body:**

```json
{
  "type": "production",
  "module": "poultry",
  "startDate": "2024-01-01",
  "endDate": "2024-01-31",
  "format": "pdf",
  "parameters": {
    "batchId": "batch_uuid",
    "includeCharts": true
  }
}
```

### Get Reports

```http
GET /api/reports?type=financial&status=completed&format=pdf
Authorization: Bearer <token>
```

### Get Report by ID

```http
GET /api/reports/{id}
Authorization: Bearer <token>
```

### Download Report

```http
GET /api/reports/{id}/download
Authorization: Bearer <token>
```

### Schedule Report

```http
POST /api/reports/schedule
Authorization: Bearer <token>
```

**Body:**

```json
{
  "name": "Monthly Production Report",
  "type": "production",
  "frequency": "monthly",
  "dayOfMonth": 1,
  "recipients": ["manager@farm.com"],
  "parameters": {
    "module": "poultry",
    "format": "pdf"
  },
  "isActive": true
}
```

### Dashboard Data

```http
GET /api/reports/dashboard?period=monthly&year=2024&month=1
Authorization: Bearer <token>
```

**Response includes:**

- Total revenue and expenses
- Production summaries
- Inventory status
- Recent transactions
- Upcoming tasks
- System alerts

---

## Rate Limiting

API requests are rate-limited to prevent abuse:

- **Authentication endpoints:** 5 requests per minute
- **General endpoints:** 100 requests per minute
- **File upload endpoints:** 10 requests per minute

When rate limit is exceeded, you'll receive a `429 Too Many Requests` response.

## Webhooks

The system supports webhooks for real-time notifications:

### Configure Webhook

```http
POST /api/webhooks
Authorization: Bearer <token>
```

**Body:**

```json
{
  "url": "https://your-app.com/webhook",
  "events": ["transaction.created", "inventory.low_stock", "task.due"],
  "secret": "webhook_secret"
}
```

### Webhook Events

- `transaction.created` - New financial transaction
- `inventory.low_stock` - Stock below minimum level
- `inventory.expiring` - Items expiring soon
- `task.due` - Task deadline approaching
- `health.vaccination_due` - Vaccination schedule reminder
- `production.milestone` - Production targets reached

---

## SDKs and Client Libraries

### JavaScript/Node.js

```bash
npm install @kuyash/farm-api-client
```

```javascript
import { KuyashFarmAPI } from '@kuyash/farm-api-client';

const client = new KuyashFarmAPI({
  baseURL: 'http://localhost:5000/api',
  accessToken: 'your_jwt_token',
});

// Get inventory items
const inventory = await client.inventory.getAll({
  page: 1,
  limit: 20,
  type: 'feed',
});

// Create transaction
const transaction = await client.finance.createTransaction({
  type: 'income',
  category: 'egg_sales',
  amount: 1500.0,
  description: 'Daily egg sales',
});
```

### Python

```bash
pip install kuyash-farm-api
```

```python
from kuyash_farm_api import KuyashFarmAPI

client = KuyashFarmAPI(
    base_url='http://localhost:5000/api',
    access_token='your_jwt_token'
)

# Get poultry batches
batches = client.poultry.get_batches(
    bird_type='layer',
    status='active'
)

# Record egg production
production = client.poultry.record_egg_production(
    batch_id='batch_uuid',
    date='2024-01-20',
    total_eggs=450,
    grade_a=380
)
```

---

## Testing

### Postman Collection

Import the Postman collection for easy API testing:

```
https://api.kuyashfarm.com/postman/collection.json
```

### Test Data

Use the following test credentials:

- **Admin:** admin@test.com / password123
- **Manager:** manager@test.com / password123
- **Worker:** worker@test.com / password123

---

## Support

For API support and questions:

- **Documentation:** https://docs.kuyashfarm.com
- **Email:** api-support@kuyashfarm.com
- **GitHub Issues:** https://github.com/kuyashfarm/api/issues

---

_Last updated: January 2024_
