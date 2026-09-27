# Linden House Restaurant Operations

React, TypeScript, Vite, Tailwind CSS, React Router, Axios, and Lucide React frontend. This phase uses local mock data only; there is no backend connection or real payment processing.

## Local development

```sh
npm install
npm run dev
```

The mock login and development account panel only run under Vite's development mode. Demo session data is stored in `sessionStorage` and is not a secure authentication mechanism. Do not use these accounts or the frontend mock flow in production.

## Demo accounts

Edit the strongly typed account list in `src/config/demoUsers.ts`. Each entry has `id`, `username`, `password`, `displayName`, `role`, and `active` fields. Add a unique username, use one of the `UserRole` values from `src/types/auth.ts`, and set `active: false` to disable an account. Removing an entry disables its login. Vite reloads the app after source changes. Admin account actions are in-memory for the current development session; update the config file for durable demo changes.

The login page lists active demo usernames and roles in development only. Selecting one fills its fields for convenience; passwords are not printed in the panel. Duplicate usernames are rejected by the admin editor and authentication uses case-insensitive username matching.

## API configuration

`src/services/api.ts` creates the reusable Axios client from `VITE_API_BASE_URL`. Both `.env.example` and the local `.env.local` start with an empty value. Set the URL in `.env.local` for local backend integration, then restart Vite. Do not put secrets, database credentials, or JWT signing keys in Vite variables; all `VITE_` values are public in browser builds.

## Build and lint

```sh
npm run build
npm run lint
```

## Vercel

Import the repository into Vercel and set **Root Directory** to `frontend`. Use `npm install` for install, `npm run build` for build, and `dist` for output. `vercel.json` rewrites application routes to `index.html` for React Router. Add `VITE_API_BASE_URL` under the Vercel project's Environment Variables when the Spring Boot API is available; leave it unset or empty until then. Trigger a new deployment after changing environment variables.