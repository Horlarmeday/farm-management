# 🌾 Kuyash Integrated Farm Management System (FMS)

A comprehensive multi-branch farm management platform combining **Poultry**,
**Fishery**, **Livestock**, and **Auxiliary Production Units** to improve
operations, monitoring, profitability, and scalability.

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [Development](#development)
- [API Documentation](#api-documentation)
- [Database Schema](#database-schema)
- [Security](#security)
- [Contributing](#contributing)
- [License](#license)

## ✨ Features

### 🧩 Core Modules

- **🐔 Poultry Management**: Flock tracking, feed management, health monitoring,
  egg production
- **🐟 Fish Pond Management**: Pond records, water quality monitoring, feeding
  schedules, harvest tracking
- **🐄 Livestock Management**: Animal inventory, health records, breeding
  management, production logs
- **🛠 Asset & Auxiliary Management**: Equipment tracking, paper crate
  production, ice block production

### 📦 Cross-Module Features

- **✅ Inventory Management**: Real-time tracking with low stock alerts
- **💵 Financial Management**: Income/expense tracking, profit/loss calculations
- **👥 HR Management**: Staff profiles, attendance, payroll
- **📈 Reports & Analytics**: Custom reports, export to PDF/Excel
- **📲 Notifications**: Vaccination reminders, feed alerts, task notifications
- **🛡 Access Control**: Role-based permissions with audit trail
- **📊 Dashboard**: Real-time KPIs and visualizations

### 🌍 Advanced Features

- **📱 Mobile PWA**: Offline-capable mobile interface
- **🔔 Real-time Notifications**: WebSocket-based live updates
- **📈 Analytics**: Data visualization and trend analysis
- **🔐 Security**: JWT authentication, input validation, rate limiting
- **🎨 Modern UI**: Responsive design with dark/light mode

## 🛠 Tech Stack

### Frontend

- **React 18** with TypeScript
- **Vite** for fast development
- **React Router** for navigation
- **Zustand** for state management
- **React Query** for server state
- **Tailwind CSS** + **shadcn/ui** for styling
- **Chart.js** for data visualization

### Backend

- **Node.js** with Express & TypeScript
- **TypeORM** for database operations
- **MySQL** database
- **JWT** authentication
- **Socket.io** for real-time features
- **Joi** for input validation
- **Nodemailer** for email notifications

### DevOps

- **Docker** for containerization
- **Docker Compose** for development
- **ESLint** + **Prettier** for code quality
- **Jest** for testing

## 📁 Project Structure

```
kuyash-farm-management/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/         # Page components
│   │   ├── hooks/         # Custom React hooks
│   │   ├── stores/        # Zustand stores
│   │   ├── services/      # API services
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript types
│   ├── public/            # Static assets
│   └── package.json
├── server/                 # Node.js backend
│   ├── src/
│   │   ├── controllers/   # Route controllers
│   │   ├── services/      # Business logic
│   │   ├── entities/      # TypeORM entities
│   │   ├── middleware/    # Express middleware
│   │   ├── routes/        # API routes
│   │   ├── utils/         # Utility functions
│   │   └── types/         # TypeScript types
│   ├── migrations/        # Database migrations
│   └── package.json
├── shared/                 # Shared types and utilities
│   ├── src/
│   │   ├── types/         # Common TypeScript types
│   │   └── utils/         # Shared utilities
│   └── package.json
├── docker-compose.dev.yml  # Development environment
├── docker-compose.prod.yml # Production environment
├── .gitignore
├── package.json           # Root package.json
└── README.md
```

## 🚀 Getting Started

### Prerequisites

- Node.js (v18 or higher)
- npm or yarn
- MySQL (v8 or higher)
- Docker (optional, for containerized development)

### Installation

1. **Clone the repository**

   ```bash
   git clone https://github.com/your-username/kuyash-farm-management.git
   cd kuyash-farm-management
   ```

2. **Install dependencies**

   ```bash
   npm run setup
   ```

3. **Set up environment variables**

   ```bash
   # Copy environment templates
   cp server/.env.example server/.env
   cp client/.env.example client/.env

   # Edit the environment files with your configuration
   ```

4. **Set up the database**

   ```bash
   # Create MySQL database
   mysql -u root -p -e "CREATE DATABASE kuyash_fms;"

   # Run migrations
   cd server && npm run migration:run
   ```

5. **Start the development servers**
   ```bash
   npm run dev
   ```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000
- API Documentation: http://localhost:5000/api-docs

## 🔧 Development

### Available Scripts

```bash
# Development
npm run dev              # Start both client and server
npm run dev:client       # Start only client
npm run dev:server       # Start only server

# Building
npm run build           # Build all packages
npm run build:client    # Build client only
npm run build:server    # Build server only

# Testing
npm run test            # Run all tests
npm run test:client     # Run client tests
npm run test:server     # Run server tests

# Linting
npm run lint            # Lint all code
npm run lint:client     # Lint client code
npm run lint:server     # Lint server code

# Docker
npm run docker:dev      # Start development with Docker
npm run docker:prod     # Start production with Docker
```

### Code Quality

This project uses:

- **ESLint** for code linting
- **Prettier** for code formatting
- **Husky** for pre-commit hooks
- **TypeScript** for type safety

### Testing

- **Frontend**: React Testing Library + Jest
- **Backend**: Jest + Supertest
- **E2E**: Playwright (optional)

## 📚 API Documentation

The API is documented using Swagger/OpenAPI. Access the interactive
documentation at:

```
http://localhost:5000/api-docs
```

### Authentication

All API endpoints (except registration and login) require authentication:

```bash
# Login
POST /api/auth/login
Content-Type: application/json
{
  "email": "user@example.com",
  "password": "password"
}

# Use the returned JWT token in subsequent requests
Authorization: Bearer <your-jwt-token>
```

## 🗃 Database Schema

The system uses a MySQL database with the following main entities:

- **Users & Roles**: Authentication and authorization
- **Poultry**: Bird batches, feeding logs, egg production, health records
- **Livestock**: Animals, health records, breeding, production logs
- **Fishery**: Ponds, water quality, feeding, harvests
- **Assets**: Equipment, vehicles, maintenance logs
- **Inventory**: Items, transactions, stock levels
- **Finance**: Sales, expenses, profit/loss tracking
- **Notifications**: Alerts, reminders, task management

## 🔒 Security

This application implements comprehensive security measures:

- **Authentication**: JWT tokens with refresh token rotation
- **Authorization**: Role-based access control (RBAC)
- **Input Validation**: Joi schemas for all inputs
- **SQL Injection Prevention**: TypeORM parameterized queries
- **XSS Protection**: Input sanitization and CSP headers
- **CSRF Protection**: Anti-CSRF tokens
- **Rate Limiting**: Request throttling
- **HTTPS**: SSL/TLS encryption
- **Password Security**: Bcrypt hashing with salt

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/your-feature`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature/your-feature`
5. Open a pull request

### Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all tests pass before submitting PR
- Use meaningful commit messages

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file
for details.

## 🙏 Acknowledgments

- Thanks to all contributors
- Built with modern web technologies
- Inspired by real-world farm management needs

---

**Made with ❤️ for sustainable farming**
