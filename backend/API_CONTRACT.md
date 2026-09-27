# API Contract and Frontend Compatibility

## What the current frontend uses

The frontend has a reusable Axios instance in `frontend/src/services/api.ts` configured with `VITE_API_BASE_URL`, but no frontend module imports or calls it. `frontend/src/services/authService.ts` authenticates against `frontend/src/config/demoUsers.ts` only in Vite development mode. `AuthContext` stores a mock profile in `sessionStorage`; it does not receive or attach a JWT. The six dashboard routes and their menu, order, payment, and revenue data are local React state/constants in `frontend/src/App.tsx`.

Consequently, no live backend request or response DTO is currently defined by the frontend. The API schemas below are the backend integration contract proposed for the first frontend API adapter; they are not structures currently consumed by the UI. Frontend mock authentication remains separate and must not be used as backend credentials.

## Conventions

- JSON uses camelCase. IDs are UUID strings. Timestamps are ISO-8601 UTC instants.
- Monetary values are decimal numbers represented by PostgreSQL `NUMERIC(12,2)`; clients must not submit trusted prices or totals.
- Successful reads return a resource or a `Page` object (`content`, `page`, `size`, `totalElements`, `totalPages`). Creates return HTTP 201; updates return HTTP 200; deletes/empty actions return HTTP 204 where applicable.
- Authenticated requests use `Authorization: Bearer <accessToken>`.
- Errors use `{ "timestamp": "...", "status": 400, "error": "VALIDATION_ERROR", "message": "Request validation failed", "path": "/api/...", "fieldErrors": { "username": "must not be blank" } }`. Secrets, password hashes, token contents, and database diagnostics are never returned.
- `page` is zero-based; `size` is capped at 100. No caller-controlled sort parameter is currently supported.

## Authentication

### `POST /api/auth/login` — public

Request:

```json
{ "username": "staff-name", "password": "supplied-secret" }
```

Response `200`:

```json
{
  "accessToken": "<signed JWT>",
  "tokenType": "Bearer",
  "expiresIn": 900000,
  "user": { "id": "uuid", "username": "staff-name", "displayName": "Staff Name", "role": "CASHIER" }
}
```

Invalid credentials and inactive users return the same generic `401` error.

### `GET /api/auth/me` — any authenticated role

Response `200`: `{ "id": "uuid", "username": "staff-name", "displayName": "Staff Name", "role": "CASHIER", "active": true }`.

## Role names and access

Roles are `ADMIN`, `MANAGER`, `CASHIER`, `WAITER`, `KITCHEN_STAFF`, `CUSTOMER`. Authorization is derived from the authenticated database user and JWT subject; clients cannot elevate access by submitting a role. ADMIN has user/catalog administration. MANAGER has reports and broad read access. CASHIER has pending checks/payment history and payment operations. WAITER can read service orders and serve READY orders. KITCHEN_STAFF can read kitchen tickets and advance preparation status. CUSTOMER can create and list only their own orders, and read the menu.

## User administration — ADMIN

- `GET /api/admin/users?page=0&size=25&query=&role=&active=` → paged `UserSummary` objects: `id, username, displayName, role, active, createdAt`.
- `POST /api/admin/users` request `{ "username": "...", "password": "...", "displayName": "...", "role": "CUSTOMER" }` → created summary (`201`). Password is BCrypt-hashed and never returned.
- `PUT /api/admin/users/{id}` request `{ "username": "...", "displayName": "..." }` → updated summary (`200`).
- `PATCH /api/admin/users/{id}/status` request `{ "active": false }` → updated summary (`200`).
- `PATCH /api/admin/users/{id}/role` request `{ "role": "WAITER" }` → updated summary (`200`).
- `PATCH /api/admin/users/{id}/password` request `{ "newPassword": "..." }` → `204`; authorized admin reset only, never echoes the password.

Public registration is not provided. An optional one-time bootstrap admin may be created from `BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_PASSWORD`, and `BOOTSTRAP_ADMIN_DISPLAY_NAME` when the user table is empty.

## Menu

`GET /api/menu/categories` and `GET /api/menu/items` are public reads and only expose active categories/items. Item listing accepts `categoryId`, `query`, `page`, and `size`. `GET /api/menu/items/{id}` returns one active item; inactive items return `404`.

