# Linden House Restaurant Operations

A responsive restaurant order processing frontend built with React, TypeScript, Vite, Tailwind CSS, React Router, Axios, and Lucide React.

This phase provides a development-only mock login and separate workspaces for administrators, managers, cashiers, waiters, kitchen staff, and customers. It does not include a backend, real payment processing, or production authentication.

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

The reusable Axios client reads `VITE_API_BASE_URL`; it is intentionally blank until a backend is available. See [`frontend/README.md`](frontend/README.md) for environment variable guidance, account configuration details, and Vercel deployment steps. Vercel should use `frontend` as its project root directory.