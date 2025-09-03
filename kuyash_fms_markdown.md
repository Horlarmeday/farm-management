# 🌾 Kuyash Integrated Farm Management System (FMS)

A comprehensive multi-branch farm management platform combining **Poultry**,
**Fishery**, **Livestock**, and **Auxiliary Production Units** to improve
operations, monitoring, profitability, and scalability.

## 🧩 Core Modules

### 1. 🐔 Poultry Management

Tracks all poultry operations including layers, broilers, and breeders.

**Features:**

- **Flock Management:** Batch ID, breed, quantity, age, sex, date of arrival,
  source.
- **Growth Stage Monitoring:** Chicks, growers, adults.
- **Feed Tracking:** Feed inventory, daily consumption, feed conversion ratio
  (FCR).
- **Health & Vaccination:** Vaccination schedules, illness tracking, mortality,
  culling, disease response logs.
- **Egg Production:** Daily egg count, grading, packaging, size & quality
  metrics.
- **Sales & Disposal:** Eggs, live birds, spent layers/broilers, manure.

### 2. 🐟 Fish Pond Management

Handles fish lifecycle, water quality, and harvest activities.

**Features:**

- **Pond Records:** Pond type, size, location, fish species, stocking date.
- **Water Quality:** pH, temperature, oxygen, salinity.
- **Feeding Schedule:** Feed types, quantity, frequency.
- **Growth Monitoring:** Weight sampling, size analysis, mortality tracking.
- **Harvest & Sales:** Quantities harvested, mortality, sales logs.

### 3. 🐄 Livestock Management (Animal Husbandry)

Tracks animals such as cows, goats, sheep, pigs.

**Features:**

- **Animal Inventory:** Breed, ID/tag number, age, gender, acquisition date,
  origin.
- **Health & Treatments:** Vet visits, vaccination records, medical history.
- **Feeding & Nutrition:** Feed plans, pasture usage, supplements.
- **Breeding Management:** Heat cycles, insemination dates, pregnancy tracking,
  calving records.
- **Production Logs:** Milk yield, meat yield, weight gains.
- **Sales & Disposal:** Deadstock records, live/meat sales.

### 4. 🛠 Asset & Auxiliary Unit Management

Track non-animal production and fixed assets.

**Features:**

- **Asset Management:** Vehicles, machinery, tools -- with maintenance
  schedules.
- **Paper Crate Production:** Production logs, dispatch, cost and price
  tracking.
- **Ice Block Production:** Batch tracking, quantity produced/dispatched,
  cost/profit logs.
- **Manual Packaging:** Quantities packaged, cost, price, and dispatch logs.

## 📦 Cross-Module Shared Features

### ✅ Inventory Management

- Real-time feed, medicine, equipment, and tool tracking.
- Low stock alerts and expiry reminders.

### 💵 Finance & Expense Management

- Tracks income (eggs, fish, meat, services).
- Operational expenses (feed, medicine, labor, utilities).
- Profit & loss calculations.
- Cost of production per product/unit.

### 👥 Employee/HR Management

- Staff profiles (role, department, bio).
- Attendance, payroll, performance.
- Duty assignment and accountability.

### 📈 Reports & Analytics

- Custom reports by date range, module, batch, or activity.
- Growth and productivity reports.
- Sales performance and expense trend analysis.
- Exportable in PDF/Excel.

### 📲 Alerts & Notifications

- Vaccination reminders.
- Feed time and low inventory warnings.
- Harvest and task reminders.
- System alerts (e.g., pond pH abnormality).

### 🛡 Access Control & User Roles

- Role-based access (Admin, Manager, Worker).
- Audit trail/log of user activities.

### 📊 Central Dashboard

- At-a-glance KPIs across all modules.
- Real-time visualization of stock, revenue, expenses, and alerts.

## 🌍 Additional Features (Based on Global Best Practices)

### 🛰 GIS & IoT Integration _(optional advanced tier)_

- GPS mapping of ponds, pens, and pasture.
- Sensor integration for water quality and climate data.
- Smart alerts from IoT sensors (temperature, ammonia, water levels).

