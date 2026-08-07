# Win Predict AI Admin

Nuxt admin app for tournament metadata. Runs as a Node server with SQLite and magic-link auth (Resend). Designed for VPS deploy (e.g. `http://202.71.15.138`).

## Stack

- Nuxt 4 (SPA client + Nitro API)
- SQLite (`better-sqlite3`)
- Magic link auth (allowlisted emails + Resend)
- Tailwind CSS + shadcn-vue style components
- Pinia, VeeValidate + Zod, TanStack Table, vuedraggable

## Setup (local)

```bash
cp .env.example .env
# set ADMIN_EMAILS, SESSION_SECRET; RESEND_API_KEY optional in dev
npm install
npm run import:leagues   # pulls leagues.json from win-predict-ai-data
npm run dev
```

Open http://localhost:3000 — enter an allowlisted email. Without `RESEND_API_KEY`, the magic link is printed in the server console.

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
| GET | `/api/tournaments` | public |
| GET | `/api/tournaments/:id` | public |
| POST | `/api/tournaments` | session |
| PATCH | `/api/tournaments/:id` | session |
| DELETE | `/api/tournaments/:id` | session |
| POST | `/api/tournaments/reorder` | session |
| POST | `/api/auth/request` | — |
| GET | `/api/auth/verify?token=` | — |
| GET | `/api/auth/me` | session |
| POST | `/api/auth/logout` | session |

## Notes

- `endDateTo` is stored as `""` in SQLite when empty; the UI treats it as optional.
- Public front can later read `GET /api/tournaments` instead of GitHub Pages `leagues.json`.
