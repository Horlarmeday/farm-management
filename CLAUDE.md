# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Kuyash Farm Management System is a comprehensive multi-branch farm management platform combining Poultry, Fishery, Livestock, and Auxiliary Production Units. It's built as a monorepo with:

- **Client**: React 18 + TypeScript frontend with Vite
- **Server**: Node.js + Express + TypeScript backend with TypeORM
- **Shared**: Shared TypeScript types and utilities

## Development Commands

### Workspace Management
```bash
# Install dependencies
yarn setup

# Development (runs both client and server concurrently)
yarn dev
yarn dev:client    # Start only frontend (Vite dev server)
yarn dev:server    # Start only backend (nodemon with hot reload)

# Building
yarn build         # Build all packages (shared → server → client)
yarn build:shared  # Build shared types first
yarn build:server  # Build backend (TypeScript compilation + tsc-alias)
yarn build:client  # Build frontend (Vite production build)

# Code Quality
yarn format        # Format code with Prettier
yarn format:check  # Check formatting
yarn typecheck     # Run TypeScript type checking across all workspaces
yarn code:check    # Run typecheck + format check together
yarn code:fix      # Auto-format all code

# Testing
yarn test          # Run all tests
yarn test:client   # Run client tests
yarn test:server   # Run server tests
yarn test:e2e      # Run Playwright E2E tests
yarn test:e2e:ui   # Run E2E tests with UI
yarn test:e2e:headed  # Run E2E tests in headed mode
yarn test:e2e:debug   # Debug E2E tests
```

### Server-Specific Commands
```bash
cd server

# Development
yarn dev           # Start with nodemon (watches src/ for changes)

# Database Operations
yarn migration:generate  # Generate migration from entity changes
yarn migration:run       # Run pending migrations
yarn migration:revert    # Revert last migration
yarn schema:sync         # Sync schema (dev only - dangerous in production)
yarn schema:drop         # Drop all tables (destructive)
yarn seed                # Seed database with test data
yarn db:reset            # Drop, migrate, and seed (fresh start)

# Testing
yarn test          # Run Jest tests
yarn test:watch    # Watch mode
yarn test:coverage # With coverage report
```

### Client-Specific Commands
```bash
cd client

# Development
yarn dev           # Start Vite dev server (port 3000)
yarn build         # Production build
yarn build:analyze # Build with bundle analyzer
yarn start         # Preview production build

# Testing
yarn test          # Run performance validation tests
```

## Architecture Patterns

### Multi-Tenant Architecture
- Each farm operates as an isolated tenant with `farmId` foreign keys
- **CRITICAL**: Always include `farmId` in queries when accessing farm-specific data
- Use the `farm-auth.middleware.ts` to validate farm access permissions
- Farm context is managed via `FarmContext` on the client

### Service Layer Pattern (Server)
```
Controllers → Services → Repositories (TypeORM) → Entities
```
- **Controllers**: Handle HTTP request/response, validation
- **Services**: Contain business logic, error handling
- **Repositories**: Data access via TypeORM
- **Entities**: Database models with TypeORM decorators

### State Management (Client)
- **React Query**: Server state management and caching
- **Zustand**: Client-side state (not currently used extensively)
- **React Context**: Farm context, WebSocket context, Auth context

### Real-Time Features
- **WebSocket Service**: Located at `server/src/services/websocket.service.ts`
- **Client Hook**: `useWebSocket` hook for managing connections
- Events follow pattern: `farm:{farmId}:{event-type}`
- Authentication required via JWT token in handshake

### Progressive Web App (PWA)
- Service worker configured in `client/vite.config.ts`
- Offline storage via **Dexie** (IndexedDB wrapper)
- Sync service at `client/src/services/syncService.ts`
- Network-first strategy for API calls, cache-first for static assets

## Important File Locations

### Server Configuration
- **Main config**: `server/src/config/index.ts` (validated with Joi)
- **Database config**: `server/src/config/database.ts`
- **Data source**: `server/src/data-source.ts` (exports AppDataSource for TypeORM CLI)
- **App entry**: `server/src/app.ts` → `server/src/server.ts`

### Environment Files
- Development: `server/.env`
- Testing: `server/.env.test`
- Client: `client/.env` (if needed)

### Key Middleware
- **Authentication**: `server/src/middleware/auth.middleware.ts`
- **Farm Auth**: `server/src/middleware/farm-auth.middleware.ts`
- **Cache**: `server/src/middleware/cache.middleware.ts`
- **Rate Limiting**: `server/src/middleware/rateLimiter.middleware.ts`
- **Validation**: `server/src/middleware/validation.middleware.ts`

