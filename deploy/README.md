# VPS deploy (Ubuntu + Nginx + pm2)

Production: `https://win-predict-ai.com` (VPS `202.71.15.138`).

## 1. App directory

```bash
sudo apt update
sudo apt install -y build-essential python3 git nginx
sudo mkdir -p /var/www
sudo chown "$USER":"$USER" /var/www
git clone <YOUR_REPO_URL> /var/www/win-predict-ai-admin
cd /var/www/win-predict-ai-admin
```

If the package uses GitHub Packages (`@onlyzoran/...`), configure npm auth before `npm ci` (`.npmrc` + token).

## 2. Environment

```bash
cp .env.example .env
nano .env
```

Required:

```env
NUXT_APP_URL=https://win-predict-ai.com
APP_URL=https://win-predict-ai.com
NUXT_DATABASE_PATH=/var/www/win-predict-ai-admin/.data/admin.sqlite
DATABASE_PATH=/var/www/win-predict-ai-admin/.data/admin.sqlite
NUXT_ADMIN_EMAILS=you@example.com,other@example.com
ADMIN_EMAILS=you@example.com,other@example.com
# Bootstraps missing users on startup; manage admins afterwards in the UI
NUXT_RESEND_API_KEY=re_xxx
RESEND_API_KEY=re_xxx
NUXT_MAIL_FROM=onboarding@resend.dev
MAIL_FROM=onboarding@resend.dev
NUXT_SESSION_SECRET=<long-random-string>
SESSION_SECRET=<long-random-string>
API_PORT=3001
NUXT_API_PORT=3001
```

Generate a secret:

```bash
openssl rand -hex 32
```

## 3. Build & import

```bash
npm ci
npm ci --prefix api
npm run build
npm run build:api
npm run import:leagues
```

## 4. pm2

```bash
pm2 start deploy/ecosystem.config.cjs
pm2 save
pm2 startup
```

Useful:

```bash
pm2 logs win-predict-ai-admin
pm2 logs win-predict-ai-admin-api
pm2 restart win-predict-ai-admin
pm2 restart win-predict-ai-admin-api
```

## 5. Nginx

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/win-predict-ai-admin
sudo ln -sf /etc/nginx/sites-available/win-predict-ai-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Open https://win-predict-ai.com (or http://202.71.15.138 before DNS/TLS).

## 6. Updates

```bash
cd /var/www/win-predict-ai-admin
git pull
npm ci
npm ci --prefix api
npm run build
npm run build:api
pm2 restart deploy/ecosystem.config.cjs
# or: pm2 restart win-predict-ai-admin win-predict-ai-admin-api
```

If the Nest process is not registered yet:

```bash
pm2 start deploy/ecosystem.config.cjs
pm2 save
```

## Domain + HTTPS (`win-predict-ai.com`)

1. **Namecheap → Advanced DNS** (delete Parking / URL Redirect for `@` / `www` if present):

   | Type | Host | Value | TTL |
   | --- | --- | --- | --- |
   | A | `@` | `202.71.15.138` | Automatic or 5 min |
   | A | `www` | `202.71.15.138` | Automatic or 5 min |

2. Wait until `dig +short win-predict-ai.com` returns `202.71.15.138`.

3. Enable on the VPS (from this repo via Actions, or SSH):

```bash
# GitHub Actions (uses VPS_* secrets):
gh workflow run enable-domain.yml -R onlyzoran/win-predict-ai-admin

# Or on the VPS as root, from /var/www/win-predict-ai-admin:
sudo bash deploy/enable-domain.sh
```

The script installs `deploy/nginx.conf`, sets `APP_URL`/`NUXT_APP_URL` to `https://win-predict-ai.com`, runs certbot (HTTP→HTTPS redirect), and restarts pm2.

| URL | What |
| --- | --- |
| `https://win-predict-ai.com/` | Public app |
| `https://win-predict-ai.com/admin/` | Admin |
| `https://win-predict-ai.com/api/leagues.json` | Public API |
| `https://win-predict-ai.com/ops/` | Orchestrator status |
