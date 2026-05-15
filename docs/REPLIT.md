# Deploying Evalax to Replit

Last verified: 2026-05-14. The frontend is fully offline-capable (IndexedDB), so the simplest deploy is **static frontend only** — the optional Hono backend is independent.

## 1. Import the repo

In Replit:
- **+ Create Repl** → **Import from GitHub** → paste `https://github.com/keletonik/evalax`.
- Pick **Node.js** as the language. Replit will detect `.replit` automatically.

## 2. First run (workspace dev)

The workspace will:
1. Install Node 20 (via `.replit` `modules`).
2. Install system deps from `replit.nix` (python3, gcc — needed only if you also `cd server && npm install`).
3. Run `npm install` automatically.
4. Run `npm run dev` (defined in `[run]` in `.replit`).

You should see:

```
VITE v7.x  ready in N ms
➜  Local:   http://localhost:5173/
➜  Network: http://0.0.0.0:5173/
```

Open the **Webview** tab. The app loads at the Replit `*.replit.dev` URL.

## 3. If you see "Blocked request. This host is not allowed."

`vite.config.js` already whitelists `.replit.dev`, `.replit.app`, `.repl.co`, and `.riker.replit.dev`. If your Replit URL is on a different subdomain (rare), append it to `REPLIT_HOSTS` in `vite.config.js` and restart.

## 4. If HMR doesn't reload on file save

The dev server detects Replit via `process.env.REPL_ID` and tells the HMR client to use `wss://<host>:443`. If you forked the repo and the env var is absent, force it by setting `REPL_ID=1` in the Secrets pane.

## 5. Production deploy (static)

In Replit:
- Click **Deploy** → **Autoscale** (or **Static**).
- Build command: `npm ci && npm run build` (already set in `.replit` `[deployment]`).
- Run command: `npm run start` (which runs `vite preview` on `0.0.0.0:$PORT`).
- Deploy.

The deploy URL will be `https://<your-repl-name>.<owner>.repl.co` (or the custom domain you attach).

## 6. Backend (optional)

The Hono backend under `server/` is NOT auto-started by the Replit run script — the frontend doesn't yet call it (the v1 build still uses IndexedDB). If you want to run the backend in the same workspace:

```bash
cd server
npm install
npx drizzle-kit push     # creates server/evalax.db
PORT=8787 npm run dev
```

It will be reachable inside the workspace at `http://localhost:8787` and externally at the Replit URL on the corresponding `[[ports]]` mapping (add another entry to `.replit` if you want it routed publicly):

```toml
[[ports]]
localPort = 8787
externalPort = 8787
```

For Vercel-style "frontend talks to API" once you wire it, set `VITE_API_BASE` in Replit's **Secrets** pane to the deployed backend URL.

## 7. Troubleshooting checklist

| Symptom | Likely cause | Fix |
|---|---|---|
| "This site can't be reached" in Webview | Vite bound to `127.0.0.1`, not `0.0.0.0` | Already fixed in `vite.config.js`. Restart the Repl. |
| "Blocked request. This host is not allowed" | Vite host-check on a new Replit subdomain | Add the host to `REPLIT_HOSTS` in `vite.config.js`. |
| HMR never reconnects | Wrong HMR `clientPort` over the Replit HTTPS proxy | Already handled by the `process.env.REPL_ID` check. |
| `better-sqlite3` install fails | Missing build tools | `replit.nix` already provides python3 + gcc + make. |
| Deploy build fails with "out of memory" | Recharts/pdf.js TS-type elaboration | We split them into vendor chunks; if it still fails, raise the Repl memory tier. |
| 0 vulnerabilities expected, but `npm install` warns | Older npm | Replit Node 20 ships npm 10 — fine. Ignore. |
| Dev DB file commits keep appearing | `server/.gitignore` already ignores `*.db`. |
| `Cannot find module 'fake-indexeddb'` during build | A test file imported it at top-level | Already in devDeps; `vite build` excludes `*.test.js`. |

## 8. Environment variables

| Var | Where | Used by | Default |
|---|---|---|---|
| `PORT` | injected by Replit | `vite.config.js` (`server.port`, `preview.port`) and `server/src/index.js` | 5173 / 4173 / 8787 |
| `REPL_ID` | injected by Replit | `vite.config.js` (HMR detection) | unset |
| `VITE_API_BASE` | Secrets | `src/backend/apiClient.js` | empty (offline-only) |
| `JWT_SECRET` | Secrets | `server/src/middleware/auth.js` | dev fallback |
| `DATABASE_URL` | Secrets | `server/src/db/client.js` | `./evalax.db` |
| `ALLOWED_ORIGIN` | Secrets | `server/src/index.js` (CORS) | `*` (dev) |

## 9. Persistence between sessions

Replit workspaces are persistent volumes, so:
- The frontend's IndexedDB lives **in the user's browser**, not the workspace. Clear-cache wipes it.
- The backend's `server/evalax.db` lives **in the workspace** — survives restarts; counts toward your storage quota.