Category shape: `{ "id": "uuid", "name": "Mains", "description": "...", "active": true }`.
Item shape: `{ "id": "uuid", "name": "...", "description": "...", "categoryId": "uuid", "categoryName": "Mains", "price": 24.00, "imageUrl": null, "active": true }`.

ADMIN only: `POST /api/menu/categories` with `{name, description}`, `PUT /api/menu/categories/{id}` with `{name, description, active}`, `POST /api/menu/items` with `{name, description, categoryId, price, imageUrl}`, `PUT /api/menu/items/{id}` with the same fields, and `PATCH /api/menu/items/{id}/status` with `{active}`.

## Orders

- `POST /api/orders` — CUSTOMER. Request `{ "tableNumber": 4, "items": [{ "menuItemId": "uuid", "quantity": 2 }] }`. The server fetches current enabled menu prices and calculates all line totals. Response `201`:

```json
{
  "id": "uuid", "orderNumber": "ORD-...", "customerId": "uuid", "customerName": "Guest Name",
  "tableNumber": 4, "status": "RECEIVED", "paymentStatus": "PENDING",
  "items": [{ "menuItemId": "uuid", "name": "Dish", "quantity": 2, "unitPrice": 24.00, "lineTotal": 48.00 }],
  "total": 48.00, "createdAt": "2026-09-27T12:00:00Z"
}
```

- `GET /api/orders/my-orders` — CUSTOMER; only the authenticated customer's orders.
- `GET /api/orders` — ADMIN/MANAGER/CASHIER/WAITER/KITCHEN_STAFF; supports `status`, `from`, `to`, `page`, `size`.
- `GET /api/orders/{id}` — owner or ADMIN/MANAGER/CASHIER/WAITER/KITCHEN_STAFF.
- Allowed state changes: kitchen `RECEIVED → PREPARING → READY`; waiter `READY → SERVED`; cashier payment only for `SERVED → COMPLETED`. ADMIN does not bypass these workflow checks. `CANCELLED` is reserved for future policy-backed cancellation; no cancellation endpoint is currently exposed.

## Kitchen, waiter, cashier, and manager

- `GET /api/kitchen/orders` — KITCHEN_STAFF; optional `status`.
- `PATCH /api/kitchen/orders/{id}/status` — KITCHEN_STAFF; `{ "status": "PREPARING" | "READY" }`.
- `GET /api/waiter/orders` — WAITER; optional `status` (defaults READY and SERVED).
- `PATCH /api/waiter/orders/{id}/serve` — WAITER; no body; only READY orders can be served.
- `GET /api/cashier/orders/pending` — CASHIER; served, unpaid orders.
- `POST /api/cashier/orders/{id}/payments` — CASHIER; request `{ "method": "CASH" | "CARD" }`. This phase records a simulated payment, not a card charge; duplicate payment is rejected. Response includes `id, orderId, amount, status, method, createdAt`.
- `GET /api/cashier/payments?page=0&size=25` — CASHIER; paged payment history.
- `GET /api/manager/dashboard?date=YYYY-MM-DD` — MANAGER; `{ date, totalRevenue, totalOrders, averageOrderValue }`.
- `GET /api/manager/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD` — MANAGER; `{ from, to, points: [{ date, revenue }] }`.
- `GET /api/manager/orders?from=&to=&page=&size=` — MANAGER; paged order results.
- `GET /actuator/health` — public liveness/readiness summary; details are not exposed.

## Frontend integration gap

Before switching off its development mock, the frontend needs an API adapter: call `POST /api/auth/login`, keep the access token in memory (prefer an HttpOnly cookie in a later auth redesign), attach the bearer token through the Axios client, hydrate `AuthContext` from `GET /api/auth/me`, and send logout by discarding local token state. Its current `AuthUser` is compatible with the response's nested `user` after mapping `id, username, displayName, role`.

The current dashboard mock order shape uses `table`, item `qty`, `total`, and a display-time string; the backend contract uses `tableNumber`, item `quantity`, decimal totals, and ISO timestamps. Menu categories/items and manager metrics also remain hardcoded locally. An explicit mapping layer is required; the backend does not claim drop-in compatibility with data that the frontend does not yet request. Configure `VITE_API_BASE_URL` to the backend origin only after that adapter is implemented.