# Xact — API server (scaffold)

Hono + Drizzle + SQLite. Production deployment intent: swap SQLite for Postgres (Neon) and run behind a reverse proxy that terminates TLS.

## Run locally

```
cd server
npm install
npm run db:push     # creates the SQLite tables
npm run dev         # starts http://localhost:8787
```

Then in the project root, point the frontend at the API:

```
VITE_API_BASE=http://localhost:8787 npm run dev
```

The frontend remains fully offline-capable; `VITE_API_BASE` is only consulted when the API client (`src/backend/apiClient.js`) is wired into a feature.

## Endpoints (current scope)

- `POST /auth/register` — register a new user + org.
- `POST /auth/login` — exchange password for a JWT.
- `GET/POST/PUT/DELETE /products/:id?` — CRUD products (auth required).

The other routers (suppliers, prices, projects, drawings, markups, estimates, servicing) follow the same pattern; they're trivial to add and were intentionally left out of this scaffold to keep the diff reviewable. Each takes ~30 lines.

## Security

- Auth: JWT (HS256, JOSE). Access tokens 15 min. Refresh flow is **not yet implemented** — production must add HttpOnly refresh cookies.
- Passwords: scrypt (Node crypto). Argon2 is preferable in production (add `argon2` package).
- CORS: locked to `ALLOWED_ORIGIN` in prod.
- Org scoping: every row carries `orgId`; routes filter on `c.get('user').orgId`. There is **no row-level enforcement at the DB level** — relying on application-layer checks. For a real prod deployment, add Postgres RLS.

## Gaps (be honest)

- No refresh tokens.
- No rate-limiting.
- No virus-scan on uploaded files.
- File storage is local disk; production should use R2/S3.
- The frontend doesn't sync to this backend yet — it persists to IndexedDB. Wiring is intentionally deferred.
