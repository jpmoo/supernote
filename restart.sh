#!/usr/bin/env bash
# Pull latest from git, sync dependencies, and restart the systemd service.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

SERVICE_NAME="${SUPERNOTE_SERVICE:-supernote.service}"

echo "==> git pull"
git pull --ff-only

echo "==> sync deps"
if [ -f uv.lock ] && command -v uv >/dev/null 2>&1; then
  uv sync --all-extras
else
  ./.venv/bin/pip install -e ".[all]"
fi

echo "==> restart ${SERVICE_NAME}"
sudo systemctl restart "${SERVICE_NAME}"

echo "==> status"
sudo systemctl status "${SERVICE_NAME}" --no-pager -l | head -15
