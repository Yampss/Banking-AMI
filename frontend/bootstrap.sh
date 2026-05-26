#!/bin/bash

set -euo pipefail

echo "[bootstrap] Starting frontend bootstrap..."
cp /opt/nexabank/frontend/nginx.conf /etc/nginx/conf.d/nexabank.conf

rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

if [ ! -f /usr/share/nginx/html/index.html ]; then
  echo "[bootstrap] ERROR: React build files not found at /usr/share/nginx/html/"
  echo "[bootstrap] Check that the Image Builder component ran correctly."
  exit 1
fi

echo "[bootstrap] Frontend bootstrap complete. nginx will now serve the React app."

