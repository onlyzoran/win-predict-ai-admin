# Win Predict AI Admin

Nuxt SPA for managing tournament metadata used by the main Win Predict front app.

## Stack

- Nuxt 4 (SPA, `ssr: false`)
- Tailwind CSS + shadcn-vue style components
- Pinia, VeeValidate + Zod, TanStack Table, vuedraggable
- Nitro API + Drizzle ORM + SQLite
- `@sidebase/nuxt-auth` (Credentials)

## Setup

```bash
cp .env.example .env
npm install
npm run db:setup
npm run dev
```

Open http://localhost:3000 — login with `ADMIN_EMAIL` / `ADMIN_PASSWORD` from `.env`.

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run build` | Production build |
| `npm run db:push` | Apply Drizzle schema to SQLite |
| `npm run db:seed` | Seed tournaments from `server/db/seed-data.json` |
| `npm run db:setup` | push + seed |

## Notes

- `endDateTo` is an optional latest possible end date (upper bound). Front uses `endDateTo || endDate` for progress/display.
- `GET /api/tournaments` is public; mutations require an authenticated session.
- Drag-and-drop reorder is enabled on the list when no sport/search filter is active.
