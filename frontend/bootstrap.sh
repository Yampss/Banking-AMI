#!/bin/bash
# bootstrap.sh — NexaBank Frontend Service
# Runs at every instance boot before nginx starts.
# The frontend has NO secrets — it serves static files only.
# API calls go from the browser to the ALB directly (same host, path-based routing).
set -euo pipefail

echo "[bootstrap] Starting frontend bootstrap..."

# ── Copy nginx config to the correct nginx directory ────────────────────────
cp /opt/nexabank/frontend/nginx.conf /etc/nginx/conf.d/nexabank.conf

# ── Remove the default nginx page (replaces the "Welcome to nginx" default) ──
rm -f /etc/nginx/conf.d/default.conf 2>/dev/null || true

# ── Verify the React build files exist ────────────────────────────────────────
if [ ! -f /usr/share/nginx/html/index.html ]; then
  echo "[bootstrap] ERROR: React build files not found at /usr/share/nginx/html/"
  echo "[bootstrap] Check that the Image Builder component ran correctly."
  exit 1
fi

echo "[bootstrap] Frontend bootstrap complete. nginx will now serve the React app."
