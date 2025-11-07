# Secure Task Management System – TurboVets Full Stack Challenge

## Project Overview

Secure Task Management System is a role-based task orchestration platform designed for multi-organization teams. The application combines strict JWT-authenticated session handling with fine-grained RBAC to ensure only authorized users can create, view, update, and audit tasks across veterinary practices.

## Tech Stack

| Layer            | Technology                       |
| ---------------- | -------------------------------- |
| Backend          | NestJS, TypeORM, PostgreSQL, JWT |
| Frontend         | Angular, TailwindCSS             |
| Workspace        | Nx Monorepo                      |
| Shared Libraries | `libs/data`, `libs/auth`         |

## Architecture Overview

The workspace uses Nx to co-locate backend and frontend apps with shared TypeScript libraries for consistent typing and security logic.

```
apps/
  api/          NestJS REST API (JWT auth, RBAC guards)
  dashboard/    Angular dashboard (task board, audit views)
libs/
  auth/         Guards, decorators, RBAC helpers, JWT utilities
  data/         DTOs, enums, role hierarchy helpers
```

- `apps/api`: Exposes REST endpoints, connects to PostgreSQL via TypeORM, enforces authorization through shared guards.
- `apps/dashboard`: Angular client served via Nx, consumes the API with interceptors that attach JWT tokens and renders RBAC-aware UI states.
- `libs/data`: Houses DTO definitions, role constants, and shared validation logic to avoid drift between services.
- `libs/auth`: Centralizes RBAC guard/decorator definitions, ensuring consistent permission checks across controllers.

## Setup & Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/your-org/turbovets-task-manager.git
   cd turbovets-task-manager
   ```
2. **Install workspace dependencies**
   ```bash
   npm install
   ```
3. **Configure environment variables**
   Create `apps/api/.env` (or use environment management) with:
   ```env
   DATABASE_URL=postgresql://<user>:<password>@localhost:5432/turbovets
   JWT_SECRET=<generate-a-strong-secret>
   ```
4. **Run database migrations / seed (optional)**
   ```bash
   nx run api:migrate
   nx run api:seed
   ```
5. **Start backend API**
   ```bash
   nx serve api
   ```
6. **Start frontend dashboard**
   ```bash
   nx serve dashboard
   ```
7. Access the dashboard at `http://localhost:4200` (API served at `http://localhost:3000/api`).

## Data Model Explanation

Primary entities tracked by the system:

```
[Organization] 1---* [User]
      |                \
      |                 *---* [Role]
      |                        \
      |                         *---* [Permission]
      |
      *---* [Task]
```

- **Users**: Authenticated operators scoped to one or more organizations, owning JWT credentials and role assignments.
- **Organizations**: Hierarchical units (clinic, region, etc.) defining the boundary for data access.
- **Roles**: Predefined role hierarchy (Owner, Admin, Viewer) determining permission inheritance.
- **Permissions**: Discrete capabilities (e.g., `task.read`, `task.write`, `audit.read`) assigned to roles.
- **Tasks**: Actionable work items with status, category, assignee, and timestamps; always associated with an organization.

## Access Control Implementation

The RBAC system emphasizes defense-in-depth:

- **Role hierarchy**: `Owner` ⟶ `Admin` ⟶ `Viewer`. Higher roles inherit lower-role permissions, implemented in `libs/data` via helper utilities consumed by guards.
- **Organization scoping**: Guards validate that the requesting user’s roles apply within the target organization context before granting access.
- **Guards & decorators**: Custom `@Roles()` decorator declares required permissions. `JwtAuthGuard` validates and decodes tokens, while `RbacGuard` confirms role satisfaction and logs decisions through shared services in `libs/auth`.
- **JWT authentication**: Signed with `JWT_SECRET`, tokens embed user, organization, and role claims. Expired/invalid tokens result in immediate authorization failure.

## API Documentation

Key API resources are exposed under `/api`.

### `POST /login`

```http
POST /api/login
Content-Type: application/json

{
  "email": "owner@turbovets.test",
  "password": "P@ssw0rd!"
}
```

Response:

```json
{
  "accessToken": "<jwt>",
  "user": {
    "id": "uuid",
    "roles": ["Owner"],
    "organizationId": "org-123"
  }
}
```

### `GET /tasks`

```http
GET /api/tasks
Authorization: Bearer <jwt>
```

Response:

```json
[
  {
    "id": "task-1",
    "title": "Surgery prep",
    "status": "In Progress",
    "organizationId": "org-123"
  }
]
```

### `POST /tasks`

```http
POST /api/tasks
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "title": "Follow-up call",
  "description": "Call pet owner for recovery update",
  "status": "Todo"
}
```

Response:

```json
{
  "id": "task-42",
  "title": "Follow-up call",
  "status": "Todo",
  "organizationId": "org-123"
}
```

### `PUT /tasks/:id`

```http
PUT /api/tasks/task-42
Authorization: Bearer <jwt>
Content-Type: application/json

{
  "status": "In Progress"
}
```

Response:

```json
{
  "id": "task-42",
  "status": "In Progress"
}
```

### `DELETE /tasks/:id`

```http
DELETE /api/tasks/task-42
Authorization: Bearer <jwt>
```

Response:

```json
{
  "success": true
}
```

### `GET /audit-log`

```http
GET /api/audit-log
Authorization: Bearer <jwt>
```

Response:

```json
[
  {
    "id": "audit-1",
    "actorId": "user-1",
    "action": "task.update",
    "status": "ALLOWED",
    "timestamp": "2024-05-01T12:00:00Z"
  }
]
```

## Testing Strategy

- **Backend (NestJS)**: Jest unit and integration suites validate RBAC inheritance, guard behavior, JWT verification, and controller endpoints using in-memory PostgreSQL or mocks.
- **Frontend (Angular)**: Component and state management tests cover auth flows, task board interactions, and permission-driven UI branching. Nx generators enforce consistent testing conventions across libs and apps.

## UI Features

- Task board with sorting, filtering, and drag-and-drop powered by Angular CDK.
- Responsive TailwindCSS layout with breakpoint-aware panels and optional dark mode toggle.
- Role-aware UI controls that disable or hide actions beyond the user’s permission level.
- Inline audit insights and status badges for rapid triage.

## Future Enhancements

- Refresh tokens with rotation and revocation lists.
- CSRF protection for cookie-based sessions or hybrid auth flows.
- Distributed caching layer (Redis) for permission lookups and rate limiting.
- Managed PostgreSQL / cloud database with read replicas for scale.
- Containerization with Docker + CI/CD deployment templates.

## Credits / Author Note

Developed by Ashley Broussard for the TurboVet full-stack challenge, focusing on secure RBAC, scalable architecture, and real-world debugging in an Nx monorepo.
