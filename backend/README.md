# Restaurant Backend

Spring Boot 4.1.1 REST API on Java 21, Maven, Spring Security, JPA, Flyway, and PostgreSQL. The existing `com.restaurant.backend` Initializr project and package are retained. The backend provides real JWT authentication; it does not use the frontend's development-only mock accounts and contains no demo passwords.

## Requirements

- Java 21
- PostgreSQL 14+ for a local run or hosted database
- Maven Wrapper (included)

## Local development

The application expects a PostgreSQL database and does not create or reset the database itself. Set environment variables in the terminal before starting it. Example PowerShell configuration (fill in values locally; do not commit credentials):

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

There is no public registration endpoint and migrations do not insert example users. To initialize a new database, optionally set `BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_PASSWORD` (12–72 characters), and `BOOTSTRAP_ADMIN_DISPLAY_NAME` before the first startup. A BCrypt-hashed ADMIN is created only if the user table is empty. Once an administrator exists, these variables cannot add another user; remove the bootstrap variables after initialization. Create all later accounts through the ADMIN API.

## Supabase PostgreSQL

Copy `.env.example` as a reference and supply values through the process environment or deployment secret manager; Spring Boot does not automatically load `.env` files. Configure `DB_HOST`, `DB_PORT` (usually `5432`), `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, and `DB_SSL_MODE`. For hosted Supabase use its database host/pooler endpoint and `DB_SSL_MODE=verify-full`; use the supplied database username/password. Do not put database credentials or Supabase service-role keys in frontend `VITE_` variables. V1 creates only application tables and indexes, and later schema changes must use new forward-only Flyway migrations.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `DB_HOST`, `DB_PORT`, `DB_NAME` | PostgreSQL endpoint and database |
| `DB_USERNAME`, `DB_PASSWORD` | Backend-only database credentials |
| `DB_SSL_MODE` | PostgreSQL JDBC SSL mode; use `verify-full` for hosted PostgreSQL |
| `JWT_SECRET` | Base64 key containing at least 32 random bytes |
| `JWT_EXPIRATION_MS` | Access token lifetime; defaults to 900000 ms |
| `CORS_ALLOWED_ORIGINS` | Comma-separated exact origins, no wildcard |
| `PORT` | HTTP port; defaults to 8080 and uses Render's assigned port |
| `BOOTSTRAP_ADMIN_USERNAME`, `BOOTSTRAP_ADMIN_PASSWORD`, `BOOTSTRAP_ADMIN_DISPLAY_NAME` | Optional first-user setup when the DB is empty |

`.env`, `.env.local`, and `.env.*.local` are ignored. `.env.example` has no actual credentials.

## API and frontend integration

See [API_CONTRACT.md](API_CONTRACT.md) for the full endpoint/request/response/role contract and the observed frontend gaps. The current frontend only configures Axios; it does not call the API, attach a bearer token, or use these response objects. Its development mock login remains separate. Before switching to backend authentication, add a frontend adapter for `/api/auth/login` and `/api/auth/me`, store/attach the returned token, and map the API menu/order/report DTOs to the dashboard view models. Then set `VITE_API_BASE_URL` to the deployed backend origin.

## Tests and packaging

```powershell
./mvnw.cmd clean test
./mvnw.cmd clean package
```

The API integration suite uses H2 with the same Flyway migration and Hibernate schema validation. This checks most API behavior without a running PostgreSQL service; it is not a substitute for testing against the chosen Supabase/PostgreSQL endpoint. The resulting executable JAR is `target/backend-0.0.1-SNAPSHOT.jar`.

## Render deployment

Create a Render **Web Service** from the repository with `backend` as the Root Directory.

- Build command: `chmod +x mvnw && ./mvnw clean package`
- Start command: `java -jar target/backend-0.0.1-SNAPSHOT.jar`
- Health check path: `/actuator/health`
- Environment: set `SPRING_PROFILES_ACTIVE=prod`, `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, `DB_PASSWORD`, `DB_SSL_MODE=verify-full`, a fresh `JWT_SECRET`, and `CORS_ALLOWED_ORIGINS` containing exact local/deployed frontend origins as needed.
- For a new database, configure the optional bootstrap admin values for initial startup, then remove them after the first admin exists.

Render supplies `PORT`; Spring Boot uses it automatically. No deployment has been performed or verified from this workspace.