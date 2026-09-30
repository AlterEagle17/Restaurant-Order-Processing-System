# Full-Stack Audit

Audit date: 2026-09-29

## Current status

The detailed findings below are a historical snapshot from 2026-09-27. Its statements that the frontend is mock-only and the backend lacks JWT/order snapshots are stale and superseded by the current implementation. The current verified state is summarized here.

### Integration matrix

| Frontend feature | API endpoint(s) | Controller → service → persistence | Database data |
| --- | --- | --- | --- |
| Login and session | `POST /api/auth/login`, `GET /api/auth/me` | `AuthController` → `AuthService` → `UserRepository` | `users` |
| Admin accounts | `/api/admin/users` and account update/status/role/password routes | `AdminUserController` → `AdminUserService` → `UserRepository` | `users` |
| Admin menu | `/api/admin/menu/categories`, `/api/admin/menu/items`; `/api/menu` catalog mutations | `AdminMenuController`/`MenuController` → `MenuService` → `MenuCategoryRepository`, `MenuItemRepository` | `menu_categories`, `menu_items` |
| Customer menu and orders | `GET /api/menu/*`, `POST /api/orders`, `GET /api/orders/my-orders` | `MenuController`/`OrderController` → `MenuService`/`OrderService` → menu, user, and order repositories | menu tables, `users`, `orders`, `order_items` |
| Kitchen and waiter workflow | `/api/kitchen/orders/*`, `/api/waiter/orders/*` | `KitchenController`/`WaiterController` → `OrderService` → `OrderRepository` | `orders` |
| Cashier payments | `/api/cashier/orders/pending`, `/api/cashier/orders/{id}/payments`, `/api/cashier/payments` | `CashierController` → `OrderService`/`PaymentService` → `OrderRepository`, `PaymentRepository`, `UserRepository` | `orders`, `payments`, `users` |
| Manager reports | `/api/manager/dashboard`, `/api/manager/revenue`, `/api/manager/orders` | `ManagerController` → `ManagerService`/`OrderService` → `PaymentRepository`/`OrderRepository` | `payments`, `orders` |

The frontend service methods, HTTP verbs, request payloads, and response DTOs were checked against these controllers and the API contract. API mode attaches a bearer JWT and clears the session on `401`; role access is enforced by Spring Security. Payment recording is simulated, not a payment-gateway integration.

### Current confirmed findings

- **MEDIUM, fixed:** inactive categories could be bypassed by reactivating a child item after category deactivation. Menu reads, item activation, and order creation now all require the category to be active; an integration regression test covers this invariant.
- **LOW, mitigated in UI:** the cashier metric previously called its latest-25 payment-history aggregation “Paid today.” It now accurately says “Recent payments” and identifies the latest 25 records. The existing API does not expose a date-filtered cashier summary.
- **LOW, fixed:** production API requests previously fell through to a same-origin URL when `VITE_API_BASE_URL` was missing. API requests now reject with a configuration-specific error.
- **LOW, fixed:** the committed backend POM started with whitespace before its XML declaration and Maven rejected it. The declaration is now the first document content.
- **LOW, fixed:** Render guidance used native Maven commands despite the backend Dockerfile; it now specifies Docker runtime and backend-root-relative Dockerfile/context settings. Backend environment documentation now matches the optional `.env` property import, and safe placeholder environment examples are available.
- **LOW, fixed:** root/API docs described the old mock-only frontend and contradicted current API mode. They now describe the current architecture; this file labels its older detailed issue list as a historical snapshot.
- **LOW, remaining:** admin API dashboards fetch only page 0 of up to 100 users/menu items and have no pagination controls. Large catalogs/accounts may not be fully visible or searchable in the UI.

### Verification on 2026-09-29

- Backend `cd backend; .\\mvnw.cmd clean verify`: **BUILD SUCCESS**, 6 tests passed, 0 failures/errors. H2 applied Flyway v1 and v2 and Hibernate schema validation succeeded. A packaged JAR was produced.
- Frontend `cd frontend; npm run lint`: passed.
- Frontend `cd frontend; npm test`: 3 test files, 9 tests passed.
- Frontend `cd frontend; npm run build`: TypeScript and Vite production build passed.
- Environment hygiene: backend and frontend `.gitignore` patterns exclude `.env` and variant files while allowing `.env.example` templates. No real `.env` file is committed.
- Vercel rewrite routes application paths to `index.html`. Render settings are documented in `backend/README.md` and require Runtime Docker, Root Directory `backend`, Dockerfile Path `Dockerfile`, Docker Context `.`, and the Dockerfile default command.
- Production defaults: `application-prod.properties` targets the supplied Supabase shared pooler on port 5432 with database `postgres`, its project-scoped username, and SSL `require`; the password and JWT secret remain mandatory external secrets. The backend `.env.example` contains placeholder secrets only. The production profile has no localhost database fallback.

