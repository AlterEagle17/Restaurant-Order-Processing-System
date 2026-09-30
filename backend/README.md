# Restaurant Backend

Spring Boot 4.1.1 REST API on Java 21, Maven, Spring Security, JPA, Flyway, and PostgreSQL. The existing `com.restaurant.backend` Initializr project and package are retained. The backend provides real JWT authentication; it does not use the frontend's development-only mock accounts and contains no demo passwords.

## Requirements

- Java 21
- PostgreSQL 14+ for a local run or hosted database
- Maven Wrapper (included)

## Local development

The application expects a PostgreSQL database and does not create or reset the database itself. For local development, copy `.env.example` to `.env` in `backend/` and fill in local values, or set the same variables in the terminal. Never commit `.env` or put production credentials in the example file.

```powershell
$env:SPRING_PROFILES_ACTIVE = 'local'
$env:DB_HOST = 'localhost'
$env:DB_PORT = '5432'
$env:DB_NAME = 'restaurant'
$env:DB_USERNAME = 'your-local-db-user'
$env:DB_PASSWORD = 'your-local-db-password'
$env:DB_SSL_MODE = 'disable'
$env:JWT_SECRET = '<base64-encoded-random-key-of-at-least-32-bytes>'
$env:CORS_ALLOWED_ORIGINS = 'http://localhost:5173,http://127.0.0.1:5173'
./mvnw.cmd spring-boot:run
```

On macOS/Linux use `./mvnw spring-boot:run`. The server listens on `PORT` (default `8080`). Flyway applies new versioned migrations on startup; Hibernate uses `ddl-auto=validate`, so production tables are not generated, reset, or dropped automatically. `GET /actuator/health` is available for health checks.

Generate a 256-bit Base64 JWT key using a trusted local tool, for example `openssl rand -base64 32`. The application rejects missing/weak secrets and expiration values outside 60 seconds to 24 hours. Never check the generated key into Git.

## First administrator

There is no public registration endpoint. Migration V3 inserts the six development accounts documented below with BCrypt-hashed passwords. For a database without those migration users, optionally set `BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_PASSWORD` (12–72 characters), and `BOOTSTRAP_ADMIN_DISPLAY_NAME` before the first startup. A BCrypt-hashed ADMIN is created only if the user table is empty. Once an administrator exists, these variables cannot add another user; remove the bootstrap variables after initialization. Create all later accounts through the ADMIN API.

## Supabase PostgreSQL

The app explicitly imports an optional `backend/.env` as Java properties for local runs; Render should receive secrets through its Environment settings. The `prod` profile defaults the non-sensitive connection values to the Supabase shared pooler (`DB_HOST=aws-0-ap-northeast-1.pooler.supabase.com`, `DB_PORT=5432`, `DB_NAME=postgres`, `DB_USERNAME=postgres.qpwmthtsljferxrhycwg`, `DB_SSL_MODE=require`). Override these values with Render environment variables only when the database endpoint differs. `DB_PASSWORD` and `JWT_SECRET` remain required runtime secrets. Do not put database credentials or Supabase service-role keys in frontend `VITE_` variables. V1 creates the initial schema and V2 adds historical order-item name snapshots; later changes must use new forward-only Flyway migrations.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_NAME` | PostgreSQL endpoint and database |
| `DB_USERNAME`, `DB_PASSWORD` | Backend-only database credentials |
| `DB_SSL_MODE` | PostgreSQL JDBC SSL mode; use `require` for Supabase |
| `JWT_SECRET` | Base64 key containing at least 32 random bytes |
| `JWT_EXPIRATION_MS` | Access token lifetime; defaults to 900000 ms |
| `CORS_ALLOWED_ORIGINS` | Comma-separated exact origins, no wildcard |
| `PORT` | HTTP port; defaults to 8080 and uses Render's assigned port |
| `BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_PASSWORD`, `BOOTSTRAP_ADMIN_DISPLAY_NAME` | Optional first-user setup when the DB is empty |

`.env`, `.env.local`, and `.env.*.local` are ignored. `.env.example` has no actual credentials.

## API and frontend integration

See [API_CONTRACT.md](API_CONTRACT.md) for the full endpoint/request/response/role contract and frontend mappings. The frontend now has an explicit API mode: `VITE_USE_DEMO_AUTH=false` calls `/api/auth/login` and `/api/auth/me`, attaches the bearer token, and connects admin, customer, kitchen, waiter, cashier, and manager views to the API. `VITE_USE_DEMO_AUTH=true` is honored only by Vite development builds and keeps demo accounts local.

## Tests and packaging

```powershell
./mvnw.cmd clean test
./mvnw.cmd clean package
```

The API integration suite uses H2 with the same Flyway migration and Hibernate schema validation. This checks most API behavior without a running PostgreSQL service; it is not a substitute for testing against the chosen Supabase/PostgreSQL endpoint. The resulting executable JAR is `target/backend-0.0.1-SNAPSHOT.jar`.

## Render deployment

Create a Render **Web Service** from `AlterEagle17/Restaurant-Order-Processing-System` on branch `main` with these Docker settings:

- Runtime: Docker
- Root Directory: `backend`
- Dockerfile Path: `Dockerfile`
- Docker Context: `.`
- Docker Command: leave blank to use the Dockerfile's default `CMD`
- Health check path: `/actuator/health`
- Environment: set `SPRING_PROFILES_ACTIVE=prod`, `DB_PASSWORD`, a fresh Base64 `JWT_SECRET` containing at least 32 random bytes, and `CORS_ALLOWED_ORIGINS` to the exact deployed frontend origin(s). Supabase host, port, database, username, and SSL mode default to the values above; they can be overridden in Render if needed. Set optional bootstrap admin variables only when initializing an empty database, then remove the bootstrap password. Set secrets in Render, not in source files.
- For a new database, configure the optional bootstrap admin values for initial startup, then remove them after the first admin exists.

Render supplies `PORT`; Spring Boot uses it automatically. No deployment has been performed or verified from this workspace.