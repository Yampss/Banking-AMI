#!/bin/bash
# ============================================================
# setup-ai-service.sh
# Run on a fresh Ubuntu 22.04 EC2 instance:
#   sudo bash setup-ai-service.sh
# ============================================================
set -euo pipefail

REPO_URL="https://github.com/Yampss/Banking-AMI.git"
SERVICE="ai-service"
INSTALL_DIR="/opt/nexabank/${SERVICE}"

echo "========================================"
echo " NexaBank ${SERVICE} Setup"
echo "========================================"

export DEBIAN_FRONTEND=noninteractive
apt-get update -y -q
apt-get install -y -q curl git python3 unzip tar

echo "[2/8] Installing Node.js 20..."
curl -fsSL https://deb.nodesource.com/setup_20.x | bash - > /dev/null
apt-get install -y -q nodejs

echo "[3/8] Installing AWS CLI..."
if ! command -v aws &>/dev/null; then
  curl -s "https://awscli.amazonaws.com/awscli-exe-linux-x86_64.zip" -o /tmp/awscliv2.zip
  unzip -q /tmp/awscliv2.zip -d /tmp && /tmp/aws/install
  rm -rf /tmp/awscliv2.zip /tmp/aws
fi

echo "[4/8] Installing CloudWatch Agent..."
wget -q https://s3.amazonaws.com/amazoncloudwatch-agent/ubuntu/amd64/latest/amazon-cloudwatch-agent.deb -O /tmp/cwa.deb
dpkg -i /tmp/cwa.deb || apt-get -f install -y
rm -f /tmp/cwa.deb

echo "[5/8] Creating user and directories..."
useradd -r -s /usr/sbin/nologin nexabank 2>/dev/null || true
mkdir -p "${INSTALL_DIR}" /etc/nexabank
chown nexabank:nexabank "${INSTALL_DIR}"

echo "[6/8] Cloning repository..."
rm -rf /tmp/nexabank-repo
git clone --depth 1 "${REPO_URL}" /tmp/nexabank-repo
cp -r /tmp/nexabank-repo/services/${SERVICE}/. "${INSTALL_DIR}/"
rm -rf /tmp/nexabank-repo
chown -R nexabank:nexabank "${INSTALL_DIR}"
chmod +x "${INSTALL_DIR}/bootstrap.sh"

echo "[7/8] Installing npm dependencies (includes Bedrock SDK + Redis)..."
cd "${INSTALL_DIR}" && npm install --omit=dev --no-audit --silent

echo "[8/8] Configuring CloudWatch Agent..."
cp "${INSTALL_DIR}/cloudwatch-agent.json" /opt/aws/amazon-cloudwatch-agent/etc/amazon-cloudwatch-agent.json
systemctl enable amazon-cloudwatch-agent
systemctl start amazon-cloudwatch-agent || true

cp "${INSTALL_DIR}/nexabank-${SERVICE}.service" /etc/systemd/system/
systemctl daemon-reload
systemctl enable "nexabank-${SERVICE}"

echo "Running bootstrap..."
bash "${INSTALL_DIR}/bootstrap.sh"

echo "Starting service..."
systemctl start "nexabank-${SERVICE}"
sleep 3
systemctl status "nexabank-${SERVICE}" --no-pager

echo ""
echo "========================================"
echo " ${SERVICE} running on port 3004"
echo " Bedrock model: Claude 3 Haiku"
echo " Test: curl http://localhost:3004/health"
echo "========================================"
curl -s http://localhost:3004/health || echo "[WARN] Check: journalctl -u nexabank-${SERVICE} -n 50"