### 🧾 Traceability & Compliance

- Full animal/batch traceability (from origin to sale).
- Export documentation & compliance log (for food safety & veterinary
  standards).

### 🗓 Calendar & Task Management

- Daily/weekly task planner for staff.
- Seasonal planning (e.g., vaccination cycles, breeding seasons).

### 📥 CRM & Order Management _(optional add-on)_

- Customer database for regular buyers.
- Sales orders, delivery tracking, invoicing.

### 📱 Mobile Access / Offline Mode

- Mobile app support for field workers.
- Offline record-keeping synced when back online.

### 🧮 Production Forecasting & Planning

- Estimate yields based on historical data.
- Feed budgeting based on animal growth and production cycles.

## 🏗 System Architecture

```
                           ┌────────────────────────────┐
                           │     Mobile App (PWA)       │
                           │ (Field data entry, offline)│
                           └────────────┬───────────────┘
                                        │
               ┌────────────────────────▼────────────────────────┐
               │               API Gateway (REST)                │
               │ Handles routing, auth, and request proxying     │
               └────────────────────┬────────────────────────────┘
                                    │
     ┌──────────────────────────────┼────────────────────────────────────┐
     │                              │                                    │
┌────▼────┐               ┌─────────▼─────────┐                ┌────────▼────────┐
│ Auth Svc│               │ Poultry Svc       │                │ Livestock Svc   │
│ (JWT/OAuth)             │ (Birds, eggs, FCR)│                │ (Animals, breed │
└─────────┘               └───────────────────┘                └─────────────────┘
┌─────────────┐     ┌──────────────┐       ┌───────────────┐     ┌────────────────┐
│ Fishery Svc │     │ Inventory Svc│       │ Expense Svc   │     │ HR/Staff Svc   │
│ (Ponds, feed│     │ (Tools, meds)│       │ (Sales, cost) │     │ (Attendance)   │
└─────────────┘     └──────────────┘       └───────────────┘     └────────────────┘
              ┌──────────────┐             ┌────────────────────┐
              │ Report Svc   │             │ Notification Svc    │
              │ (PDF, Excel) │             │ (Email/SMS/Alerts) │
              └──────────────┘             └────────────────────┘
                             ┌────────────┐
                             │   Database │ ← PostgreSQL/MySQL
                             └────────────┘
                             ┌────────────┐
                             │ File Store │ ← AWS S3 / Spaces
                             └────────────┘
```

### Architecture Components

**Frontend Layer:**

- **Mobile App (PWA):** Progressive Web App for field workers with offline
  capabilities
- **Web Dashboard:** React-based admin interface for comprehensive farm
  management

**API Layer:**

- **API Gateway:** Central routing hub handling authentication, request
  proxying, and load balancing
- **Microservices:** Modular services for each farm management domain

**Service Layer:**

- **Auth Service:** JWT/OAuth2 authentication and authorization
- **Poultry Service:** Bird management, egg tracking, FCR calculations
- **Livestock Service:** Animal husbandry, breeding, production logs
- **Fishery Service:** Pond management, water quality, feeding schedules
- **Inventory Service:** Feed, medicine, tools, and equipment tracking
- **Expense Service:** Sales, costs, profit/loss calculations
- **HR/Staff Service:** Employee management, attendance, payroll
- **Report Service:** PDF/Excel generation and analytics
- **Notification Service:** Email, SMS, and push notifications

**Data Layer:**

- **Database:** PostgreSQL/MySQL for structured data storage
- **File Store:** AWS S3 or DigitalOcean Spaces for document and media storage

## 🗂 Database Schema Outline

### 🔐 1. User & Role Management

**users**

- id (PK)
- name
- email
- password_hash
- role_id (FK to roles)
- status (active/inactive)
- created_at
- updated_at

**roles**

- id (PK)
- name (admin, manager, worker)
- permissions (JSON)

### 🐔 2. Poultry Management

**bird_batches**

- id (PK)
- batch_code
- bird_type (layer, broiler, breeder)
- breed
- quantity
- arrival_date
- source
- house_location
- status (active/sold/culled)

