# Pioneer Legacy Works API

Express, TypeScript, Prisma, and PostgreSQL backend for the Pioneer Legacy Works website, division apps, customer portal, and admin panel.

## Local setup

1. Copy `server/.env.example` to `server/.env`.
2. Set `DATABASE_URL`, `JWT_SECRET`, and `CLIENT_ORIGIN`.
3. From the repository root, run:

```bash
npm run api:install
npm run api:generate
npm run api:migrate
npm run api:dev
```

The API defaults to `http://localhost:4000`.

## First administrator bootstrap

The admin login screen can create the first administrator account when no `ADMIN`
user exists. This path is intentionally separate from normal customer registration;
`POST /api/auth/register` always creates a customer-role account.

In development and test environments, first-admin bootstrap is enabled by default.
It can be explicitly controlled with:

```env
ENABLE_ADMIN_BOOTSTRAP=true
```

Production keeps bootstrap disabled by default. To use it temporarily in production,
set both values below, restart the API, create the administrator from the admin login
screen, then disable or remove the bootstrap settings:

```env
ENABLE_ADMIN_BOOTSTRAP=true
ADMIN_BOOTSTRAP_SECRET=replace-with-a-temporary-secret-at-least-16-characters
```

The production login screen asks for that secret and sends it only in the bootstrap
request header. The API automatically refuses additional bootstrap requests as soon
as an administrator exists, even if the enable flag has not yet been removed.

## Database migrations and tests

Apply the checked-in migrations before starting the API:

```bash
npm run prisma:deploy
```

The integration suite requires a disposable PostgreSQL database. Set
`DATABASE_URL` to that database, apply the migrations, and run:

```bash
npm test
```

The backend CI workflow provisions PostgreSQL and performs these steps automatically.

## Current endpoints

- `GET /health`
- `GET /ready` (includes database connectivity)
- `GET /api/auth/bootstrap-admin/status`
- `POST /api/auth/bootstrap-admin`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `POST /api/auth/forgot-password`
- `POST /api/public/quotes`
- `POST /api/public/service-requests`
- `GET /api/admin/assignees`
- `GET /api/admin/customers`
- `GET /api/admin/customers/:id`
- `GET /api/admin/quotes`
- `GET /api/admin/quotes/:id`
- `PATCH /api/admin/quotes/:id`
- `PUT /api/admin/quotes/:id/details`
- `POST /api/admin/quotes/:id/convert-to-job`
- `GET /api/admin/quotes/:id/document`
- `GET /api/admin/service-requests`
- `GET /api/admin/service-requests/:id`
- `PATCH /api/admin/service-requests/:id`
- `POST /api/admin/service-requests/:id/convert-to-job`
- `GET /api/admin/jobs`
- `GET /api/admin/jobs/:id`
- `PATCH /api/admin/jobs/:id`
- `GET /api/admin/form-files`
- `POST /api/admin/form-files`
- `GET /api/admin/form-files/:id/download`
- `DELETE /api/admin/form-files/:id`

All `/api/admin` routes require a valid `ADMIN` or `EMPLOYEE` bearer token.
List endpoints support search, status filters, sorting, and page-based pagination.
Quote, service-request, and job workflow changes create audit events. Quote
subtotal, discount, tax, and total values are calculated by the API from
validated line-item input.

## Frontend configuration

Set the frontend environment variable:

```env
VITE_API_BASE_URL=http://localhost:4000
```

The shared frontend API client is located at `src/services/api`.

## Deployment

The backend is isolated under `server/`, so it can be deployed independently from the Vite frontend. Before production deployment:

- provision PostgreSQL;
- set all environment variables;
- run `npm run prisma:deploy` during deployment;
- replace the local frontend API URL with the deployed backend URL;
- restrict `CLIENT_ORIGIN` to the production website origin;
- use a long randomly generated `JWT_SECRET`.

The API emits JSON request logs with an `X-Request-Id` correlation value. Baseline
security headers and separate API, authentication, and public-submission rate
limits are enabled by default. Render uses `/ready` so a deployment is considered
healthy only when PostgreSQL is reachable.
