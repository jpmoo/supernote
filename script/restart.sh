#!/usr/bin/env bash
# Pull latest from git, sync dependencies, and restart the systemd service.
set -euo pipefail

cd "$(dirname "$0")/.."

echo "==> git pull"
git pull --ff-only

echo "==> sync deps"
if [ -f uv.lock ] && command -v uv >/dev/null 2>&1; then
  uv sync --all-extras
else
  ./.venv/bin/pip install -e ".[all]"
fi

echo "==> restart service"
sudo systemctl restart supernote.service

echo "==> status"
sudo systemctl status supernote.service --no-pager -l | head -15
