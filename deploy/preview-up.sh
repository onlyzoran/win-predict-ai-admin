#!/usr/bin/env bash
# Start or refresh an admin PR preview on this VPS.
# Usage: preview-up.sh <PR_NUMBER>
# Expects source already synced to PREVIEW_ROOT/pr-$N/
set -euo pipefail

PR="${1:?PR number required}"
if ! [[ "$PR" =~ ^[0-9]+$ ]]; then
  echo "ERROR: PR must be a number, got: $PR" >&2
  exit 1
fi

PREVIEW_ROOT="${PREVIEW_ROOT:-/var/www/win-predict-ai-admin-preview}"
PROD_ENV="${PROD_ENV:-/var/www/win-predict-ai-admin/.env}"
DOMAIN="${DOMAIN:-win-predict-ai.com}"
NGINX_SNIPPET_DIR="${NGINX_SNIPPET_DIR:-/etc/nginx/win-predict-ai-admin-preview}"
DIR="${PREVIEW_ROOT}/pr-${PR}"
BASE_URL="/admin-preview/pr-${PR}/"
PUBLIC_ORIGIN="https://${DOMAIN}"
NUXT_PORT=$((41000 + PR))
API_PORT=$((51000 + PR))
PM2_APP="admin-preview-pr-${PR}"
PM2_API="admin-preview-pr-${PR}-api"

if [[ ! -d "$DIR" ]]; then
  echo "ERROR: missing preview tree ${DIR}" >&2
  exit 1
fi

if [[ ! -f "$PROD_ENV" ]]; then
  echo "ERROR: missing prod env ${PROD_ENV}" >&2
  exit 1
fi

env_get() {
  local key="$1"
  grep -E "^${key}=" "$PROD_ENV" | head -1 | cut -d= -f2- || true
}

ADMIN_EMAILS="$(env_get NUXT_ADMIN_EMAILS)"
ADMIN_EMAILS="${ADMIN_EMAILS:-$(env_get ADMIN_EMAILS)}"
SESSION_SECRET="$(env_get NUXT_SESSION_SECRET)"
SESSION_SECRET="${SESSION_SECRET:-$(env_get SESSION_SECRET)}"
RESEND_API_KEY="$(env_get NUXT_RESEND_API_KEY)"
RESEND_API_KEY="${RESEND_API_KEY:-$(env_get RESEND_API_KEY)}"
MAIL_FROM="$(env_get NUXT_MAIL_FROM)"
MAIL_FROM="${MAIL_FROM:-$(env_get MAIL_FROM)}"
MAIL_FROM="${MAIL_FROM:-onboarding@resend.dev}"

if [[ -z "$SESSION_SECRET" ]]; then
  echo "ERROR: SESSION_SECRET missing in ${PROD_ENV}" >&2
  exit 1
fi

mkdir -p "${DIR}/.data"
cat > "${DIR}/.env" <<EOF
NUXT_APP_BASE_URL=${BASE_URL}
APP_URL=${PUBLIC_ORIGIN}
NUXT_APP_URL=${PUBLIC_ORIGIN}
NUXT_DATABASE_PATH=${DIR}/.data/admin.sqlite
DATABASE_PATH=${DIR}/.data/admin.sqlite
NUXT_ADMIN_EMAILS=${ADMIN_EMAILS}
ADMIN_EMAILS=${ADMIN_EMAILS}
NUXT_RESEND_API_KEY=${RESEND_API_KEY}
RESEND_API_KEY=${RESEND_API_KEY}
NUXT_MAIL_FROM=${MAIL_FROM}
MAIL_FROM=${MAIL_FROM}
NUXT_SESSION_SECRET=${SESSION_SECRET}
SESSION_SECRET=${SESSION_SECRET}
API_PORT=${API_PORT}
NUXT_API_PORT=${API_PORT}
HOST=127.0.0.1
PORT=${NUXT_PORT}
NODE_ENV=production
EOF

cat > "${DIR}/ecosystem.preview.cjs" <<EOF
module.exports = {
  apps: [
    {
      name: '${PM2_APP}',
      cwd: '${DIR}',
      script: '.output/server/index.mjs',
      interpreter_args: '--env-file=.env',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        HOST: '127.0.0.1',
        PORT: '${NUXT_PORT}',
      },
    },
    {
      name: '${PM2_API}',
      cwd: '${DIR}/api',
      script: 'dist/main.js',
      interpreter_args: '--env-file=../.env',
      instances: 1,
      exec_mode: 'fork',
      env: {
        NODE_ENV: 'production',
        API_PORT: '${API_PORT}',
      },
    },
  ],
}
EOF

cd "$DIR"
npm ci
npm ci --prefix api
NUXT_APP_BASE_URL="${BASE_URL}" npm run build
npm run build:api

pm2 delete "$PM2_APP" >/dev/null 2>&1 || true
pm2 delete "$PM2_API" >/dev/null 2>&1 || true
pm2 start "${DIR}/ecosystem.preview.cjs"
pm2 save >/dev/null 2>&1 || true

mkdir -p "$NGINX_SNIPPET_DIR"
# Empty dir needs a placeholder so nginx include does not fail before first preview
if [[ ! -f "${NGINX_SNIPPET_DIR}/.keep.conf" ]]; then
  printf '# placeholder — real PR snippets are pr-*.conf\n' > "${NGINX_SNIPPET_DIR}/.keep.conf"
fi

# Ensure live nginx site includes preview snippets (idempotent; certbot keeps SSL).
NGINX_SITE="${NGINX_SITE:-/etc/nginx/sites-enabled/win-predict-ai-admin}"
if [[ -f "$NGINX_SITE" ]] && ! grep -q 'win-predict-ai-admin-preview' "$NGINX_SITE"; then
  if grep -q 'location /win-predict-ai-preview/' "$NGINX_SITE"; then
    sed -i '/location \/win-predict-ai-preview\//i\    include /etc/nginx/win-predict-ai-admin-preview/*.conf;\n' "$NGINX_SITE"
  else
    sed -i '/location \/admin\//a\n    include /etc/nginx/win-predict-ai-admin-preview/*.conf;' "$NGINX_SITE"
  fi
fi

cat > "${NGINX_SNIPPET_DIR}/pr-${PR}.conf" <<EOF
location = /admin-preview/pr-${PR} {
    return 301 /admin-preview/pr-${PR}/;
}

location /admin-preview/pr-${PR}/ {
    proxy_pass http://127.0.0.1:${NUXT_PORT}/admin-preview/pr-${PR}/;
    proxy_http_version 1.1;
    proxy_set_header Host \$host;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_set_header X-Forwarded-Proto \$scheme;
}
EOF

nginx -t
systemctl reload nginx

echo "Preview up: ${PUBLIC_ORIGIN}${BASE_URL} (nuxt :${NUXT_PORT}, api :${API_PORT})"
