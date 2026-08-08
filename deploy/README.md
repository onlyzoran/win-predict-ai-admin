# VPS deploy (Ubuntu + Nginx + pm2)

Target example: `http://202.71.15.138` (Arcturus VPS).

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
NUXT_APP_URL=http://202.71.15.138
APP_URL=http://202.71.15.138
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
```

Generate a secret:

```bash
openssl rand -hex 32
```

## 3. Build & import

```bash
npm ci
npm run build
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
pm2 restart win-predict-ai-admin
```

## 5. Nginx

```bash
sudo cp deploy/nginx.conf /etc/nginx/sites-available/win-predict-ai-admin
sudo ln -sf /etc/nginx/sites-available/win-predict-ai-admin /etc/nginx/sites-enabled/
sudo nginx -t
sudo systemctl reload nginx
```

Open http://202.71.15.138

## 6. Updates

```bash
cd /var/www/win-predict-ai-admin
git pull
npm ci
npm run build
pm2 restart win-predict-ai-admin
```

## Domain later

Point an A record to the VPS IP, set `APP_URL=https://your.domain`, then:

```bash
sudo apt install -y certbot python3-certbot-nginx
sudo certbot --nginx -d your.domain
pm2 restart win-predict-ai-admin
```
