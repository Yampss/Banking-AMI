#!/bin/bash
# DB setup script — run via SSM on any backend EC2 instance
set -euo pipefail

echo "=== Installing postgresql-client ==="
apt-get install -y -q postgresql-client 2>&1 | tail -2

echo "=== Fetching DB credentials from Secrets Manager ==="
SECRET=$(aws secretsmanager get-secret-value \
  --secret-id "nexabank/production" \
  --region us-east-1 \
  --query SecretString --output text)

DB_HOST=$(echo "$SECRET" | python3 -c "import sys,json; print(json.load(sys.stdin)['db_host'])")
DB_PASS=$(echo "$SECRET" | python3 -c "import sys,json; print(json.load(sys.stdin)['db_password'])")
DB_USER=$(echo "$SECRET" | python3 -c "import sys,json; print(json.load(sys.stdin)['db_user'])")

echo "Host: $DB_HOST | User: $DB_USER"

echo "=== Testing connection WITHOUT SSL ==="
PGPASSWORD="$DB_PASS" PGSSLMODE=disable psql -h "$DB_HOST" -U "$DB_USER" \
  -d postgres -c "SELECT version();" 2>&1 | head -5 \
  && echo "NO-SSL: WORKS" || echo "NO-SSL: FAILED"

echo "=== Testing connection WITH SSL ==="
PGPASSWORD="$DB_PASS" PGSSLMODE=require psql -h "$DB_HOST" -U "$DB_USER" \
  -d postgres -c "SELECT version();" 2>&1 | head -5 \
  && echo "SSL-REQUIRE: WORKS" || echo "SSL-REQUIRE: FAILED"

echo "=== Creating databases ==="
for DB in users_db accounts_db transactions_db chat_history_db; do
  PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d postgres \
    -c "CREATE DATABASE $DB;" 2>&1 \
    && echo "$DB: CREATED" \
    || echo "$DB: already exists or failed (ok)"
done

echo "=== Verifying databases ==="
PGPASSWORD="$DB_PASS" psql -h "$DB_HOST" -U "$DB_USER" -d postgres \
  -c "\l" 2>&1 | grep -E "users_db|accounts_db|transactions_db|chat_history|Name" || true

echo "=== Restarting services ==="
for SVC in nexabank-user-service nexabank-account-service nexabank-transaction-service nexabank-ai-service; do
  systemctl reset-failed "$SVC" 2>/dev/null || true
  systemctl start "$SVC" 2>&1 && echo "$SVC: started" || echo "$SVC: not found on this instance (ok)"
done

sleep 5
echo "=== Service status ==="
for SVC in nexabank-user-service nexabank-account-service nexabank-transaction-service nexabank-ai-service; do
  STATUS=$(systemctl is-active "$SVC" 2>/dev/null || echo "not-found")
  echo "  $SVC: $STATUS"
done
