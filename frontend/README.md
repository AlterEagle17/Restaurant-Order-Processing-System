# Linden House Restaurant Operations

React, TypeScript, Vite, Tailwind CSS, React Router, Axios, and Lucide React frontend. It supports a development-only demo mode and a real Spring Boot API mode. Payments remain simulated; no payment gateway is connected.

## Local development

```sh
npm install
npm run dev
```

`VITE_USE_DEMO_AUTH=true` selects demo mode only under Vite development. Production builds always use API authentication regardless of that value. The ignored `.env.local` enables demo mode locally; set `VITE_USE_DEMO_AUTH=false` and configure `VITE_API_BASE_URL` to test the Spring Boot API. Restart Vite after environment changes.

API mode calls `/api/auth/login` and `/api/auth/me`, stores the access token in session-scoped browser storage, attaches it to authenticated Axios requests, and clears it on logout or `401`. Browser storage is accessible to JavaScript; production deployments should add an HttpOnly-cookie design or another XSS mitigation before handling sensitive data. Demo credentials are never sent to the backend and are not secure authentication credentials.

## Demo accounts

Edit the strongly typed account list in `src/config/demoUsers.ts`. Each entry has `id`, `username`, `password`, `displayName`, `role`, and `active` fields. Add a unique username, use one of the `UserRole` values from `src/types/auth.ts`, and set `active: false` to disable an account. Removing an entry disables its login. Vite reloads the app after source changes. Admin account actions are in-memory for the current development session; update the config file for durable demo changes.

The login page lists active demo usernames and roles in development only. Selecting one fills its fields for convenience; passwords are not printed in the panel. Duplicate usernames are rejected by the admin editor and authentication uses case-insensitive username matching.

## API configuration

`src/services/api.ts` creates the reusable Axios client from `VITE_API_BASE_URL`; role API modules live in `src/services/`. Set the backend origin in `.env.local` for local API integration. Do not put secrets, database credentials, or JWT signing keys in Vite variables; all `VITE_` values are public in browser builds.

## Build and lint

```sh
npm run build
npm run lint
npm test
```

## Vercel

Import the repository into Vercel and set **Root Directory** to `frontend`. Use `npm install` for install, `npm run build` for build, and `dist` for output. `vercel.json` rewrites application routes to `index.html` for React Router. Set `VITE_API_BASE_URL` to the deployed Render origin and `VITE_USE_DEMO_AUTH=false` in Vercel. Do not add database credentials, JWT secrets, or Supabase keys to Vercel. Trigger a new deployment after changing environment variables.