### Client Services
All services extend from base service pattern:
- **Base**: `client/src/services/api.ts`
- **Auth**: `client/src/services/auth.service.ts`
- **Farm**: `client/src/services/farm.service.ts`
- **Dashboard**: `client/src/services/dashboard.service.ts`
- **Livestock/Poultry/Fishery**: `client/src/services/[domain].service.ts`

### React Query Hooks
- Query keys factory pattern in `client/src/lib/queryKeys.ts`
- Custom hooks follow naming: `use[Entity]` (e.g., `useFarms`, `useLivestock`)

## Database & TypeORM

### Running Migrations
```bash
cd server
yarn migration:run    # Apply pending migrations
```

### Creating Migrations
```bash
# 1. Modify entity files in server/src/entities/
# 2. Generate migration
yarn migration:generate -- src/database/migrations/descriptive-name

# 3. Review generated migration file
# 4. Run migration
yarn migration:run
```

### Entity Conventions
- Use TypeORM decorators: `@Entity`, `@Column`, `@PrimaryGeneratedColumn`, etc.
- All entities should extend `BaseEntity` (if available) for common fields
- Use `@CreateDateColumn`, `@UpdateDateColumn` for timestamps
- Foreign keys: Use `@ManyToOne`, `@OneToMany`, `@ManyToMany` with `@JoinColumn`
- Naming: PascalCase for class names, camelCase for properties

### Database Schema
- **MySQL** is the primary database
- **Redis** is used for caching and sessions
- Multi-tenant design with `farmId` on most tables
- Performance indexes added via migration 015

## API Design Patterns

### Response Format
All API responses follow this structure:
```typescript
{
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}
```

### Error Handling
- Use custom error classes: `ApiError`, `ValidationError`, `NotFoundError`, `UnauthorizedError`
- Located at: `server/src/utils/ApiError.ts` and `server/src/utils/error-handler.ts`
- Global error handler: Pass errors to `next(error)` in controllers

### Authentication
- **JWT tokens**: Access token (1h) + Refresh token (7d)
- Tokens stored in localStorage on client
- Add to requests via Authorization header: `Bearer <token>`
- Token handling in `server/src/middleware/auth.middleware.ts`

### Rate Limiting
- General API: 100 requests per 15 minutes
- Auth endpoints: 5 requests per 15 minutes
- Production only (disabled in development)

## Client Architecture

### Component Organization
```
components/
├── ui/              # shadcn/ui base components
├── forms/           # Form components (CreateAnimalForm, etc.)
├── layout/          # Layout components (Sidebar, MobileNavigation)
├── dashboard/       # Dashboard-specific components
├── farm/            # Farm management components
├── finance/         # Financial components
├── iot/             # IoT sensor components
├── mobile/          # Mobile-optimized components
└── notifications/   # Notification components
```

### Hooks Organization
- **Custom hooks**: `client/src/hooks/`
- **Authentication**: `useAuth.ts`
- **WebSocket**: `useWebSocket.ts`
- **Responsive**: `useResponsive.ts`, `useMediaQuery.ts`
- **Performance**: `usePerformanceTracker.ts`, `useMobilePerformance.ts`
- **Dashboard**: `useDashboard.ts`

### Styling
- **Tailwind CSS** with custom configuration
- **shadcn/ui** for base components
- Responsive breakpoints defined in `tailwind.config.js`
- Theme support (light/dark) via `next-themes`

## TypeScript Standards

### Import Organization
1. Node modules
2. Internal packages (@shared)
3. Local imports (@/)

### Path Aliases
**Client:**
- `@/*` → `client/src/*`
- `@shared/*` → `shared/dist/*`

**Server:**
- `@/*` → `server/src/*`
- `@/config/*` → `server/src/config/*`
- `@/controllers/*` → `server/src/controllers/*`
- `@/services/*` → `server/src/services/*`
- `@/entities/*` → `server/src/entities/*`

### Type Safety
- Strict mode enabled across all packages
- Avoid `any` - use `unknown` with type guards
- Use shared types from `@shared/types` when available
- Prefer `interface` for objects, `type` for unions/computed types

### Naming Conventions
- **Variables/Functions**: camelCase
- **Components/Classes/Types**: PascalCase
- **Constants**: UPPER_SNAKE_CASE
- **Files**: Match their primary export (PascalCase for components, camelCase for utilities)

## Key Business Domains

