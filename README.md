
# Restaurant-Order-Processing-System
=======
# Restaurant Order Processing System

A two-application restaurant service system. The React/Vite client talks to a Spring Boot REST API backed by MySQL. It includes staff-only account creation, six role-based workspaces, a customer menu and cart, the kitchen-to-floor order workflow, checkout, sales reporting, and menu administration.

## Prerequisites

- Java 21 or newer
- Maven 3.9 or newer (or install the Maven Wrapper if Maven is not on PATH)
- Node.js 20 or newer and npm
- MySQL 8.0+ or an Aiven MySQL service

## Configure MySQL and secrets

Create an empty database/schema and a database user with permission to create and alter tables in that schema. Flyway creates the application tables and inserts the sample menu on first startup; Hibernate validates the schema and does not recreate it.

Copy `backend/.env.example` to `backend/.env`, then fill in `DB_HOST`, `DB_PORT`, `DB_NAME`, `DB_USERNAME`, and `DB_PASSWORD`. Spring Boot does not automatically load `.env` files, so export the values into the shell used to run Maven. In PowerShell, for the current terminal:

```powershell
$env:DB_HOST = "localhost"
$env:DB_PORT = "3306"
$env:DB_NAME = "restaurant_orders"
$env:DB_USERNAME = "restaurant_app"
$env:DB_PASSWORD = "your-database-password"
$env:DB_SSL = "false"
$env:JWT_SECRET = [Convert]::ToBase64String([Security.Cryptography.RandomNumberGenerator]::GetBytes(48))
$env:FRONTEND_ORIGIN = "http://localhost:5173"
```

For Aiven, use the hostname and port shown in the service console, set `DB_SSL=true`, and use its database name, username, and password. The JDBC URL enables TLS with `useSSL` and `requireSSL`. Keep the Aiven CA certificate separately if your service requires certificate verification beyond TLS encryption.

### Initial administrator

There is no public registration endpoint. On a brand-new database only, set all of the following before the first backend launch:

```powershell
$env:ADMIN_USERNAME = "house-admin"
$env:ADMIN_EMAIL = "admin@example.invalid"
$env:ADMIN_PASSWORD = "use-a-unique-password-of-12-or-more-characters"
```

The bootstrap inserts an Admin only when the users table is empty and stores only a BCrypt hash. The variables can be removed immediately after bootstrap. Never commit `.env` files or reuse example values. Create all subsequent accounts in the Admin dashboard.

## Run locally

Start the backend from `backend/` after configuring the environment:

```powershell
cd backend
mvn spring-boot:run
```

If Maven is not installed, install Maven 3.9+ or generate/commit a Maven Wrapper (`mvn wrapper:wrapper`) and run `./mvnw spring-boot:run` (Windows: `mvnw.cmd spring-boot:run`). The API listens on `http://localhost:8080`.

In a second terminal:

```powershell
cd frontend
npm install
Copy-Item .env.example .env.local
npm run dev
```

The Vite development server is at `http://localhost:5173`. `VITE_API_BASE_URL` defaults to `http://localhost:8080/api`; set it in `frontend/.env.local` only when the API address differs. Database credentials are never read by or sent to the browser.

## Features and roles

- **Customer:** browse available menu items, filter by category, change cart quantities, submit an order for a table, and follow its status/history.
- **Kitchen staff:** process pending tickets through Preparing to Ready.
- **Waiter:** view ready tickets and mark them Served.
- **Cashier:** view served orders, record cash/card/digital-wallet payment, and review payments.
- **Manager:** filter sales reports by dates. Revenue sums completed payments; order count uses order creation dates.
- **Admin:** create/update/deactivate team accounts, securely reset passwords, assign roles, and manage categories, prices, descriptions, images, and availability.

The API checks role access independently of frontend routes. JWTs are signed, expire after the configured interval, and are stored in browser session storage. Signing out removes the client token. Role changes and account deactivation take effect on the next authenticated request because the API reloads the active account for each token request.

## Database migrations

Flyway scripts in `backend/src/main/resources/db/migration/` create normalized `users`, `menu_categories`, `menu_items`, `orders`, `order_items`, and `payments` tables, with foreign keys, unique constraints, timestamps, and `DECIMAL(10,2)` money values. `V2` seeds a small menu. Existing rows are preserved; subsequent schema changes should be added as new versioned migrations, not by editing applied migrations.

## Checks

```powershell
cd frontend
npm test
npm run build

cd ..\backend
mvn test
```

The backend tests use Spring Boot's Maven test stack. Database integration requires a reachable MySQL instance and the environment variables above.

## API reference

See [docs/API.md](docs/API.md) for endpoint permissions and example requests. All protected requests use `Authorization: Bearer <token>`. Login accepts either username or email and returns `{ "token": "...", "user": { ... } }`.

## Deployment notes

Use HTTPS for both client and API in production, set a unique high-entropy `JWT_SECRET`, restrict `FRONTEND_ORIGIN` to the deployed client origin, configure MySQL backups, and store secrets in the hosting platform's secret manager. Configure database least privilege and TLS certificate verification according to the selected MySQL provider.
 e58b428 (helo)
