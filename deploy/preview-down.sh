#!/usr/bin/env bash
# Tear down an admin PR preview on this VPS.
# Usage: preview-down.sh <PR_NUMBER>
set -euo pipefail

PR="${1:?PR number required}"
if ! [[ "$PR" =~ ^[0-9]+$ ]]; then
  echo "ERROR: PR must be a number, got: $PR" >&2
  exit 1
fi

PREVIEW_ROOT="${PREVIEW_ROOT:-/var/www/win-predict-ai-admin-preview}"
NGINX_SNIPPET_DIR="${NGINX_SNIPPET_DIR:-/etc/nginx/win-predict-ai-admin-preview}"
DIR="${PREVIEW_ROOT}/pr-${PR}"
PM2_APP="admin-preview-pr-${PR}"
PM2_API="admin-preview-pr-${PR}-api"

pm2 delete "$PM2_APP" >/dev/null 2>&1 || true
pm2 delete "$PM2_API" >/dev/null 2>&1 || true
pm2 delete ecosystem.preview >/dev/null 2>&1 || true
pm2 save >/dev/null 2>&1 || true

rm -f "${NGINX_SNIPPET_DIR}/pr-${PR}.conf"
rm -rf "$DIR"

if [[ -d "$NGINX_SNIPPET_DIR" ]]; then
  nginx -t && systemctl reload nginx
fi

echo "Preview down: pr-${PR}"
