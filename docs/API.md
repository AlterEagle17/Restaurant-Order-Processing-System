# API reference

Base path: `/api`. JSON requests and responses use ISO-8601 timestamps and decimal amounts. Except for login, every request needs `Authorization: Bearer <token>`. The server returns `401` for a missing/invalid token, `403` for a disallowed role, `400` for validation failures, `404` for missing records, and `409` for duplicate identities/payments or invalid state transitions.

## Authentication

```http
POST /api/auth/login
Content-Type: application/json

{"username":"staff-or-email@example.com","password":"your-password"}
```

Returns `{ "token": "<signed JWT>", "user": { "id": 1, "username": "...", "email": "...", "role": "ADMIN", "active": true, "createdAt": "..." } }`. `GET /api/auth/me` returns the current user. `POST /api/auth/logout` is a stateless-session acknowledgement; the client must discard its token.

## Menu and accounts

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| GET | `/menu` | Authenticated | Available items; Admin also sees unavailable items |
| GET | `/categories` | Authenticated | List menu categories |
| GET | `/admin/users` | Admin | List accounts |
| POST | `/admin/users` | Admin | Create account |
| PUT | `/admin/users/{id}` | Admin | Update account, role, active state, optional password |
| POST/PUT | `/admin/categories[/{id}]` | Admin | Create/update category |
| POST/PUT | `/admin/menu[/{id}]` | Admin | Create/update menu item and availability |
| DELETE | `/admin/menu/{id}` | Admin | Archive a menu item by setting it unavailable; order history is preserved |

Example account creation (password must be at least 12 characters):

```json
{"username":"line-cook","email":"cook@example.invalid","password":"replace-with-a-long-unique-password","role":"KITCHEN_STAFF"}
```

Menu item request: `{"name":"Pappardelle","description":"Wild mushrooms and thyme","imageUrl":"https://example.invalid/plate.jpg","price":23.00,"categoryId":2,"available":true}`.

## Orders, payments, reports

| Method | Endpoint | Access | Purpose |
|---|---|---|---|
| POST | `/orders` | Customer | Place an order; server prices each item from the current menu |
| GET | `/orders` | Authenticated | Role-filtered order history/queue |
| PATCH | `/orders/{id}/status` | Kitchen staff or Waiter | Apply only valid workflow transitions |
| POST | `/orders/{id}/payments` | Cashier | Record the single completed payment for a served order |
| GET | `/payments?from=YYYY-MM-DD&to=YYYY-MM-DD` | Cashier, Manager, Admin | Completed payments in date range |
| GET | `/reports/sales?from=YYYY-MM-DD&to=YYYY-MM-DD` | Manager, Admin | Paid revenue and order count for date range |

Place order:

```json
{"tableNumber":12,"items":[{"menuItemId":3,"quantity":2},{"menuItemId":5,"quantity":1}]}
```

Progress the kitchen ticket with `{"status":"PREPARING"}`, then `{"status":"READY"}`. The waiter uses `{"status":"SERVED"}`. A cashier records payment with `{"method":"CARD"}`; supported methods are `CASH`, `CARD`, and `DIGITAL_WALLET`. Only `PENDING -> PREPARING -> READY -> SERVED -> PAID` is accepted; kitchen and waiter permissions are enforced by role.