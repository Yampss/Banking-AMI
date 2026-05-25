#!/bin/bash
# ============================================================
# setup-frontend.sh
# Run on a fresh Ubuntu 22.04 EC2 instance:
#   sudo bash setup-frontend.sh
#
# Installs nginx, builds the React app, serves it on port 80.
# No secrets needed — frontend only serves static files.
# API calls go from the browser to the ALB (same host, /api/* paths).
# ============================================================
set -euo pipefail

REPO_URL="https://github.com/Yampss/Banking-AMI.git"
INSTALL_DIR="/opt/nexabank/frontend"
HTML_DIR="/usr/share/nginx/html"

echo "========================================"
echo " NexaBank Frontend Setup"
echo "========================================"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y -q
apt-get install -y -q curl git unzip nginx

# ── Node.js 20 (needed to build React) ─────────────────────
echo "[2/7] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null
apt-get install -y -q nodejs
echo "Node: $(node --version)"

# ── AWS CLI (for CloudWatch Agent later) ───────────────────
echo "[3/7] Installing AWS CLI..."
if ! command -v aws &>/dev/null; then
  curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
  unzip -q /tmp/awscliv2.zip -d /tmp && /tmp/aws/install
  rm -rf /tmp/awscliv2.zip /tmp/aws
fi

# ── CloudWatch Agent ────────────────────────────────────────
echo "[4/7] Installing CloudWatch Agent..."
wget -q https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb -O /tmp/cwa.deb
dpkg -i /tmp/cwa.deb || apt-get -f install -y
rm -f /tmp/cwa.deb

# ── Clone repo and build React app ─────────────────────────
echo "[5/7] Cloning repository and building React app..."
mkdir -p "${INSTALL_DIR}"
rm -rf /tmp/nexabank-repo
git clone --depth 1 "${REPO_URL}" /tmp/nexabank-repo
cp -r /tmp/nexabank-repo/frontend/. "${INSTALL_DIR}/"
chmod +x "${INSTALL_DIR}/bootstrap.sh"

echo "  → Running npm install..."
cd "${INSTALL_DIR}"
npm install --no-audit --silent

echo "  → Building React app (NODE_ENV=production)..."
NODE_ENV=production npm run build

# ── Deploy build to nginx html root ────────────────────────
echo "[6/7] Deploying React build to nginx..."
rm -rf "${HTML_DIR:?}"/*
cp -r "${INSTALL_DIR}/build/"* "${HTML_DIR}/"
echo "  → $(ls ${HTML_DIR} | wc -l) files deployed"

# Remove node_modules to keep the AMI lean
rm -rf "${INSTALL_DIR}/node_modules" "${INSTALL_DIR}/build"
rm -rf /tmp/nexabank-repo

# ── Configure nginx ─────────────────────────────────────────
echo "[7/7] Configuring nginx..."
# Remove default nginx page
rm -f /etc/nginx/sites-enabled/default
rm -f /etc/nginx/conf.d/default.conf

# Install our nginx config
cp "${INSTALL_DIR}/nginx.conf" /etc/nginx/conf.d/nexabank.conf

# Test nginx config
nginx -t

# ── CloudWatch Agent config ──────────────────────────────────
cp "${INSTALL_DIR}/cloudwatch-agent.json" /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
systemctl enable amazon-cloudwatch-agent
systemctl start amazon-cloudwatch-agent || true

# ── Systemd service for nginx ───────────────────────────────
cp "${INSTALL_DIR}/nexabank-frontend.service" /etc/systemd/system/
systemctl daemon-reload
# Disable the default nginx service (our custom unit manages it)
systemctl disable nginx || true
systemctl stop nginx || true
systemctl enable nexabank-frontend
systemctl start nexabank-frontend
sleep 2
systemctl status nexabank-frontend --no-pager

echo ""
echo "========================================"
echo " Frontend running on port 80"
echo " React app is built and served by nginx"
echo " Test: curl http://localhost/health"
echo "========================================"
curl -s http://localhost/health || echo "[WARN] Check: journalctl -u nexabank-frontend -n 50 && nginx -t"
