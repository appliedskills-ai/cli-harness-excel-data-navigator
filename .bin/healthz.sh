#!/usr/bin/env bash
set -euo pipefail
source "$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)/lib.sh"
cd "$PROJECT_ROOT"

# Health checks: node present? package.json present? src/cli/main.mjs present?
have_node=false; command -v node >/dev/null 2>&1 && have_node=true
have_pkg=false;  [ -f package.json ] && have_pkg=true
have_main=false; [ -f src/cli/main.mjs ] && have_main=true

status="ok"
[ "$have_node" = true ] && [ "$have_pkg" = true ] && [ "$have_main" = true ] || status="fail"

if [ "${1:-}" = "--json" ]; then
  printf '{"status":"%s","checks":{"node":%s,"packageJson":%s,"cliMain":%s}}\n' \
    "$status" "$have_node" "$have_pkg" "$have_main"
  [ "$status" = "ok" ] || exit 1
  exit 0
fi

# Human summary
log "Health check (PROJECT_ROOT=$PROJECT_ROOT)"
printf '  node present:        %s\n' "$have_node"
printf '  package.json present: %s\n' "$have_pkg"
printf '  src/cli/main.mjs:     %s\n' "$have_main"
printf '  status:               %s\n' "$status"
[ "$status" = "ok" ] || exit 1
