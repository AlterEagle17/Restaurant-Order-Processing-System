# Linden House Restaurant Operations

A restaurant order processing system with a React, TypeScript, Vite, and Tailwind frontend and a Java 21, Spring Boot, and PostgreSQL backend. The frontend provides development-only demo authentication and a separate API mode backed by JWT authentication and role-protected REST endpoints. Payments are simulated; no payment gateway is connected.

## Run locally

Run these commands from the `frontend` directory:

```sh
npm install
npm run dev
```

To check the TypeScript production build and lint rules:

```sh
npm run build
npm run lint
```

## Development demo accounts

These accounts work only with the Vite development server. They are not real or secure accounts and must not be used in production.

| Role | Username | Password |
| --- | --- | --- |
| Admin | `admin` | `Admin@12345` |
| Manager | `manager` | `Manager@12345` |
| Cashier | `cashier` | `Cashier@12345` |
| Waiter | `waiter` | `Waiter@12345` |
| Kitchen staff | `kitchen` | `Kitchen@12345` |
| Customer | `customer` | `Customer@12345` |

Edit or remove development accounts in [`frontend/src/config/demoUsers.ts`](frontend/src/config/demoUsers.ts). The login page's quick-fill panel is also development-only.

## Backend and deployment

The frontend supports API mode and a separate development-only demo mode. Configure `VITE_API_BASE_URL` and set `VITE_USE_DEMO_AUTH=false` to connect it to the backend. See [`frontend/README.md`](frontend/README.md) for environment variable and Vercel deployment steps. The backend's Render Docker settings and environment variables are documented in [`backend/README.md`](backend/README.md).

The Spring Boot API is documented in [`backend/README.md`](backend/README.md), with endpoint and frontend compatibility details in [`backend/API_CONTRACT.md`](backend/API_CONTRACT.md). The backend has JWT authentication and PostgreSQL persistence; no deployment has been performed.