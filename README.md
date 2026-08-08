# Win Predict AI Admin

Nuxt admin app for tournament metadata. Runs as a Node server with SQLite and magic-link auth (Resend). Designed for VPS deploy (e.g. `http://202.71.15.138`).

## Stack

- Nuxt 4 (SPA client + Nitro API)
- SQLite (`better-sqlite3`)
- Magic link auth (users table + Resend; `ADMIN_EMAILS` seeds initial admins)
- Tailwind CSS + shadcn-vue style components
- Pinia, VeeValidate + Zod, TanStack Table, vuedraggable

## Setup (local)

```bash
cp .env.example .env
# set ADMIN_EMAILS (bootstrap), SESSION_SECRET; RESEND_API_KEY optional in dev
npm install
npm run import:leagues   # pulls leagues.json from win-predict-ai-data
npm run dev
```

Open http://localhost:3000 — enter an active admin email. Without `RESEND_API_KEY`, the magic link is printed in the server console.

`ADMIN_EMAILS` is only used to seed missing rows into the `users` table on startup. After that, manage admins in the **Admins** UI (`/admins`).

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build (`.output/`) |
| `npm start` | Run production server |
| `npm run import:leagues` | Import tournaments into SQLite |
| `npm run preview` | Preview production build |

## Deploy (VPS)

See [deploy/README.md](deploy/README.md) for Nginx + pm2 on Ubuntu.

Minimal flow:

```bash
git clone <repo> /var/www/win-predict-ai-admin
cd /var/www/win-predict-ai-admin
cp .env.example .env   # edit values; APP_URL=http://YOUR_IP
npm ci
npm run build
npm run import:leagues
pm2 start deploy/ecosystem.config.cjs
# configure Nginx from deploy/nginx.conf
```

## API

| Method | Path | Auth |
|---|---|---|
| GET | `/api/leagues.json` | public (CORS) — manifest for the main front |
| GET | `/api/tournaments` | public (CORS) |
| GET | `/api/tournaments/:id` | public (CORS) |
| POST | `/api/tournaments` | session |
| PATCH | `/api/tournaments/:id` | session |
| DELETE | `/api/tournaments/:id` | session |
| POST | `/api/tournaments/reorder` | session |
| GET | `/api/admins` | session |
| POST | `/api/admins` | superadmin |
| PATCH | `/api/admins/:id` | superadmin |
| DELETE | `/api/admins/:id` | superadmin |
| POST | `/api/auth/request` | — |
| GET | `/api/auth/verify?token=` | — |
| GET | `/api/auth/me` | session |
| POST | `/api/auth/logout` | session |

## Notes

- `endDateTo` is stored as `""` in SQLite when empty; the UI treats it as optional.
- Public front can read `GET /api/leagues.json` (CORS enabled) instead of GitHub Pages `leagues.json`. Prediction JSON files still come from the data repo on Pages.
- Deactivating an admin clears their sessions. You cannot deactivate yourself or the last active admin.
- Roles: SuperAdmin (`superadmin`, from `ADMIN_EMAILS` bootstrap) can add/delete admins; `admin` can use the panel but not delete admins. The last active SuperAdmin cannot be deleted.
