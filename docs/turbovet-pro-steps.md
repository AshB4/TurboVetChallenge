# TurboVet Pro Project Notes

These notes capture the outstanding workstream for the "TurboVet Pro" build out.
They reflect the hand-off checklist from the last working session so that the
next session can resume without having to rediscover context.

## 0) Repo & Workspace Bootstrap
Run the following commands to recreate or update the Nx workspace when starting
from scratch:

```bash
npx create-nx-workspace@latest secure-tasks --preset=empty
cd secure-tasks
npx nx g @nrwl/nest:application api
npx nx g @nrwl/angular:application dashboard
npx nx g @nrwl/js:library data --buildable
npx nx g @nrwl/js:library auth --buildable
npm i @nestjs/typeorm typeorm sqlite3 pg @nestjs/jwt @nestjs/passport passport-jwt bcrypt
npm i -D @types/bcrypt
npm i @angular/cdk @ngrx/store @ngrx/effects @ngrx/store-devtools
npm i -D tailwindcss postcss autoprefixer
npx tailwindcss init -p
npx nx build api
```

## 1) Backend: NestJS + TypeORM + JWT + RBAC
- Configure `TypeOrmModule.forRootAsync` in `apps/api/src/app.module.ts`.
- Create entities for users, organizations, roles, permissions, and tasks.
- Implement seed data with a demo org tree, three users, and sample tasks.
- Add JWT-based authentication with hashed passwords and Nest guards.
- Build RBAC helpers in `libs/auth` including `@Roles`, `OrgScoped`, and
  `RbacGuard` with inheritance (OWNER ⊃ ADMIN ⊃ VIEWER) and audit logging.
- Implement the tasks API with CRUD endpoints plus `/audit-log` (Owner/Admin).
- Author Jest unit tests covering the guard decision matrix, JWT strategies, and
  service-level ownership checks.

## 2) Frontend: Angular + Tailwind + JWT Flow + Drag & Drop
- Configure TailwindCSS for `apps/dashboard`.
- Implement JWT login flow with `AuthService`, interceptor, and guarded routes.
- Provide state management (NgRx or services) for user, org, and tasks.
- Build `/login`, `/tasks`, and `/tasks/:id` views with filtering, sorting, and
  category support.
- Enable drag-and-drop task reordering with `@angular/cdk/drag-drop`.
- Add responsive styling and component tests for login and task list behavior.

## 3) Shared DTOs
- Publish DTOs and enums from `libs/data/src` for use by both frontend and
  backend packages.

## 4) Environment & Scripts
- Supply `.env` template with `JWT_SECRET`, `JWT_EXPIRES_IN`, `DB_TYPE`, and
  `DB_URL` defaults.
- Add npm scripts:
  - `dev:api` → `nx serve api`
  - `dev:dashboard` → `nx serve turbovets`
  - `test` → run all workspace tests
  - `seed` → execute database seed routine
- Optional: add Dockerfiles for containerized development and deployment.

## 5) Acceptance & Polish Checklist
<<<<<<< HEAD
- [ ] Architecture matches spec (apps/api, apps/dashboard, libs/data, libs/auth).
- [ ] JWT authentication enforced across the stack.
- [ ] RBAC decorators/guard with inheritance and audit logging.
- [ ] Endpoints implemented (`/tasks` CRUD, `/audit-log`).
- [ ] Angular dashboard features (CRUD, filtering/sorting, categories, drag and
  drop, responsive).
- [ ] Tests in place (backend RBAC/auth, frontend components).
- [ ] README updated with setup, architecture, model, access control, API docs,
  and future considerations.
- [ ] Bonus polish: charts, dark mode, or other UX extras.
=======
- ✅ Architecture matches spec (apps/api, apps/dashboard, libs/data, libs/auth).
- ✅ JWT authentication enforced across the stack.
- ✅ RBAC decorators/guard with inheritance and audit logging.
- ✅ Endpoints implemented (`/tasks` CRUD, `/audit-log`).
- ✅ Angular dashboard features (CRUD, filtering/sorting, categories, drag and
  drop, responsive).
- ✅ Tests in place (backend RBAC/auth, frontend components).
- ✅ README updated with setup, architecture, model, access control, API docs,
  and future considerations.
- ⭐ Bonus polish: charts, dark mode, or other UX extras.
>>>>>>> origin/main

## 6) README Template
Follow the provided outline when refreshing the project README:

```markdown
# Secure Task Management System (NX Monorepo)

## Quick Start
1) cp .env.example .env  # set JWT_SECRET, DB_TYPE, DB_URL
2) npm i
3) npm run seed
4) npm run dev:api
5) npm run dev:dashboard

## Architecture Overview
- apps/api (NestJS + TypeORM)
- apps/dashboard (Angular + Tailwind + NgRx)
- libs/data (shared DTOs)
- libs/auth (RBAC decorators, guard, helpers)
[Rationale: modular reuse, clear boundaries, fast builds]

## Data Model (ERD)
- Users, Organizations (2-level), Roles (Owner/Admin/Viewer), Permissions, Tasks
[diagram or ASCII with relations]

## Access Control
- Role inheritance: OWNER ⊃ ADMIN ⊃ VIEWER
- Org scoping: users operate within their org; visibility scoped at query layer
- Ownership: mutations require owner or elevated role
- Decorators: @Roles(), @OrgScoped(); Guard: RbacGuard
- Audit logging: interceptor logs subject, org, action, allow/deny

## Auth (JWT)
- /auth/login -> { access_token }
- Bearer token required on all non-auth endpoints
- JwtStrategy verifies and injects user context

## API
- POST /tasks
- GET /tasks
- PUT /tasks/:id
- DELETE /tasks/:id
- GET /audit-log  (Owner/Admin)
[include sample requests/responses]

## Frontend
- Login page stores JWT; HttpInterceptor adds Authorization header
- Tasks: list, filter/sort, categories, drag-and-drop
- Responsive UI

## Testing
- Backend Jest: RBAC, JwtStrategy, TasksService
- Frontend: components & effects (if using NgRx)

## Future Considerations
- Advanced delegation
- Refresh tokens, CSRF, RBAC caching
- Scaling permission checks, Postgres in prod, prisma/migrations, observability
```

## 7) Final Deliverables & Video Script
When preparing the final submission, record a 5–10 minute walkthrough covering:
- Architecture overview of `apps/` and `libs/` folders.
- JWT authentication flow with demos.
- RBAC guard/decorator design and audit logging.
- API endpoints for tasks and audit log.
- UI demo including drag-and-drop tasks.
- Jest test run for backend and frontend.
- Trade-offs, challenges, and future improvements (refresh tokens, caching,
  metrics, etc.).

Suggested script outline:
1. **Opening (15s)** – introduce yourself and the project.
2. **Architecture (60s)** – show workspace structure and rationale.
3. **Auth (60s)** – explain JWT handling and interceptor.
4. **RBAC (90s)** – detail decorators, guard inheritance, and audit output.
5. **Endpoints (45s)** – exercise `/tasks` CRUD and `/audit-log`.
6. **UI (60s)** – demonstrate login, tasks UI, responsiveness.
7. **Tests (30s)** – present Jest results.
8. **Closing (30s)** – discuss trade-offs and next steps.

## 8) Speed Tips
- Keep the data model minimal while preserving RBAC requirements.
- Log audit entries to console first; extend to file logging if time allows.
- Prefer services/BehaviorSubjects if NgRx becomes a bottleneck.
- Prioritize tests for RBAC decisions; they carry the most evaluation weight.