**bird_feeding_logs**

- id (PK)
- batch_id (FK to bird_batches)
- date
- feed_type
- quantity_kg
- remarks

**egg_production_logs**

- id (PK)
- batch_id (FK to bird_batches)
- date
- egg_count
- grade (A/B/cracked)
- packaging_status

**bird_health_records**

- id (PK)
- batch_id (FK)
- date
- vaccine_or_disease
- action_taken
- remarks

**bird_sales**

- id (PK)
- batch_id (FK)
- date
- bird_type
- quantity
- unit_price
- buyer_name

### 🐄 3. Livestock Management

**animals**

- id (PK)
- tag_number
- species (cow, goat, pig)
- breed
- gender
- date_of_birth
- acquisition_date
- source
- status (alive/sold/dead)

**animal_health_records**

- id (PK)
- animal_id (FK)
- date
- treatment/vaccine
- notes

**breeding_records**

- id (PK)
- female_id (FK to animals)
- male_id (FK to animals)
- insemination_date
- pregnancy_confirmed (bool)
- calving_date
- calf_tag

**production_logs**

- id (PK)
- animal_id (FK)
- date
- milk_yield_liters
- meat_weight_kg

### 🐟 4. Fish Pond Management

**ponds**

- id (PK)
- name
- location
- type (earthen/concrete/tank)
- size_m2
- species_stocked
- stocking_date
- initial_stock_count

**pond_water_quality**

- id (PK)
- pond_id (FK)
- date
- ph
- temperature
- oxygen_level
- remarks

**fish_feeding_logs**

- id (PK)
- pond_id (FK)
- date
- feed_type
- quantity_kg

**fish_sampling_logs**

- id (PK)
- pond_id (FK)
- date
- average_weight_g
- survival_rate
- notes

**fish_harvests**

- id (PK)
- pond_id (FK)
- date
- quantity_harvested
- average_weight
- total_weight
- sales_id (optional FK)

### 🏭 5. Asset & Auxiliary Production

**assets**

- id (PK)
- asset_name
- category (vehicle, tool, machine)
- serial_number
- purchase_date
- condition
- location
- assigned_to (FK to users)
- maintenance_logs (JSON or separate table)

**auxiliary_production**

- id (PK)
- type (paper_crate, ice_block, manual_pack)
- date
- quantity_produced
- cost_of_production
- quantity_dispatched
- unit_price

### 📦 6. Inventory & Consumables

**inventory_items**

- id (PK)
- item_name
- category (feed, medicine, tools)
- unit
- reorder_level
- current_stock
- expiry_date
- supplier

**inventory_transactions**

- id (PK)
- item_id (FK)
- type (in/out/adjustment)
- date
- quantity
- reason
- user_id (FK)

### 💵 7. Finance, Sales & Expenses

**sales**

- id (PK)
- item_type (egg, bird, fish, meat, crate)
- item_id (FK to relevant table)
- date
- quantity
- unit_price
- total_amount
- buyer_name

**expenses**

- id (PK)
- category (feed, salary, med, utility)
- description
- amount
- date
- payment_method
- recorded_by (FK to users)

### 🔔 8. Notifications & Task Reminders

**notifications**

- id (PK)
- type (vaccine_due, feed_low, water_alert)
- reference_id
- module (poultry, pond, etc.)
- content
- status (unread/read)
- triggered_at

**tasks**

- id (PK)
- title
- description
- assigned_to (FK to users)
- related_module
- due_date
- status (pending/completed)

## 🧱 Tech Stack Recommendation

| Layer             | Tech Suggestions                                                        |
| ----------------- | ----------------------------------------------------------------------- |
| Frontend (Web)    | React.js                                                                |
| Frontend (Mobile) | PWA                                                                     |
| Backend API       | Node.js (Express)                                                       |
| Database          | MySQL                                                                   |
| Notifications     | Email service, Socket.IO, Web Push API, IndexedDB + Background Sync API |
| File Storage      | AWS S3 / Google Drive                                                   |
| Authentication    | JWT / OAuth2 + Role-based ACL                                           |
