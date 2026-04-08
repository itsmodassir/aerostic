#!/bin/bash
set -euo pipefail

APP_ROOT="/var/www/aimstors/frontend"

restart_next_app() {
  local app_dir="$1"
  local port="$2"
  local log_name="$3"
  local static_target="${4:-}"

  cd "${APP_ROOT}/${app_dir}"
  npm install --silent
  npm run build --silent

  if [ -n "${static_target}" ] && [ -d ".next/static" ]; then
    mkdir -p "${static_target}"
    rsync -a --delete ".next/static/" "${static_target}/"
  fi

  nohup npm run start -- -p "${port}" > "${log_name}" 2>&1 &
  echo "${app_dir} restarted on port ${port}."
}

sudo pkill -f "next-server" || true
echo "Frontend processes killed."

restart_next_app "app-dashboard" "3000" "dashboard.log" "/usr/share/nginx/html/app/static_runtime"
restart_next_app "admin-panel" "3002" "admin.log" "/usr/share/nginx/html/admin/static_runtime"
restart_next_app "reseller-panel" "3004" "reseller.log" "/usr/share/nginx/html/reseller/static_runtime"
