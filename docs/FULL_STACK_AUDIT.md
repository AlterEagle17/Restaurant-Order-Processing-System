# Full-Stack Audit

Audit date: 2026-09-27

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