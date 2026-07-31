# Pioneer Enterprises

Pioneer Enterprises is a unified web platform for the Pioneer family of businesses. The repository contains the public corporate website, self-contained division websites, a centralized administration panel, and the backend foundation for a company-wide ERP system.

The architecture allows each division to maintain its own branding, services, pages, and operational tools while sharing common infrastructure, authentication, business data, and reusable interface components.

## Divisions

| Division | Status | Scope |
| --- | --- | --- |
| Pioneer Pressure Washing & Landscaping | Active | Exterior cleaning, landscaping, property maintenance, scheduling, estimates, customers, expenses, documents, and operational reporting |
| Pioneer Transport | Coming soon | Transportation and logistics services |
| Pioneer Productions | Coming soon | Creative production services for businesses, organizations, events, and individuals |

Additional divisions can be added without restructuring the rest of the application.

## Platform Scope

The project is being built as both a public-facing website and an internal business management platform. Its intended scope includes:

- Corporate and division websites
- Centralized administration
- Customer and contact management
- Quotes, estimates, and service requests
- Scheduling and work orders
- Employee and role management
- Expenses, assets, and equipment tracking
- Documents and business history
- Metrics, notifications, and reporting
- Customer and employee portals

## Technology

### Frontend

- React 19
- TypeScript
- React Router
- Vite
- Tauri 2 support

### Backend

- Node.js
- Express 5
- TypeScript
- Prisma
- PostgreSQL
- JSON Web Token authentication
- Zod validation

### Deployment Architecture

- Static frontend hosting through GitHub Pages
- Backend API hosting through Render
- PostgreSQL database
- Optional Tauri desktop builds

## Repository Structure

```text
.
├── src/
│   ├── website/              # Public Pioneer Enterprises website
│   ├── admin/                # Central administration panel
│   ├── divisions/
│   │   └── landscaping/      # Pioneer Landscaping division site
│   ├── shared/               # Shared components, constants, types, and utilities
│   ├── services/             # Frontend service and API integrations
│   ├── styles/               # Shared application styling
│   ├── App.tsx
│   ├── router.tsx
│   └── main.tsx
├── server/
│   ├── prisma/               # Database schema and migrations
│   ├── src/                  # Express API source
│   ├── .env.example
│   └── README.md
├── src-tauri/                # Tauri desktop application configuration
├── render.yaml               # Render deployment configuration
└── package.json
```

The frontend router combines the corporate website, division routes, and admin routes into a single application. Division-specific functionality remains contained within its division directory, while shared systems remain available across the platform.

## Requirements

- Node.js 20.19 or newer
- npm
- PostgreSQL for backend development

## Local Development

Clone the repository:

```bash
git clone https://github.com/Del-985/Pioneer-Enterpises.git
cd Pioneer-Enterpises
```

Install the frontend dependencies:

```bash
npm install
```

Start the frontend development server:

```bash
npm run dev
```

The Vite development server runs on port `5173` by default.

## Backend Setup

Copy the backend environment template:

```bash
cp server/.env.example server/.env
```

Configure the following values in `server/.env`:

```env
DATABASE_URL=postgresql://...
JWT_SECRET=replace-with-a-long-random-secret
CLIENT_ORIGIN=http://localhost:5173
```

Configure the frontend API URL in a root `.env` file:

```env
VITE_API_BASE_URL=http://localhost:4000
```

Install and initialize the backend:

```bash
npm run api:install
npm run api:generate
npm run api:migrate
npm run api:dev
```

The API runs on `http://localhost:4000` by default.

## Available Commands

| Command | Purpose |
| --- | --- |
| `npm run dev` | Start the Vite frontend development server |
| `npm run build` | Type-check and build the frontend |
| `npm run lint` | Run ESLint |
| `npm run preview` | Preview the production frontend build |
| `npm run api:install` | Install backend dependencies |
| `npm run api:dev` | Start the backend development server |
| `npm run api:build` | Build the backend |
| `npm run api:test` | Run backend integration tests |
| `npm run api:generate` | Generate the Prisma client |
| `npm run api:migrate` | Run local Prisma migrations |
| `npm run tauri:dev` | Run the Tauri desktop application in development |
| `npm run tauri:build` | Build the Tauri desktop application |

## Current API Endpoints

```text
GET  /health
GET  /ready
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me
POST /api/auth/forgot-password
POST /api/public/quotes
POST /api/public/service-requests
GET  /api/admin/customers
GET  /api/admin/quotes
GET  /api/admin/service-requests
PATCH /api/admin/quotes/:id
PUT  /api/admin/quotes/:id/details
POST /api/admin/quotes/:id/convert-to-job
GET  /api/admin/quotes/:id/document
PATCH /api/admin/service-requests/:id
POST /api/admin/service-requests/:id/convert-to-job
GET  /api/admin/jobs
GET  /api/admin/jobs/:id
PATCH /api/admin/jobs/:id
```

## Architectural Principles

The project follows several core principles:

- TypeScript-first development
- Clear separation between the public website and internal administration
- Self-contained division modules
- Shared reusable systems where duplication provides no benefit
- Responsive, mobile-first interfaces
- Centralized authentication and permissions
- A backend designed to grow into a complete ERP platform

## Roadmap

See [ROADMAP.md](ROADMAP.md) for the ordered delivery plan, milestone acceptance criteria, and immediate execution sequence.

### Foundation

- Corporate website
- Shared layouts and design system
- Division architecture
- Admin authentication and navigation
- Backend API and database foundation

### Operations

- Customer and contact management
- Scheduling and work orders
- Quotes and estimates
- Service requests
- Expense and document management

### ERP Expansion

- Employee management
- Asset, fleet, and equipment tracking
- Inventory and maintenance records
- Invoicing and payments
- Analytics and financial reporting

### Portals and Automation

- Customer portal
- Employee portal
- Mobile and desktop applications
- External API integrations
- Automated administrative workflows

## License

This project is proprietary software owned by Pioneer Enterprises. All rights are reserved unless permission is granted in writing.
