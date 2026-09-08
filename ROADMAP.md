# Pioneer Legacy Works Product Roadmap

This roadmap turns the platform vision into ordered, testable delivery milestones. It prioritizes a reliable operational core for Pioneer Pressure Washing & Landscaping before expanding the ERP, customer portal, and additional divisions.

## Status legend

- **Complete** — implemented and validated
- **In progress** — implementation exists locally or is actively being validated
- **Next** — the next committed development milestone
- **Later** — sequenced after the operational core

## Current position

As of July 2026, the repository contains:

- A React public website, landscaping division site, and administration interface
- An Express, TypeScript, Prisma, and PostgreSQL backend foundation
- Customer registration, login, JWT authentication, and current-user lookup
- Transactional quote and service-request intake
- Frontend integrations for public quote and service-request submissions
- A versioned initial database migration and PostgreSQL-backed integration-test harness
- Render backend deployment configuration and GitHub Actions backend CI

The public intake path is close to its first deployable state. Most administration screens still use frontend-only data and need authenticated APIs.

---

## Milestone 0 — Reliable backend foundation

**Status: In progress**

### Scope

- [x] Define the initial Prisma data model
- [x] Add transactional customer and property resolution
- [x] Add public quote and service-request endpoints
- [x] Connect the public landscaping forms to the API
- [x] Create the initial versioned database migration
- [x] Add PostgreSQL-backed integration tests
- [x] Add backend CI with migration, build, and test stages
- [x] Run the integration suite successfully in GitHub Actions
- [ ] Provision development and production PostgreSQL databases
- [ ] Deploy the API and verify `/health` in production
- [ ] Configure the production frontend API URL and allowed origin
- [x] Add structured request logging and request IDs
- [x] Add rate limiting and baseline HTTP security headers

### Exit criteria

- A clean database can be created entirely from checked-in migrations.
- CI blocks changes that fail backend compilation, migration, or integration tests.
- Public quote and service requests are persisted in production.
- Errors are traceable without exposing secrets or personal information.

---

## Milestone 1 — Admin intake operations

**Status: Complete**

This milestone makes submitted leads usable by the landscaping team.

### API scope

- [x] Add authenticated, role-protected admin routing
- [x] List and view customers with search, filtering, and pagination
- [x] List and view quote requests
- [x] List and view service requests
- [x] Update quote and service-request statuses
- [x] Add internal notes and assignment fields
- [x] Record all administrative changes in `AuditEvent`
- [x] Add consistent pagination, sorting, error, and response formats

### Frontend scope

- [x] Replace mock customer data with API data
- [x] Replace mock estimate/quote data with API data
- [x] Add a service-request inbox to the admin interface
- [x] Add loading, empty, failure, and retry states
- [x] Make filters and detail panels URL-addressable

### Test scope

- [x] Authorization tests for admin, employee, customer, and anonymous users
- [x] CRUD and status-transition integration tests
- [x] Pagination and filtering tests
- [x] Audit-event tests

### Exit criteria

- An authorized team member can find, review, update, and track every public submission.
- Unauthorized users cannot access administrative data.
- Status changes and internal actions are auditable.

---

## Milestone 2 — Quotes, estimates, and job conversion

**Status: Complete**

### Scope

- [x] Create and edit quote line items
- [x] Calculate subtotal, discount, tax, and total on the server
- [x] Add quote expiration and approval workflows
- [x] Generate customer-facing quote documents
- [x] Convert approved quotes or service requests into jobs
- [x] Generate collision-resistant human-readable job numbers
- [x] Track job priority, notes, value, and lifecycle status
- [x] Add quote and job history to customer records

### Exit criteria

- Staff can move a lead from intake through an approved estimate into a scheduled job without re-entering customer or property data.
- Monetary calculations are server-owned and covered by tests.

---

## Milestone 3 — Scheduling and field operations

**Status: Later**

### Scope