### Not verified

No live Render deployment, Vercel deployment, Supabase connection, PostgreSQL Flyway migration, or deployed health-check/authentication smoke test was run. H2 tests do not prove PostgreSQL/Supabase compatibility. These checks require active service settings and a rotated database credential; the database password shared in conversation should be rotated before use. Do not use production data for destructive tests.

## Historical snapshot (2026-09-27)

This audit covers the current React/Vite frontend, Spring Boot backend, API contract, migrations, tests, and deployment configuration. Existing visual styling and the current folder layout are intentionally retained.

## Critical

| Finding | Severity | Affected files | Proposed fix |
| --- | --- | --- | --- |
| Frontend production authentication and dashboards are not connected to the backend. `AuthContext` authenticates only via mock demo credentials in development; `api.ts` has no token interceptor or calling services; every dashboard still reads local constants/React state. | Critical | `frontend/src/contexts/AuthContext.tsx`, `frontend/src/services/authService.ts`, `frontend/src/services/api.ts`, `frontend/src/App.tsx` | Add explicit `VITE_USE_DEMO_AUTH` mode that can only activate in development, backend login/current-user auth for API mode, token attachment and expiry handling, then connect each dashboard through typed API services. Preserve the existing UI; mock mode remains local-only. |
| Production login currently cannot succeed from the frontend because the submit handler calls mock login, which returns null outside DEV. | Critical | `frontend/src/App.tsx`, `frontend/src/contexts/AuthContext.tsx` | Route the login form to backend mode outside explicitly enabled development demo mode; never forward demo credentials to the backend. |

## High

| Finding | Severity | Affected files | Proposed fix |
| --- | --- | --- | --- |
| Backend order-line responses get the item name from the live menu row, while only the unit price is snapshotted. Renaming a menu item changes historical receipts. | High | `backend/src/main/java/com/restaurant/backend/order/OrderLine.java`, `OrderItemResponse.java`, `OrderService.java`, `backend/src/main/resources/db/migration/V1__create_restaurant_schema.sql` | Add immutable `item_name` order-line snapshot in a new forward-only V2 migration, populate it at order creation, and return it from the mapper. Do not edit V1. |
| Manager revenue and order counts use order creation time and a `PAID` order flag, not successful payment timestamps. A late payment is counted on the wrong day, and refunds are not represented in revenue. | High | `backend/src/main/java/com/restaurant/backend/order/OrderRepository.java`, `manager/ManagerService.java`, `payment/PaymentRecord.java` | Aggregate successful payment records by `payments.created_at` and status; define refund handling, and test a payment created on a different date from its order. |
| Admin account UI has a delete action, but the API intentionally has no deletion endpoint and records may reference users. | High | `frontend/src/App.tsx`, `backend/src/main/java/com/restaurant/backend/user/AdminUserController.java` | In real API mode use deactivate as the reversible removal operation; retain mock delete only in demo mode. Do not add hard delete without an archival/retention policy. |
| Admin APIs permit deactivating or demoting the authenticated administrator, including the sole active admin. That can permanently lock out administration. | High | `backend/src/main/java/com/restaurant/backend/user/AdminUserService.java`, `AdminUserController.java` | Prevent self-demotion/deactivation and prevent changes that leave no active ADMIN; pass the actor identity into the service and add safeguards tests. |
| V1 schema does not enforce all entity/business invariants at the database boundary (for example a menu item can reference an inactive category, and payment status/order status consistency is application-only). | High | `backend/src/main/resources/db/migration/V1__create_restaurant_schema.sql`, future migrations, `MenuService`, `PaymentService` | Keep V1 unchanged; add safe forward migrations only for new columns/indexes/checks that can be applied without destructive data changes. Preserve transaction-level validation. |

## Medium

