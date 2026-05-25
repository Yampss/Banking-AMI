const { Pool } = require('pg');

/**
 * Production-grade pg Pool for RDS.
 *  - SSL required (RDS enforces it)
 *  - No process.exit on pool error — the pool auto-reconnects
 *  - Connection timeouts tuned for RDS Proxy
 */
const pool = new Pool({
  host:     process.env.DB_HOST,
  port:     parseInt(process.env.DB_PORT || '5432'),
  database: process.env.DB_NAME || 'users_db',
  user:     process.env.DB_USER || 'postgres',
  password: process.env.DB_PASSWORD,
  ssl:      { rejectUnauthorized: false }, // RDS + RDS Proxy require SSL
  max:                    10,
  min:                     2,
  connectionTimeoutMillis: 5000,   // fail fast if RDS Proxy unreachable
  idleTimeoutMillis:      30000,
  allowExitOnIdle:        false,
});

pool.on('error', (err) => {
  // Log but DO NOT exit — the pool will attempt to reconnect automatically
  console.error(JSON.stringify({
    event:   'pg_pool_error',
    service: 'user-service',
    message: err.message,
    ts:      new Date().toISOString(),
  }));
});

pool.on('connect', () => {
  console.log(JSON.stringify({ event: 'pg_connect', service: 'user-service', ts: new Date().toISOString() }));
});

module.exports = pool;