- [ ] Add schedule-event and crew-assignment models
- [ ] Add calendar APIs by day, week, employee, and division
- [ ] Detect scheduling conflicts
- [ ] Track scheduled start/end times and job progress
- [ ] Add field notes, completion notes, and project photos
- [ ] Add secure object storage for attachments
- [ ] Add job cancellation and rescheduling workflows

### Exit criteria

- Office staff can schedule work without conflicts.
- Field staff can see assignments and update job progress.
- Project files are private, durable, and associated with the correct records.

---

## Milestone 4 — Customer accounts and communication

**Status: Later**

### Scope

- [ ] Implement email verification
- [ ] Implement secure password-reset tokens and email delivery
- [ ] Add refresh-token or secure session renewal strategy
- [ ] Add customer profile and property management
- [ ] Let customers view requests, quotes, and jobs
- [ ] Add quote approval/decline actions
- [ ] Add notification preferences
- [ ] Deliver transactional email notifications
- [ ] Add SMS only after consent and provider requirements are defined

### Exit criteria

- Customers can securely manage their accounts and follow work from request through completion.
- Authentication and recovery flows are tested and production-safe.

---

## Milestone 5 — Expenses, invoicing, and payments

**Status: Later**

### Scope

- [ ] Persist expense management currently represented in the admin UI
- [ ] Add vendors, categories, receipts, and approval states
- [ ] Add invoices derived from completed jobs
- [ ] Add payment-provider integration
- [ ] Store payment references without storing card data
- [ ] Add refunds, adjustments, and payment reconciliation
- [ ] Add revenue, expense, and margin reporting

### Exit criteria

- Pioneer can trace operational revenue and expenses to customers and jobs.
- Payment processing stays within the selected provider's hosted security boundary.

---

## Milestone 6 — Employees, assets, and automation

**Status: Later**

### Scope

- [ ] Add employee profiles, division membership, and granular permissions
- [ ] Add assets, vehicles, equipment, and maintenance records
- [ ] Add inventory and consumable tracking where operationally useful
- [ ] Add recurring-service schedules
- [ ] Add automated reminders and overdue-work queues
- [ ] Add dashboards backed by server-calculated metrics
- [ ] Add export, retention, and backup procedures

### Exit criteria

- The platform supports daily operational planning beyond customer intake and job tracking.
- Automations are observable, retryable, and safe to run more than once.

---

## Milestone 7 — Additional Pioneer divisions

**Status: Later**

### Scope

- [ ] Add division ownership to shared operational records
- [ ] Define Transport-specific services, workflows, and reporting
- [ ] Define Productions-specific services, workflows, and reporting
- [ ] Add division-scoped permissions, branding, settings, and metrics
- [ ] Reuse shared customer, contact, authentication, and financial systems

### Exit criteria

- Transport and Productions can operate independently without duplicating the platform core.
- Users only see divisions and records permitted by their roles.

---

## Cross-cutting engineering standards

Every milestone should include:

- Database migrations for every schema change
- Authorization at the API boundary
- Zod validation for external input
- Integration tests for successful and rejected operations
- Audit events for sensitive administrative changes
- Accessible loading, error, empty, and success states
- No secrets or personal data in logs
- Backward-compatible deployment steps or an explicit migration plan
- Updated API and operator documentation

## Immediate execution order

1. Restore the Render workspace and billing access.
2. Provision development and production PostgreSQL databases.
3. Deploy the API, apply checked-in migrations, and verify `/health` and `/ready`.
4. Configure the production frontend API URL and allowed origin.
5. Confirm the Phase 2 PostgreSQL integration suite in Backend CI.
6. Begin schedule events, crew assignment, and conflict detection.

## Deliberately deferred decisions

These choices should be made when their milestone begins, based on real operational requirements:

- Email and SMS providers
- Object-storage provider
- Payment processor
- Fine-grained employee permission model
- Accounting integrations
- Transport and Productions domain models

Deferring these decisions avoids locking the platform into vendors or data structures before Pioneer has defined the corresponding workflows.
