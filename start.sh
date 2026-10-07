#!/usr/bin/env bash
# Start the Nova dev server. node_modules is never kept in this workspace,
# so install it first if it is missing.
set -e
cd "$(dirname "$0")/app"
[ -d node_modules ] || npm install --no-audit --no-fund
exec npx vite --host 0.0.0.0 --port 5173 --strictPort