1. **Farm Management**: Multi-tenant operations, farm switching
2. **Livestock Management**: Animal tracking, health records, breeding
3. **Poultry Management**: Bird flocks, egg production, feeding
4. **Fishery Management**: Pond management, water quality, harvests
5. **Financial Management**: Transactions, budgets, P&L reports
6. **Inventory Management**: Feed, medicine, equipment tracking
7. **IoT Integration**: Sensor data, real-time monitoring
8. **User Management**: Authentication, authorization, roles

## Currency & Localization

- Default currency: **Nigerian Naira (₦)**
- Currency symbol: Use `₦` prefix
- Number formatting: Nigerian locale (e.g., `₦1,000,000.00`)

## Security Considerations

- **Input Validation**: Use Joi schemas on server, Zod on client
- **SQL Injection**: TypeORM parameterized queries
- **XSS Protection**: Input sanitization, CSP headers (Helmet)
- **CSRF Protection**: CORS configuration in `server/src/config/index.ts`
- **Password Security**: Bcrypt hashing (12 rounds)
- **Sensitive Data**: Encryption service at `server/src/services/encryption.service.ts`
- **ENCRYPTION_KEY**: Required 32+ character key in environment

## Performance Optimization

### Client
- Code splitting via Vite manual chunks (see `client/vite.config.ts`)
- React Query caching: 5min stale time, 10min garbage collection
- Image optimization: Cache-first strategy
- Virtual scrolling: `VirtualList` component for long lists
- Debouncing: `useDebounce` hook for search inputs

### Server
- Redis caching middleware
- Database indexes via migration 015
- Query optimization: Avoid N+1 queries, use `relations` in TypeORM
- Rate limiting to prevent abuse
- Compression middleware for responses

## Testing

### Server Tests
- **Jest** for unit/integration tests
- Mock repositories for service testing
- Test files: `*.test.ts` or `*.spec.ts`

### Client Tests
- **React Testing Library** for component tests
- **Playwright** for E2E tests (config in `playwright.config.ts`)

### E2E Testing
```bash
yarn test:e2e          # Headless mode
yarn test:e2e:headed   # With browser
yarn test:e2e:ui       # Interactive UI mode
yarn test:e2e:debug    # Debug mode
```

## Common Pitfalls

1. **Forgetting farmId**: Always filter by `farmId` in multi-tenant queries
2. **Missing await**: TypeORM operations are async - always await
3. **Not invalidating cache**: After mutations, invalidate related React Query keys
4. **Hardcoded values**: Use configuration or database-driven values
5. **Missing error handling**: Always wrap async operations in try-catch
6. **Synchronous blocking**: Use async/await, avoid blocking the event loop
7. **Large payloads**: Paginate lists, use virtual scrolling for UI
8. **Missing indexes**: Check migration 015 for performance-critical queries

## Deployment

### Environment Variables (Production)
Required for production (see `server/src/config/index.ts` validation):
- `JWT_SECRET`
- `JWT_REFRESH_SECRET`
- `SESSION_SECRET`
- `ENCRYPTION_KEY` (32+ characters)
- `DB_HOST`, `DB_USERNAME`, `DB_PASSWORD`
- `MAIL_HOST`, `MAIL_USER`, `MAIL_PASSWORD`
- `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` (for push notifications)

### Database Setup
```bash
# 1. Create database
mysql -u root -p -e "CREATE DATABASE kuyash_fms;"

# 2. Run migrations
cd server && yarn migration:run

# 3. (Optional) Seed data
yarn seed
```

### Docker
```bash
yarn docker:dev   # Development with Docker Compose
yarn docker:prod  # Production with Docker Compose
```

## WebSocket Events

Follow this pattern for WebSocket events:
- **Connection**: Authenticated via JWT token
- **Room joining**: `join-farm` with `farmId`
- **Broadcasting**: Use `WebSocketService` methods
  - `broadcastToFarm(farmId, event, data)`
  - `broadcastToUser(userId, event, data)`
  - `broadcastToAll(event, data)`

## Known Issues & Workarounds

1. **ESLint temporarily disabled**: Use `yarn format` and `yarn typecheck` instead
2. **Workspace naming inconsistency**: Client workspace is named `rest-express` (legacy)
3. **Service worker in dev**: PWA service worker runs in development mode

## Additional Resources

- **TypeORM Documentation**: https://typeorm.io
- **React Query Documentation**: https://tanstack.com/query/latest
- **shadcn/ui Components**: https://ui.shadcn.com
- **Vite Documentation**: https://vitejs.dev