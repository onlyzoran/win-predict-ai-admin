# Win Predict AI Admin

Static Nuxt SPA for managing tournament metadata in [`win-predict-ai-data`](https://github.com/onlyzoran/win-predict-ai-data). Saves go straight to `data/leagues.json` via the GitHub Contents API (commit on each change). The main front app reads that file from GitHub Pages.

## Stack

- Nuxt 4 (SPA, `ssr: false`, static generate)
- Tailwind CSS + shadcn-vue style components
- Pinia, VeeValidate + Zod, TanStack Table, vuedraggable
- GitHub PAT auth (sessionStorage) + Contents API

## Setup

```bash
cp .env.example .env
npm install
npm run dev
```

Open http://localhost:3000/win-predict-ai-admin/ — sign in with a GitHub personal access token that can read/write `data/leagues.json` in `onlyzoran/win-predict-ai-data` (fine-grained: Contents Read and write).

For local dev without the project Pages path prefix:

```bash
NUXT_APP_BASE_URL=/ npm run dev
```

## Scripts

| Script | Description |
|---|---|
| `npm run dev` | Dev server |
| `npm run generate` | Static build for GitHub Pages (`dist/`) |
| `npm run preview` | Preview the static build |

## Deploy

Push to `main` runs `.github/workflows/deploy.yml` and publishes to GitHub Pages at:

`https://onlyzoran.github.io/win-predict-ai-admin/`

Enable **Settings → Pages → Source: GitHub Actions** on the admin repo if it is not already set.

## Notes

- `endDateTo` is stored as `""` in `leagues.json` when empty; the UI treats it as optional.
- Each create / update / delete / reorder commits to `win-predict-ai-data` on `main`. GitHub Pages then updates `https://onlyzoran.github.io/win-predict-ai-data/data/leagues.json`.
- If someone else changed the file first, GitHub returns 409 — reload the list and retry.