| Finding | Severity | Affected files | Proposed fix |
| --- | --- | --- | --- |
| Sidebar items currently share a single `#workspace-content` link and only the first item appears active. Admin screen tabs are separate local state, so sidebar navigation labels do not switch views. | Medium | `frontend/src/App.tsx` (`WorkspaceLayout`, `AdminDashboard`) | Give each current view real route or selected-section navigation while retaining the same presentation and sidebar. |
| Cashier local demo logic treats every non-`PAID` order as pending, while the backend requires `SERVED` and transitions successful payment to `COMPLETED` plus `paymentStatus=PAID`. | Medium | `frontend/src/App.tsx` (`CashierDashboard`), backend cashier/payment DTOs | Map backend `status` and `paymentStatus` separately; show only served/unpaid orders, and refresh payment/order lists after success. Keep demo behavior isolated. |
| Waiter mock filters include RECEIVED and PREPARING but backend waiter queues only READY and SERVED; kitchen and waiter cards need mapping between backend timestamps and the current display-time string. | Medium | `frontend/src/App.tsx` (`WaiterDashboard`, `KitchenDashboard`), `backend/API_CONTRACT.md` | Use the backend-supported filters and add a DTO-to-view-model mapper; preserve the current cards and columns. |
| Customer and admin menu markup is based on a six-item local constant; admin category/item edits are local state only. The UI's menu item fields differ from backend UUID/categoryId/price DTOs. | Medium | `frontend/src/App.tsx` (`CustomerDashboard`, `AdminDashboard`), `backend/src/main/java/com/restaurant/backend/menu/**` | Load active catalog APIs, create/edit/enable through ADMIN APIs, and map API records to existing card/table props. |
| Customer order creation currently sends only to local state and the UI total is local. The backend correctly recalculates prices, but the frontend must display the returned server total and retain its cart on failed submission. | Medium | `frontend/src/App.tsx` (`CustomerDashboard`), `backend/src/main/java/com/restaurant/backend/order/**` | Post only table number and menu item IDs/quantities, use the returned order as truth, and clear the cart only after a successful response. |
| Manager period selection changes displayed hardcoded numbers, while the chart bars and recent orders are also fixtures. | Medium | `frontend/src/App.tsx` (`ManagerDashboard`) | Query dashboard/revenue/order endpoints from selected dates and draw chart points from API data; provide loading, empty, and error states in the existing panels. |
| Current UI offers local account creation/deletion and menu add/remove but no loading/error states for real operations. | Medium | `frontend/src/App.tsx` | Add operation-specific pending/error state in API mode, validate forms, confirm destructive actions, and refresh data after mutations. |

## Low / Deployment

| Finding | Severity | Affected files | Proposed fix |
| --- | --- | --- | --- |
| Local profile defaults `DB_NAME` to `restaurant`, while Supabase commonly uses `postgres`; the production DB profile requires environment values but has no example Vercel origin. | Low | `backend/src/main/resources/application*.properties`, `.env.example`, `backend/README.md` | Document the Supabase values accurately, use `DB_NAME=postgres` in the hosted example, set exact Vercel frontend origin in Render CORS vars, and keep secrets out of source. |
| Render deployment instructions exist only in Markdown; no automated deploy workflow or PostgreSQL smoke test is present. | Low | `backend/README.md`, tests | Keep manual deployment (no auto deploy requested); add PostgreSQL profile verification when a safe test database is available. Do not claim deployment until actually verified. |
| Tests cover H2/Flyway integration and key API flows, but not live PostgreSQL, concurrent payment race behavior, admin self-lockout, historical name snapshots, or browser-level frontend API flows. | Low | `backend/src/test/**`, frontend package/scripts | Extend focused tests as behavior changes; run PostgreSQL integration only when a database is available. Add frontend tests if a test runner is introduced rather than claiming browser automation as a unit suite. |

## Existing Strengths

- Frontend layout, colors, responsive shell, role dashboards, and local demo quick-fill UI are already implemented and should be preserved.
- Backend has database-backed users, BCrypt, signed JWT auth, role-based method authorization, active-user checks, request validation, and generic credential errors.
- Order creation uses database menu prices; kitchen/waiter transitions are constrained; payment processing uses a row lock plus a unique order/payment relation.
- V1 is versioned and Flyway-backed; `ddl-auto=validate` avoids automatic production schema reset/create.
- Vercel SPA rewrite and Render commands are documented; `.env`/`.env.local` are ignored.

## Verification Snapshot

The previous backend validation ran `clean test` and `clean package` successfully with 5 tests passing on H2. These tests apply Flyway V1 and Hibernate schema validation but do not establish a live PostgreSQL/Supabase connection. The frontend lint/build passed before this audit. No deployment or push was performed.